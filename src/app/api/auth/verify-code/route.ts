import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { hashCode, isAllowedOrigin, rateLimited, sleep } from "@/lib/driver-admin";

/**
 * POST /api/auth/verify-code — driver access-code sign-in.
 *
 * Body: { code: "123456" }. Hashes the code and looks it up across all schools
 * (Admin SDK collectionGroup over the stored `codeHash`), confirms the owning
 * user is a `staff` driver, and mints a Firebase custom token the client
 * exchanges via `signInWithCustomToken`.
 *
 * Security: a uniform ~400ms delay runs on success AND failure (no timing
 * oracle), a per-IP rate limit throttles brute force, cross-origin requests are
 * rejected (CSRF), and each code doc keeps an attempts counter that locks the
 * code for 15 minutes once the owner-role gate fails too often. The client-side
 * lockout on the login page is UX; this is the real backstop.
 */
const UNIFORM_DELAY_MS = 400;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
/** Owner-role failures before the code locks for CODE_LOCK_MS. */
const MAX_CODE_ATTEMPTS = 10;
const CODE_LOCK_MS = 15 * 60 * 1000;

/** Thrown inside the code-doc transaction when its lockout is still active. */
class CodeLockedError extends Error {}

/**
 * True while a lock is active. `lockedUntil` is stored as epoch millis; a
 * Firestore Timestamp (legacy/defensive) is also recognized.
 */
function lockActive(lockedUntil: unknown, now = Date.now()): boolean {
  if (typeof lockedUntil === "number") return lockedUntil > now;
  if (lockedUntil instanceof Timestamp) return lockedUntil.toMillis() > now;
  return false;
}

/** One-line structured failure log — event, reason, ip; never the code. */
function logFailure(reason: string, ip: string): void {
  console.info(JSON.stringify({ event: "code_verify_failed", reason, ip }));
}

export async function POST(request: Request) {
  // Delay first, so a malformed, rejected, or rate-limited request takes just as
  // long as a valid one.
  await sleep(UNIFORM_DELAY_MS);

  // CSRF hardening: browsers attach Origin to cross-origin requests, so reject
  // anything that isn't the app itself. A missing Origin (same-origin
  // form/curl) is allowed.
  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "invalid_request" }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (rateLimited(ip, RATE_LIMIT, RATE_WINDOW_MS)) {
    logFailure("rate_limited", ip);
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let code: string;
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code.trim() : "";
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(code)) {
    return Response.json({ error: "invalid_code" }, { status: 400 });
  }

  const hit = await adminDb
    .collectionGroup("driverCodes")
    .where("codeHash", "==", hashCode(code))
    .limit(1)
    .get();

  if (hit.empty) {
    // Nothing hashes to this code — wrong code.
    logFailure("no_match", ip);
    return Response.json({ error: "invalid_code" }, { status: 401 });
  }

  const codeDoc = hit.docs[0];
  const uid = codeDoc.id;

  // The hash already matched, so the only remaining failure mode is the
  // owner-role gate. Decide and write the counter/lockout atomically against a
  // fresh read of the code doc.
  let roleIsStaff = false;
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(codeDoc.ref);
      if (!snap.exists) return;
      const data = snap.data() ?? {};
      if (lockActive(data.lockedUntil)) {
        // Still inside the lockout window — refuse without minting or counting.
        throw new CodeLockedError();
      }
      const profile = await tx.get(adminDb.doc(`users/${uid}`));
      roleIsStaff = profile.data()?.role === "staff";
      if (roleIsStaff) {
        // Full success: clear the counter and any expired lockout. lockedUntil
        // is a plain epoch-millis number — not a Firestore server timestamp —
        // so it stays directly comparable to Date.now(); the custom token is
        // minted outside the transaction, after this commit.
        tx.update(codeDoc.ref, { attempts: 0, lockedUntil: FieldValue.delete() });
        return;
      }
      // A code must never mint a director (or unknown) session — count the
      // attempt toward a per-code lockout so a known-valid code can't be
      // hammered through the role gate either.
      const attempts = (typeof data.attempts === "number" ? data.attempts : 0) + 1;
      if (attempts >= MAX_CODE_ATTEMPTS) {
        tx.update(codeDoc.ref, { attempts: 0, lockedUntil: Date.now() + CODE_LOCK_MS });
      } else {
        tx.update(codeDoc.ref, { attempts });
      }
    });
  } catch (err) {
    if (err instanceof CodeLockedError) {
      logFailure("locked", ip);
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }
    throw err;
  }

  if (!roleIsStaff) {
    logFailure("not_staff", ip);
    return Response.json({ error: "invalid_code" }, { status: 401 });
  }

  const token = await adminAuth.createCustomToken(uid);
  return Response.json({ token });
}

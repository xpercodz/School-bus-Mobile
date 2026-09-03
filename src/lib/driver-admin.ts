/**
 * Server-only helpers for the driver access-code feature. Shared by the driver
 * API routes and imported only by route handlers — never by client components.
 *
 * Codes are 6-digit numeric (easiest for drivers who may not read English),
 * generated server-side with a global-uniqueness re-query so collisions are
 * impossible across all schools. Only an HMAC-SHA256 hash of each code (keyed
 * with the server-side CODE_PEPPER) is stored at rest — the plaintext code
 * exists solely in the API response at create/regenerate time.
 */
import { createHmac, randomInt, randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

/** How many attempts before giving up on a collision-free code. */
const MAX_CODE_TRIES = 20;

/** The app's canonical origin; cross-origin auth requests are rejected. */
const ALLOWED_ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

/** An HTTP-mapped error thrown by these helpers; routes map it to a status. */
export class DriverAdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Lazy accessor for the code-hashing pepper — read at call time so importing
 * this module (e.g. in tests) doesn't crash when the env var is absent. Fails
 * closed: hashing without a pepper is a security bug, so we refuse loudly.
 */
function getPepper(): string {
  const p = process.env.CODE_PEPPER;
  if (!p) throw new Error("CODE_PEPPER env var is required (driver access-code hashing).");
  return p;
}

/** HMAC-SHA256 (hex) of a code with the server pepper — the stored form. */
export function hashCode(code: string): string {
  return createHmac("sha256", getPepper()).update(code).digest("hex");
}

/**
 * Allow a request only when its Origin header (if present) is the app itself.
 * Browsers attach Origin to cross-origin requests, so a mismatch means a
 * cross-site call; a missing Origin (same-origin form/curl) is allowed.
 */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin === null || origin === ALLOWED_ORIGIN;
}

/**
 * Resolve the caller's tenant from their Bearer ID token and require they are a
 * director. The token carries no schoolId — the source of truth is the caller's
 * `users/{uid}` profile, read fresh (not from token claims).
 */
export async function requireDirector(
  request: Request,
): Promise<{ uid: string; schoolId: string }> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) throw new DriverAdminError(401, "Missing authorization token.");

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    throw new DriverAdminError(401, "Invalid or expired token.");
  }

  const profile = await adminDb.doc(`users/${decoded.uid}`).get();
  const data = profile.data();
  if (!data || data.role !== "director" || typeof data.schoolId !== "string") {
    throw new DriverAdminError(403, "Only a school director can manage drivers.");
  }
  return { uid: decoded.uid, schoolId: data.schoolId };
}

/** A 6-digit code that isn't already assigned to any driver, in any school. */
export async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < MAX_CODE_TRIES; i++) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const hit = await adminDb
      .collectionGroup("driverCodes")
      .where("codeHash", "==", hashCode(code))
      .limit(1)
      .get();
    if (hit.empty) return code;
  }
  throw new DriverAdminError(500, "Couldn't allocate a unique driver code.");
}

/**
 * Create a driver account: an Auth user with a placeholder email and no password
 * (the code is the only credential; directors keep email/password), a staff
 * profile, and a driverCodes doc — one batch. Cleans up the orphaned Auth user
 * if the Firestore write fails. Returns the plaintext code once; the doc stores
 * only its hash. `actorUid` names the director who created the account for the
 * audit trail, defaulting to "system" for callers that don't pass one.
 */
export async function createDriver(
  name: string,
  schoolId: string,
  actorUid: string = "system",
): Promise<{ uid: string; code: string }> {
  const user = await adminAuth.createUser({
    email: `${randomUUID()}@drivers.invalid`,
    displayName: name,
    emailVerified: false,
  });

  const code = await generateUniqueCode();
  const batch = adminDb.batch();
  batch.set(adminDb.doc(`users/${user.uid}`), {
    role: "staff",
    schoolId,
    email: user.email,
    displayName: name,
  });
  batch.set(adminDb.doc(`schools/${schoolId}/driverCodes/${user.uid}`), {
    codeHash: hashCode(code),
  });

  try {
    await batch.commit();
  } catch (err) {
    await adminAuth.deleteUser(user.uid).catch(() => {});
    throw err;
  }

  // Best-effort audit after the commit — a logging hiccup must never surface as
  // a failed creation. The code itself never enters the audit trail.
  await logAudit({
    schoolId,
    actorUid,
    event: "driver.created",
    detail: `driverUid=${user.uid}`,
  }).catch((err) => console.error("audit write failed:", err));

  return { uid: user.uid, code };
}

/**
 * Rotate an existing driver's code to a fresh unique one. Upserts the code doc,
 * so it also serves as "give a code to a staff account that has none". Returns
 * the plaintext code once; the doc stores only its hash.
 */
export async function rotateCode(
  uid: string,
  schoolId: string,
  actorUid: string = "system",
): Promise<string> {
  const code = await generateUniqueCode();
  await adminDb
    .doc(`schools/${schoolId}/driverCodes/${uid}`)
    .set({ codeHash: hashCode(code) });

  // Best-effort audit (as in createDriver); never includes the code.
  await logAudit({
    schoolId,
    actorUid,
    event: "driver.code_regenerated",
    detail: `driverUid=${uid}`,
  }).catch((err) => console.error("audit write failed:", err));

  return code;
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Tiny in-memory sliding-window rate limiter (per IP). Resets on server restart
// or redeploy — acceptable for throttling, not a durable store. Per-instance
// only, and IPs come from `x-forwarded-for`: on Vercel that header is written
// by the platform (trustworthy), but when self-hosting behind a reverse proxy
// make sure it is the only hop appending XFF, or a client could spoof a fresh
// IP per request and slip past the throttle.
const ipHits = new Map<string, number[]>();

/** Cap on tracked IPs; the oldest entry is evicted past this. */
const MAX_TRACKED_IPS = 10_000;

/** Record a hit; return true when the caller is over `limit` in `windowMs`. */
export function rateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const hits = (ipHits.get(ip) ?? []).filter((t) => t > windowStart);
  if (hits.length >= limit) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  // Bound memory growth: past the cap, evict the oldest-inserted IP. Map
  // iteration is insertion-ordered, so the first key is the one idle longest.
  if (ipHits.size > MAX_TRACKED_IPS) {
    ipHits.delete(ipHits.keys().next().value as string);
  }
  return false;
}

/**
 * Append a director-audit event under `schools/{schoolId}/audit` — one doc per
 * event (uuid id) plus a console line. Firestore rules are being tightened so
 * clients can read but never write that collection; the Admin SDK writes bypass
 * rules. Never pass codes or passwords in `detail`.
 */
export async function logAudit(opts: {
  schoolId: string;
  actorUid: string;
  event: string;
  detail?: string;
}): Promise<void> {
  const { schoolId, actorUid, event, detail } = opts;
  await adminDb
    .doc(`schools/${schoolId}/audit/${randomUUID()}`)
    .set({
      event,
      actorUid,
      at: FieldValue.serverTimestamp(),
      ...(detail !== undefined ? { detail } : {}),
    });
  console.info(`audit ${event} school=${schoolId} actor=${actorUid}`);
}

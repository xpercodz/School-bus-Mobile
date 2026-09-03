import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { isAllowedOrigin, rateLimited, sleep } from "@/lib/driver-admin";

/**
 * POST /api/auth/director-sign-in — director email/password sign-in.
 *
 * Body: { email, password }. Verifies the credentials with Firebase Auth
 * (identitytoolkit REST, web API key), then requires the owning user's
 * `users/{uid}` profile to be a `director` before minting a custom token the
 * client exchanges via `signInWithCustomToken`.
 *
 * Why server-side: the driver access-code route gates role server-side too, so
 * the Director tab must never sign a staff/driver account into a session just
 * because it has an email/password — the client then bounces it to the driver
 * app with no explanation. A wrong-role account gets a clear 403 instead.
 *
 * Security: a uniform ~400ms delay runs on success AND failure (no timing
 * oracle), a per-IP rate limit throttles brute force, and cross-origin requests
 * are rejected (CSRF) — the same backstops as /api/auth/verify-code. Firebase
 * Auth itself also throttles repeated password failures for an account.
 */
const UNIFORM_DELAY_MS = 400;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

/** Firebase Auth REST error codes we care about. */
const TOO_MANY_ATTEMPTS = "TOO_MANY_ATTEMPTS_TRY_LATER";

/** One-line structured failure log — event, reason, ip; never email/password. */
function logFailure(reason: string, ip: string): void {
  console.info(JSON.stringify({ event: "director_signin_failed", reason, ip }));
}

export async function POST(request: Request) {
  // Delay first, so a malformed, rejected, or rate-limited request takes just as
  // long as a valid one.
  await sleep(UNIFORM_DELAY_MS);

  // CSRF hardening: same stance as /api/auth/verify-code — reject cross-origin
  // requests; a missing Origin (same-origin form/curl) is allowed.
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

  let email: string;
  let password: string;
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    email = typeof body.email === "string" ? body.email.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!email || !password) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  // Check the credentials against Firebase Auth. The web API key is public by
  // design (same key the client SDK uses); the role gate below is the control.
  let authData: { localId?: string; error?: { message?: string } };
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    authData = (await res.json().catch(() => ({}))) as typeof authData;
    if (!res.ok) {
      const code = authData?.error?.message ?? "";
      if (code === TOO_MANY_ATTEMPTS) {
        logFailure("too_many_attempts", ip);
        return Response.json({ error: "too_many_attempts" }, { status: 429 });
      }
      logFailure("invalid_credentials", ip);
      return Response.json({ error: "invalid_credentials" }, { status: 401 });
    }
  } catch {
    return Response.json({ error: "server_error" }, { status: 502 });
  }

  const uid = authData.localId;
  if (!uid) {
    return Response.json({ error: "server_error" }, { status: 502 });
  }

  // Role gate: only a director profile may mint a director session.
  const profile = await adminDb.doc(`users/${uid}`).get();
  if (profile.data()?.role !== "director") {
    logFailure("not_director", ip);
    return Response.json({ error: "not_director" }, { status: 403 });
  }

  const token = await adminAuth.createCustomToken(uid);
  return Response.json({ token });
}

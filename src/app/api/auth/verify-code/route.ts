import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { rateLimited, sleep } from "@/lib/driver-admin";

/**
 * POST /api/auth/verify-code — driver access-code sign-in.
 *
 * Body: { code: "123456" }. Looks up the code across all schools (Admin SDK
 * collectionGroup), confirms the owning user is a `staff` driver, and mints a
 * Firebase custom token the client exchanges via `signInWithCustomToken`.
 *
 * Security: a uniform ~400ms delay runs on success AND failure (no timing
 * oracle), and a per-IP rate limit throttles brute force. The client-side
 * lockout on the login page is UX; this is the real backstop.
 */
const UNIFORM_DELAY_MS = 400;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  // Delay first, so a malformed or rate-limited request takes just as long as a
  // valid one.
  await sleep(UNIFORM_DELAY_MS);

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (rateLimited(ip, RATE_LIMIT, RATE_WINDOW_MS)) {
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
    .where("code", "==", code)
    .limit(1)
    .get();

  if (hit.empty) {
    return Response.json({ error: "invalid_code" }, { status: 401 });
  }

  const uid = hit.docs[0].id;
  const profile = await adminDb.doc(`users/${uid}`).get();
  if (profile.data()?.role !== "staff") {
    // A code must never mint a director (or unknown) session.
    return Response.json({ error: "invalid_code" }, { status: 401 });
  }

  const token = await adminAuth.createCustomToken(uid);
  return Response.json({ token });
}

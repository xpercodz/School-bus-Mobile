/**
 * Server-only helpers for the driver access-code feature. Shared by the driver
 * API routes and imported only by route handlers — never by client components.
 *
 * Codes are 6-digit numeric (easiest for drivers who may not read English) and
 * generated server-side with a global-uniqueness re-query so collisions are
 * impossible across all schools.
 */
import { randomInt, randomUUID } from "node:crypto";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

/** How many attempts before giving up on a collision-free code. */
const MAX_CODE_TRIES = 20;

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
      .where("code", "==", code)
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
 * if the Firestore write fails.
 */
export async function createDriver(
  name: string,
  schoolId: string,
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
  batch.set(adminDb.doc(`schools/${schoolId}/driverCodes/${user.uid}`), { code });

  try {
    await batch.commit();
  } catch (err) {
    await adminAuth.deleteUser(user.uid).catch(() => {});
    throw err;
  }
  return { uid: user.uid, code };
}

/**
 * Rotate an existing driver's code to a fresh unique one. Upserts the code doc,
 * so it also serves as "give a code to a staff account that has none".
 */
export async function rotateCode(uid: string, schoolId: string): Promise<string> {
  const code = await generateUniqueCode();
  await adminDb.doc(`schools/${schoolId}/driverCodes/${uid}`).set({ code });
  return code;
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Tiny in-memory sliding-window rate limiter (per IP). Resets on server restart
// or redeploy — acceptable for throttling, not a durable store.
const ipHits = new Map<string, number[]>();

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
  return false;
}

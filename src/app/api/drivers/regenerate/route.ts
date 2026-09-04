import { DriverAdminError, requireDirector, rotateCode } from "@/lib/driver-admin";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/drivers/regenerate — director rotates a driver's access code
 * (forgotten/lost), or issues a first code to a staff account that has none.
 *
 * Requires `Authorization: Bearer <director ID token>`. Body: { uid }. The
 * target must be a `staff` user of the caller's own school — cross-school
 * regeneration is the one privilege-escalation surface.
 */
export async function POST(request: Request) {
  let schoolId: string;
  let actorUid: string;
  try {
    ({ uid: actorUid, schoolId } = await requireDirector(request));
  } catch (err) {
    if (err instanceof DriverAdminError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  let uid: string;
  try {
    const body = (await request.json()) as { uid?: unknown };
    uid = typeof body.uid === "string" ? body.uid : "";
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!uid) {
    return Response.json({ error: "invalid_uid" }, { status: 400 });
  }

  const target = await adminDb.doc(`users/${uid}`).get();
  const data = target.data();
  if (!data || data.role !== "staff" || data.schoolId !== schoolId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const code = await rotateCode(uid, schoolId, actorUid);
  return Response.json({ code });
}

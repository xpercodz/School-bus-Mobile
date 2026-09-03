import { createDriver, DriverAdminError, requireDirector } from "@/lib/driver-admin";

/**
 * POST /api/drivers — director creates a driver account.
 *
 * Requires `Authorization: Bearer <director ID token>`. Body: { name }. Returns
 * the new driver's uid + auto-generated access code. Driver accounts can't be
 * created from the client SDK (Firebase Auth users and `users` profiles are
 * Admin-SDK-only), so this is the one write path.
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

  let name: string;
  try {
    const body = (await request.json()) as { name?: unknown };
    name = typeof body.name === "string" ? body.name.trim() : "";
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!name || name.length > 80) {
    return Response.json({ error: "invalid_name" }, { status: 400 });
  }

  const driver = await createDriver(name, schoolId, actorUid);
  return Response.json(driver, { status: 201 });
}

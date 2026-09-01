import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Cached users/{uid} → schoolId lookup. */
const schoolIdCache = new Map<string, string>();

/**
 * Resolve the caller's tenant id from their profile doc (`users/{uid}.schoolId`),
 * cached per uid. Lives in its own module so both the data hooks and the shared
 * cursor-pagination hook can use it without a module cycle.
 */
export async function fetchSchoolId(uid: string): Promise<string | null> {
  const cached = schoolIdCache.get(uid);
  if (cached) return cached;
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    const schoolId = (snap.data()?.schoolId as string | undefined) ?? null;
    if (schoolId) schoolIdCache.set(uid, schoolId);
    return schoolId;
  } catch {
    return null;
  }
}

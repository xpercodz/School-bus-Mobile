/**
 * Clear-data script — wipes the seeded demo data from Firestore.
 *
 * Deletes every school's subcollections (students, buses, runs, attendance),
 * then the school docs. By default it KEEPS the `users/` profiles so sign-in
 * still works; pass `--users` to also delete all user profiles + Auth accounts.
 *
 * Requires the same service-account key as seed.mjs:
 *   - FIREBASE_SERVICE_ACCOUNT (path) or ./service-account.json
 *
 * Usage:
 *   node scripts/clear-data.mjs            # clear all school data
 *   node scripts/clear-data.mjs --users    # also wipe users/auth
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const SERVICE_ACCOUNT =
  process.env.FIREBASE_SERVICE_ACCOUNT ??
  path.join(process.cwd(), "service-account.json");
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "school-bus-a4f23";
const WIPE_USERS = process.argv.includes("--users");

if (!existsSync(SERVICE_ACCOUNT)) {
  console.error(
    `No service-account key found at ${SERVICE_ACCOUNT}.\n` +
      "Set FIREBASE_SERVICE_ACCOUNT or drop service-account.json in the project root.",
  );
  process.exit(1);
}

/** Delete every doc in a collection (batched), returning how many were removed. */
async function deleteCollection(db, collectionPath) {
  const ref = db.collection(collectionPath);
  let total = 0;
  for (;;) {
    const snap = await ref.limit(500).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    total += snap.size;
  }
  return total;
}

async function clear() {
  const app = initializeApp({
    credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT, "utf8"))),
    projectId: PROJECT_ID,
  });
  const db = getFirestore(app);

  const schools = await db.collection("schools").get();
  console.log(`Found ${schools.size} school(s).`);

  for (const school of schools.docs) {
    const base = `schools/${school.id}`;
    for (const sub of ["attendance", "runs", "students", "buses"]) {
      const n = await deleteCollection(db, `${base}/${sub}`);
      if (n > 0) console.log(`- ${base}/${sub}: ${n} docs`);
    }
    await school.ref.delete();
    console.log(`- schools/${school.id} (school doc)`);
  }

  if (WIPE_USERS) {
    const auth = getAuth(app);
    const users = await db.collection("users").get();
    const batch = db.batch();
    users.forEach((d) => batch.delete(d.ref));
    if (!users.empty) await batch.commit();
    console.log(`- users: ${users.size} profile docs`);
    // Also delete the underlying Auth accounts so those emails can be reused.
    const authUsers = await auth.listUsers(1000);
    for (const u of authUsers.users) {
      try {
        await auth.deleteUser(u.uid);
        console.log(`- auth user ${u.email}`);
      } catch (err) {
        console.warn(`! could not delete auth user ${u.email}: ${err.code}`);
      }
    }
  }

  console.log(WIPE_USERS ? "\nCleared all data (schools + users)." : "\nCleared all school data. (users kept — pass --users to remove them too.)");
  process.exit(0);
}

clear().catch((err) => {
  console.error("Clear failed:", err);
  process.exit(1);
});

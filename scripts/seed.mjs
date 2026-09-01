/**
 * Seed script — one-time bootstrap of the school-bus Firestore database.
 *
 * Creates (idempotently):
 *   - the director + two staff (bus monitor/driver) Auth users + profiles
 *   - a demo school with 4 buses (bus04 ↔ monitor, bus01 ↔ monitor2 via
 *     driverUid), 32 students, and today's morning runs with attendance
 *     records for every bus
 *
 * Requires:
 *   - firebase-admin (devDependency)
 *   - a service-account key. Set FIREBASE_SERVICE_ACCOUNT to its path, or drop
 *     it at ./service-account.json (both gitignored). Get it from the console:
 *     ⚙ Project settings → Service accounts → Generate new private key.
 *
 * Usage:
 *   node scripts/seed.mjs
 *
 * Env (optional):
 *   FIREBASE_SERVICE_ACCOUNT  path to the service-account JSON
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID  default "school-bus-a4f23"
 *   DIRECTOR_EMAIL / DIRECTOR_PASSWORD / DIRECTOR_NAME
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { randomInt } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// ── config ───────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT =
  process.env.FIREBASE_SERVICE_ACCOUNT ??
  path.join(process.cwd(), "service-account.json");
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "school-bus-a4f23";
const SCHOOL_ID = "demo-academy";
const SCHOOL_NAME = "Demo Academy";
const DIRECTOR_EMAIL = process.env.DIRECTOR_EMAIL ?? "director@schoolbus.demo";
const DIRECTOR_PASSWORD = process.env.DIRECTOR_PASSWORD ?? "Director123!";
const DIRECTOR_NAME = process.env.DIRECTOR_NAME ?? "School Director";
const STAFF_EMAIL = process.env.STAFF_EMAIL ?? "monitor@schoolbus.demo";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD ?? "Monitor123!";
const STAFF_NAME = process.env.STAFF_NAME ?? "Alex Rivera";
const MONITOR2_EMAIL = process.env.MONITOR2_EMAIL ?? "monitor2@schoolbus.demo";
const MONITOR2_PASSWORD = process.env.MONITOR2_PASSWORD ?? "Monitor123!";
const MONITOR2_NAME = process.env.MONITOR2_NAME ?? "Dana Ortiz";

if (!existsSync(SERVICE_ACCOUNT)) {
  console.error(
    `No service-account key found at ${SERVICE_ACCOUNT}.\n` +
      "Set FIREBASE_SERVICE_ACCOUNT or drop service-account.json in the project root.",
  );
  process.exit(1);
}

// ── seed data ────────────────────────────────────────────────────────────────
// bus01/bus04 drivers match the staff displayNames below (the `driver` field is
// a denormalized display copy of the linked user's name). bus02/bus03 keep
// legacy names with no linked login.
const BUSES = [
  { id: "bus01", name: "Bus 01", driver: MONITOR2_NAME },
  { id: "bus02", name: "Bus 02", driver: "Rita Patel" },
  { id: "bus03", name: "Bus 03", driver: "Tomás Reyes" },
  { id: "bus04", name: "Bus 04", driver: STAFF_NAME },
];

// Bus 04 = the 12 students from the mobile roster UI (statuses match).
const STUDENTS = [
  { id: "liam-johnson", name: "Liam Johnson", grade: "Grade 4B", bus: "bus04", status: "BOARDED" },
  { id: "sophia-chen", name: "Sophia Chen", grade: "Grade 3A", bus: "bus04", status: "WAITING" },
  { id: "marcus-williams", name: "Marcus Williams", grade: "Grade 5C", bus: "bus04", status: "DROPPED_OFF" },
  { id: "emma-davis", name: "Emma Davis", grade: "Grade 4B", bus: "bus04", status: "WAITING" },
  { id: "noah-smith", name: "Noah Smith", grade: "Grade 3A", bus: "bus04", status: "ABSENT" },
  { id: "ava-martinez", name: "Ava Martinez", grade: "Grade 5C", bus: "bus04", status: "BOARDED" },
  { id: "ethan-brown", name: "Ethan Brown", grade: "Grade 4A", bus: "bus04", status: "BOARDED" },
  { id: "mia-wilson", name: "Mia Wilson", grade: "Grade 3B", bus: "bus04", status: "BOARDED" },
  { id: "lucas-garcia", name: "Lucas Garcia", grade: "Grade 4B", bus: "bus04", status: "BOARDED" },
  { id: "isabella-lee", name: "Isabella Lee", grade: "Grade 5A", bus: "bus04", status: "BOARDED" },
  { id: "oliver-taylor", name: "Oliver Taylor", grade: "Grade 3C", bus: "bus04", status: "BOARDED" },
  { id: "charlotte-anderson", name: "Charlotte Anderson", grade: "Grade 4A", bus: "bus04", status: "DROPPED_OFF" },
  // Bus 01 (code.html's example students + fillers)
  { id: "alice-cooper", name: "Alice Cooper", grade: "Grade 4", bus: "bus01", status: "BOARDED" },
  { id: "bobby-tables", name: "Bobby Tables", grade: "Grade 6", bus: "bus01", status: "DROPPED_OFF" },
  { id: "charlie-davis", name: "Charlie Davis", grade: "Grade 2", bus: "bus01", status: "ABSENT" },
  { id: "diana-evans", name: "Diana Evans", grade: "Grade 5", bus: "bus01", status: "WAITING" },
  { id: "henry-ford", name: "Henry Ford", grade: "Grade 5", bus: "bus01", status: "BOARDED" },
  { id: "grace-hopper", name: "Grace Hopper", grade: "Grade 3", bus: "bus01", status: "BOARDED" },
  { id: "alan-turing", name: "Alan Turing", grade: "Grade 4", bus: "bus01", status: "DROPPED_OFF" },
  { id: "ada-lovelace", name: "Ada Lovelace", grade: "Grade 6", bus: "bus01", status: "BOARDED" },
  // Bus 02
  { id: "isaac-newton", name: "Isaac Newton", grade: "Grade 4", bus: "bus02", status: "BOARDED" },
  { id: "marie-curie", name: "Marie Curie", grade: "Grade 5", bus: "bus02", status: "BOARDED" },
  { id: "nikola-tesla", name: "Nikola Tesla", grade: "Grade 3", bus: "bus02", status: "WAITING" },
  { id: "rosalind-franklin", name: "Rosalind Franklin", grade: "Grade 6", bus: "bus02", status: "BOARDED" },
  { id: "linus-pauling", name: "Linus Pauling", grade: "Grade 4", bus: "bus02", status: "DROPPED_OFF" },
  { id: "jane-goodall", name: "Jane Goodall", grade: "Grade 5", bus: "bus02", status: "BOARDED" },
  // Bus 03
  { id: "albert-einstein", name: "Albert Einstein", grade: "Grade 4", bus: "bus03", status: "BOARDED" },
  { id: "katherine-johnson", name: "Katherine Johnson", grade: "Grade 5", bus: "bus03", status: "BOARDED" },
  { id: "stephen-hawking", name: "Stephen Hawking", grade: "Grade 6", bus: "bus03", status: "WAITING" },
  { id: "rachel-carson", name: "Rachel Carson", grade: "Grade 4", bus: "bus03", status: "BOARDED" },
  { id: "neil-armstrong", name: "Neil Armstrong", grade: "Grade 5", bus: "bus03", status: "DROPPED_OFF" },
  { id: "marie-maynard-daly", name: "Marie Maynard Daly", grade: "Grade 6", bus: "bus03", status: "BOARDED" },
];

// Run status per bus — matches the dashboard mock (Bus 04 completed).
const RUN_STATUS = {
  bus01: "IN_PROGRESS",
  bus02: "IN_PROGRESS",
  bus03: "IN_PROGRESS",
  bus04: "COMPLETED",
};

// ── helpers ──────────────────────────────────────────────────────────────────
function todayDateStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** A morning timestamp (today ~07:3x) offset by i minutes, or null. */
function boardedAt(i, include) {
  if (!include) return null;
  const d = new Date();
  d.setHours(7, 30 + (i % 20), 12, 0);
  return Timestamp.fromDate(d);
}

/** An afternoon drop-off timestamp (~08:0x), or null. */
function droppedOffAt(i, include) {
  if (!include) return null;
  const d = new Date();
  d.setHours(8, 2 + (i % 15), 45, 0);
  return Timestamp.fromDate(d);
}

// ── run ──────────────────────────────────────────────────────────────────────
async function seed() {
  const app = initializeApp({
    credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT, "utf8"))),
    projectId: PROJECT_ID,
  });
  const db = getFirestore(app);
  const auth = getAuth(app);
  const dateStr = todayDateStr();

  /** A 6-digit code not already assigned to any driver in any school. */
  async function uniqueCode() {
    for (let i = 0; i < 20; i++) {
      const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
      const hit = await db
        .collectionGroup("driverCodes")
        .where("code", "==", code)
        .limit(1)
        .get();
      if (hit.empty) return code;
    }
    throw new Error("Couldn't allocate a unique driver code");
  }

  // 1. Director + staff (bus monitor/driver) Auth users + profiles
  async function ensureUser(email, password, displayName) {
    try {
      const user = await auth.createUser({ email, password, displayName });
      console.log(`+ created Auth user ${email} (${user.uid})`);
      return user;
    } catch (err) {
      if (err.code === "auth/email-already-exists") {
        const user = await auth.getUserByEmail(email);
        await auth.updateUser(user.uid, { displayName });
        console.log(`= Auth user already exists (${user.uid})`);
        return user;
      }
      throw err;
    }
  }

  const director = await ensureUser(DIRECTOR_EMAIL, DIRECTOR_PASSWORD, DIRECTOR_NAME);
  await db
    .doc(`users/${director.uid}`)
    .set(
      { role: "director", schoolId: SCHOOL_ID, email: DIRECTOR_EMAIL, displayName: DIRECTOR_NAME },
      { merge: true },
    );
  console.log(`+ users/${director.uid} (role=director, schoolId=${SCHOOL_ID})`);

  const staff = await ensureUser(STAFF_EMAIL, STAFF_PASSWORD, STAFF_NAME);
  await db
    .doc(`users/${staff.uid}`)
    .set(
      { role: "staff", schoolId: SCHOOL_ID, email: STAFF_EMAIL, displayName: STAFF_NAME },
      { merge: true },
    );
  console.log(`+ users/${staff.uid} (role=staff, schoolId=${SCHOOL_ID})`);

  // Second staff account so the per-driver mobile roster is demonstrable.
  const monitor2 = await ensureUser(MONITOR2_EMAIL, MONITOR2_PASSWORD, MONITOR2_NAME);
  await db
    .doc(`users/${monitor2.uid}`)
    .set(
      { role: "staff", schoolId: SCHOOL_ID, email: MONITOR2_EMAIL, displayName: MONITOR2_NAME },
      { merge: true },
    );
  console.log(`+ users/${monitor2.uid} (role=staff, schoolId=${SCHOOL_ID})`);

  // Driver access codes — the staff sign in on mobile by typing these.
  const staffCode = await uniqueCode();
  await db.doc(`schools/${SCHOOL_ID}/driverCodes/${staff.uid}`).set({ code: staffCode });
  console.log(`+ schools/${SCHOOL_ID}/driverCodes/${staff.uid} (code ${staffCode})`);
  const monitor2Code = await uniqueCode();
  await db.doc(`schools/${SCHOOL_ID}/driverCodes/${monitor2.uid}`).set({ code: monitor2Code });
  console.log(`+ schools/${SCHOOL_ID}/driverCodes/${monitor2.uid} (code ${monitor2Code})`);

  // 2. School
  await db.doc(`schools/${SCHOOL_ID}`).set(
    { name: SCHOOL_NAME, createdAt: Timestamp.now() },
    { merge: true },
  );
  console.log(`+ schools/${SCHOOL_ID} (${SCHOOL_NAME})`);

  // 3. Buses — the two staff accounts are linked via driverUid so the mobile
  //    roster is per-driver (monitor → bus04, monitor2 → bus01).
  const DRIVER_UID_BY_BUS = {
    bus01: monitor2.uid,
    bus04: staff.uid,
  };
  for (const bus of BUSES) {
    await db.doc(`schools/${SCHOOL_ID}/buses/${bus.id}`).set({
      ...bus,
      ...(DRIVER_UID_BY_BUS[bus.id] ? { driverUid: DRIVER_UID_BY_BUS[bus.id] } : {}),
    });
  }
  console.log(
    `+ ${BUSES.length} buses (${Object.keys(DRIVER_UID_BY_BUS).length} with a linked driver)`,
  );

  // 4. Students
  for (const s of STUDENTS) {
    const { name, grade, bus } = s;
    await db.doc(`schools/${SCHOOL_ID}/students/${s.id}`).set({ name, grade, busId: bus });
  }
  console.log(`+ ${STUDENTS.length} students`);

  // 5. Today's morning run per bus + flat attendance collection.
  //    attendance doc id: `${runId}__${studentId}` (denormalized for realtime reads).
  for (const bus of BUSES) {
    const runId = `${bus.id}-${dateStr}-morning`;
    await db.doc(`schools/${SCHOOL_ID}/runs/${runId}`).set({
      busId: bus.id,
      runType: "morning",
      date: dateStr,
      status: RUN_STATUS[bus.id] ?? "IN_PROGRESS",
    });
    const roster = STUDENTS.filter((s) => s.bus === bus.id);
    let i = 0;
    for (const s of roster) {
      const boarded = s.status === "BOARDED" || s.status === "DROPPED_OFF";
      await db
        .doc(`schools/${SCHOOL_ID}/attendance/${runId}__${s.id}`)
        .set({
          runId,
          date: dateStr,
          busId: bus.id,
          busName: bus.name,
          studentName: s.name,
          grade: s.grade,
          status: s.status,
          boardedAt: boardedAt(i, boarded),
          droppedOffAt: droppedOffAt(i, s.status === "DROPPED_OFF"),
        });
      i++;
    }
    console.log(`+ runs/${runId} (${roster.length} attendance records)`);
  }

  console.log("\nSeed complete.");
  console.log(`Director login: ${DIRECTOR_EMAIL} / ${DIRECTOR_PASSWORD}  (→ /dashboard)`);
  console.log(`Staff login:    ${STAFF_EMAIL} / ${STAFF_PASSWORD}  |  code ${staffCode}  (→ /, Bus 04)`);
  console.log(`Staff 2 login:  ${MONITOR2_EMAIL} / ${MONITOR2_PASSWORD}  |  code ${monitor2Code}  (→ /, Bus 01)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

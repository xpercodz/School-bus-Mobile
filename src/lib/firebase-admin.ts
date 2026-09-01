/**
 * Server-side Firebase Admin SDK singleton. Imported ONLY by route handlers —
 * never from client components (the client SDK lives in `src/lib/firebase.ts`).
 * Mirrors the credential resolution in `scripts/seed.mjs`: a service-account key
 * from `FIREBASE_SERVICE_ACCOUNT` or `./service-account.json` (both gitignored).
 */
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const SERVICE_ACCOUNT =
  process.env.FIREBASE_SERVICE_ACCOUNT ??
  path.join(process.cwd(), "service-account.json");

function adminApp() {
  if (getApps().length > 0) return getApp();
  if (!existsSync(/* turbopackIgnore: true */ SERVICE_ACCOUNT)) {
    throw new Error(
      `No service-account key found at ${SERVICE_ACCOUNT}. ` +
        "Set FIREBASE_SERVICE_ACCOUNT or drop service-account.json in the project root.",
    );
  }
  return initializeApp({
    // turbopackIgnore: the service-account key is gitignored and read at runtime
    // (never bundled) — don't trace the whole project to resolve this path.
    credential: cert(JSON.parse(readFileSync(/* turbopackIgnore: true */ SERVICE_ACCOUNT, "utf8"))),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const app = adminApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

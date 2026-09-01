/**
 * Firebase client — the single place Firebase is initialized.
 *
 * Reads the web-app config from NEXT_PUBLIC_FIREBASE_* env vars (filled in
 * .env.local). These are public client keys by design — the security model
 * lives in Firestore security rules, not in hiding these values.
 *
 * Until the config is filled, `isFirebaseConfigured` is false and the app
 * falls back to the local mock data, so UI-only development still works.
 */

import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once the env config is filled in (apiKey + projectId + appId). */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

// Firebase must initialize in the browser only (Auth/Firestore are client SDKs
// and the SSR pass shouldn't spin up a second instance).
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };

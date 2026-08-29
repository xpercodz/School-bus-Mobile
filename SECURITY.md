# SECURITY — School Bus Transit

Security model for the app. Keep this accurate when controls change.

## Authentication

- **Provider:** Firebase Auth, email/password only (no OAuth/SSO yet).
- **Login UI:** `/login` (`src/app/login/page.tsx`), signs in via
  `signInWithEmailAndPassword`.
- **Session:** managed client-side by `onAuthStateChanged` in
  `src/lib/auth.tsx`; there are no server-side session cookies. Client JS
  cannot be trusted to gate data — the Firestore rules are the real boundary.
- Users are provisioned by an Admin-SDK bootstrap (`scripts/seed.mjs`) or the
  console; there is no self-signup (prevents unowned accounts).

## Authorization model

- Every user has a `users/{uid}` profile: `{ role: "director" | "staff",
  schoolId, email }`.
- **Roles:**
  - `director` — full control of their school: students, buses, runs, attendance.
  - `staff` (bus monitors) — read school data, write runs + attendance only.
  - No profile / not signed in — **denied** (rules fall through to `false`).
- Role checks happen **in Firestore security rules**, not in the client, so a
  tampered client can't escalate.
- **Role-based landing** (client UX, not a security boundary): after login
  directors land on `/dashboard`, staff on `/`. `src/components/RequireRole.tsx`
  guards `/dashboard` (signed-out → `/login`, non-director → `/`).

## Tenant isolation

- All data lives under `schools/{schoolId}`. Rules compare the caller's
  `users/{uid}.schoolId` against the path's `schoolId` (`isMySchool`).
- A user can only ever read/write their own school's subtree — no collection-
  group queries cross schools, and cross-school reads are denied by the rules.

## Firestore rules (`firestore.rules`)

- `users`: any signed-in user may read profiles; a user may create their own and
  update their own **only when `role`/`schoolId` are unchanged** (a user cannot
  self-promote to director or switch tenants — those are the authorization
  gates); no deletes. Client code never writes profiles; they come from the seed
  script (Admin SDK).
- `schools/{id}` + `students` + `buses`: read for the caller's school; writes
  **director only**.
- `runs` + `attendance`: read for the caller's school; writes for **director or
  staff** (bus monitors operate runs).

## Data

- **Client keys** (`apiKey`, etc.) are public by design and shipped in the web
  bundle; the security boundary is the rules, never these values.
- **Secrets kept out of git:** `.env.local` (`.env*` ignored) and the
  service-account key (`service-account.json`, gitignored). The service account
  must never be exposed to the client — it's used only by `scripts/seed.mjs`.

## Known limitations / pre-launch requirements

- **No rate limiting** on auth (rely on Firebase's built-in abuse protections;
  consider Firebase Auth quotas / reCAPTCHA if abuse appears).
- **Limited per-field validation** in rules: `role`/`schoolId` are locked on
  self-update, but other fields (e.g. attendance `status` values, run fields)
  are still not validated — a director could write arbitrary values. Add full
  `request.resource.data` validation before production.
- **No audit log** of attendance changes.
- Seed users carry well-known default passwords (`Director123!`, `Monitor123!`)
  — change them or generate real ones before any production use.
- Realtime reads are wide (all of today's attendance); revisit if a school grows
  to many thousands of records (add date-range queries + pruning of old runs).

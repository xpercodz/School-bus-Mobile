# SECURITY — School Bus Transit

Security model for the app. Keep this accurate when controls change.

## Authentication

- **Provider:** Firebase Auth — email/password for directors, 6-digit access
  codes for drivers (no OAuth/SSO yet).
- **Login UI:** `/login` (`src/app/login/page.tsx`) has two modes; **neither
  mode signs the client in with raw credentials.** Both exchange credentials
  for a server-minted Firebase custom token, and the client only ever calls
  `signInWithCustomToken`:
  - **Driver code tab** → `POST /api/auth/verify-code`: Admin SDK
    collection-group lookup on `driverCodes`, then requires the owner's
    profile to be `role: "staff"` before minting the token. A code can never
    mint a director session.
  - **Director tab** → `POST /api/auth/director-sign-in`: verifies the
    email/password with Firebase Auth's REST endpoint (public web API key),
    then requires `users/{uid}.role === "director"` (fresh Admin SDK read)
    before minting the token. A staff/driver account typed into the Director
    tab gets `403 not_director` and **never receives a token** — it cannot
    create any session through that path.
  - Both routes run a uniform ~400ms delay on success AND failure (no timing
    oracle) and a per-IP rate limit; see "Known limitations".
- **Session:** managed client-side by `onAuthStateChanged` in
  `src/lib/auth.tsx`; there are no server-side session cookies. Client JS
  cannot be trusted to gate data — the Firestore rules are the real boundary.
- Users are provisioned by an Admin-SDK bootstrap (`scripts/seed.mjs`), the
  console, or `POST /api/drivers` (director-only); there is no self-signup.
  Driver accounts are code-only: a placeholder `{uuid}@drivers.invalid` email
  and **no password**, so password auth can never reach them.

## Authorization model

- Every user has a `users/{uid}` profile: `{ role: "director" | "staff",
  schoolId, email }`.
- **Roles:**
  - `director` — full control of their school: students, buses, runs, attendance.
  - `staff` (bus monitors) — read school data, write runs + attendance only.
  - No profile / not signed in — **denied** (rules fall through to `false`).
- Role checks happen at two layers: **server-side at token mint** (both
  sign-in routes read `users/{uid}` fresh via the Admin SDK before issuing a
  custom token) and **in Firestore security rules** (the real data boundary) —
  a tampered client can't escalate and can't sign in through the wrong role's
  entry point.
- **Role-based landing** (client UX, not a security boundary): after login
  directors land on `/dashboard`, staff on `/`. `src/components/RequireRole.tsx`
  guards `/dashboard` (signed-out → `/login`, non-director → `/`).

## Tenant isolation

- All data lives under `schools/{schoolId}`. Rules compare the caller's
  `users/{uid}.schoolId` against the path's `schoolId` (`isMySchool`).
- A user can only ever read/write their own school's subtree — no collection-
  group queries cross schools, and cross-school reads are denied by the rules.

## Firestore rules (`firestore.rules`)

- `users`: a user may read **their own** profile; a director may additionally
  read any profile of their own school (the staff list). A user may create
  their own and update their own **only when `role`/`schoolId` are unchanged**
  (a user cannot self-promote to director or switch tenants — those are the
  authorization gates); no deletes. Client code never writes profiles; they
  come from the seed script and the driver API routes (Admin SDK).
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

- **Rate limiting is in-memory per IP** on both server sign-in routes (resets
  on server restart/redeploy) — sufficient for throttling, not a durable
  store. The login page adds a 5-attempt → 15-minute client lockout for the
  driver-code tab (localStorage). Firebase Auth's built-in throttling is the
  backstop for password attempts; consider reCAPTCHA / quota tuning if abuse
  appears.
- **Limited per-field validation** in rules: `role`/`schoolId` are locked on
  self-update, but other fields (e.g. attendance `status` values, run fields)
  are still not validated — a director could write arbitrary values. Add full
  `request.resource.data` validation before production.
- **No audit log** of attendance changes.
- Seed users carry well-known default passwords (`Director123!`, `Monitor123!`)
  — change them or generate real ones before any production use.
- Realtime reads are wide (all of today's attendance); revisit if a school grows
  to many thousands of records (add date-range queries + pruning of old runs).

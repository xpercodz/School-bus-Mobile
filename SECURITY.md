# SECURITY — School Bus Transit

Security model for the app. Keep this accurate when controls change.

## Authentication

- **Provider:** Firebase Auth — email/password for directors, 6-digit access
  codes for drivers (no OAuth/SSO yet).
- **Login UI:** `/login` (`src/app/login/page.tsx`) has two modes; **neither
  mode signs the client in with raw credentials.** Both exchange credentials
  for a server-minted Firebase custom token, and the client only ever calls
  `signInWithCustomToken`:
  - **Driver code tab** → `POST /api/auth/verify-code`: hashes the submitted
    code (HMAC-SHA256, `CODE_PEPPER`) and Admin SDK collection-group lookups
    `driverCodes.codeHash`, then requires the owner's profile to be
    `role: "staff"` before minting the token. A code can never mint a director
    session.
  - **Director tab** → `POST /api/auth/director-sign-in`: verifies the
    email/password with Firebase Auth's REST endpoint (public web API key),
    then requires `users/{uid}.role === "director"` (fresh Admin SDK read)
    before minting the token. A staff/driver account typed into the Director
    tab gets `403 not_director` and **never receives a token** — it cannot
    create any session through that path.
  - Both routes run a uniform ~400ms delay on success AND failure (no timing
    oracle), a **bounded** in-memory per-IP rate limit (10k-entry cap), and an
    **Origin check** (`APP_ORIGIN`; cross-origin auth POSTs → 403) as CSRF
    hardening. Failed attempts log one structured line (event/reason/ip —
    never codes, emails, or passwords).
- **Codes are stored hashed, not plaintext.** A `driverCodes/{uid}` doc holds
  only `codeHash = HMAC-SHA256(CODE_PEPPER, code)`; the plaintext code is
  returned exactly once at create/regenerate (`POST /api/drivers`,
  `POST /api/drivers/regenerate`) so directors can hand it to the driver.
  Legacy plaintext `code` docs still display until regenerated (rotation
  replaces them); verification only matches `codeHash`, so regenerate is the
  recovery path for any lost code.
- **Per-code lockout:** `verify-code` keeps a transactional
  `attempts`/`lockedUntil` counter on the code doc — 10 failed role-gate
  attempts lock the code for 15 minutes (429). Wrong-code guesses can't be
  attributed to a doc (the hash lookup misses), so they stay throttled by the
  per-IP limit + uniform delay; see "Known limitations" for the pre-launch
  abuse-protection checklist.
- **Session:** managed client-side by `onAuthStateChanged` in
  `src/lib/auth.tsx`; there are no server-side session cookies. Client JS
  cannot be trusted to gate data — the Firestore rules are the real boundary.
- Users are provisioned by an Admin-SDK bootstrap (`scripts/seed.mjs`), the
  console, or `POST /api/drivers` (director-only); there is no self-signup and
  the rules no longer allow clients to create `users/{uid}` at all. Driver
  accounts are code-only: a placeholder `{uuid}@drivers.invalid` email and
  **no password**, so password auth can never reach them.
- **Branch policy:** `dev` predates the server-side director gate — it signs
  directors in client-side with `signInWithEmailAndPassword` (no role gate).
  Never merge it as-is; the canonical line is `director-gate-and-drawer-ui`.
  Client code must never call `signInWithEmailAndPassword` directly (grep for
  it on every merge).

## Authorization model

- Every user has a `users/{uid}` profile: `{ role: "director" | "staff",
  schoolId, email }`.
- **Roles:**
  - `director` — full control of their school: students, buses, runs, attendance.
  - `staff` (bus monitors) — read school data, write their own bus's runs +
    attendance only (rules-scoped via `buses/{id}.driverUid`).
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
  read any profile of their own school (the staff list). A user may update
  their own **only when `role`/`schoolId` are unchanged** (a user cannot
  self-promote to director or switch tenants — those are the authorization
  gates); **no client `create`** — profiles are Admin-SDK-provisioned only
  (seed script + server routes), so a self-created profile can never forge
  role/schoolId; no deletes.
- `schools/{id}` + `students` + `buses`: read for the caller's school; writes
  **director only** (student/bus creates must carry core fields — name/grade).
- `runs` + `attendance`: read for the caller's school; writes for **director**
  or **staff scoped to the caller's own bus** (`buses/{id}.driverUid`, checked
  via `staffsOwnBus`) with validated fields: run `status` ∈ IN_PROGRESS /
  COMPLETED, `runType` ∈ morning / afternoon, `date` a string; attendance
  `status` ∈ BOARDED / WAITING / DROPPED_OFF / ABSENT. A staff account can no
  longer write another bus's run or forge attendance records.
- `schools/{id}/audit`: director-read-only; written exclusively by the Admin
  SDK (`logAudit` in `src/lib/driver-admin.ts`) — driver-created and
  code-regenerated events, never codes or passwords.

## Data

- **Client keys** (`apiKey`, etc.) are public by design and shipped in the web
  bundle; the security boundary is the rules, never these values.
- **Secrets kept out of git:** `.env.local` (`.env*` ignored) and the
  service-account key (`service-account.json`, gitignored, chmod 600). The
  service account must never be exposed to the client — it's used only by
  `scripts/seed.mjs`. **Server-only envs in `.env.local`:** `CODE_PEPPER`
  (HMAC key for driver-code hashing — required by the server routes and the
  seed script) and `APP_ORIGIN` (Origin check for the auth POST routes;
  defaults to `http://localhost:3000`). Set real values in the hosting env,
  never in the repo.

## Known limitations / pre-launch requirements

- **In-memory per-instance rate limiting** on both server sign-in routes
  (bounded to 10k IPs; resets on restart/redeploy) — sufficient for
  throttling, not a durable store. The login page adds a 5-attempt →
  15-minute client lockout for the driver-code tab (localStorage; UX only).
  Firebase Auth's built-in throttling is the backstop for password attempts.
- **Wrong-code distributed brute force** is throttled by the per-IP limit +
  uniform ~400ms delay; a determined botnet can still probe the 10⁶ code space.
  Pre-launch abuse protection (console/staging): enable **Firebase App
  Check**, consider reCAPTCHA or raising codes to 8 digits, and watch the
  `code_verify_failed` server logs.
- **Rule validation is shallow on director writes:** `status`/`runType`/`date`
  and student/bus core fields are enforced, but directors may still write
  arbitrary extra fields on runs/attendance docs.
- **Audit log covers driver lifecycle only** (create/regenerate). Attendance
  status changes happen client-side through Firestore rules and are not yet
  audit-logged.
- Seed users used to carry well-known default passwords (`Director123!`,
  `Monitor123!`); the seed now **fails closed** — real passwords must come from
  the env unless `--demo` / `ALLOW_DEMO_DEFAULTS=1` is explicitly passed.
- Realtime reads are wide (all of today's attendance); revisit if a school grows
  to many thousands of records (add date-range queries + pruning of old runs).
- **Deployment checklist:** disable Email/Password self-sign-up in the console;
  enable App Check; add the single-field **collection-group index on
  `driverCodes.codeHash`** (console-only — single-field CG indexes can't ship
  in `firestore.indexes.json`); deploy rules to staging first and smoke-test
  staff/director flows (the rules now deny profile creation and scope staff
  writes); re-seed or regenerate demo driver codes once so docs store
  `codeHash`; set `CODE_PEPPER` + `APP_ORIGIN` in the hosting env; HSTS at the
  edge.

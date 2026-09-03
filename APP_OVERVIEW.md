# APP_OVERVIEW — School Bus Transit

School bus attendance and transit monitoring. One Next.js app, two sections:
a **mobile-first** attendance roster (bus monitors) and a **desktop dashboard**
(the school director). This is the canonical architecture document for the
repo — keep it accurate as the project evolves.

## Stack

- **Framework:** Next.js (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first config in `src/app/globals.css`)
- **Fonts:** Inter + JetBrains Mono (`next/font/google`), Material Symbols
  Rounded + Outlined (Google Fonts CDN)
- **Backend:** **Firebase** — Auth (email/password) + Cloud Firestore, shared by
  both sections. Config in `.env.local` (`NEXT_PUBLIC_FIREBASE_*`), client SDK
  init in `src/lib/firebase.ts`. **Live data only** — there is no mock fallback:
  without a session the mobile screen shows a sign-in prompt, and the dashboard
  is role-guarded.
- **i18n:** lightweight custom layer in `src/lib/i18n/` — typed `en`/`ar`
  dictionaries, a client `LocaleProvider`, and `Intl`-based formatting. English
  default, Arabic via a UI toggle, persisted in a `locale` cookie. See
  "Internationalization" below.

## Routing

```
/                      (mobile) group  — phone-column roster (per-driver morning run)
/dashboard             dashboard/      — director "School Transit Live Monitor"
/dashboard/reports     dashboard/      — printable attendance summary (CSV + print),
                                        with an Analytics modal (per-bus rates +
                                        multi-day trend)
/dashboard/assignments dashboard/      — director-only driver↔bus and student↔bus links
/dashboard/drivers     dashboard/      — director-only driver accounts + access codes
/login                 login/          — driver access code, or director email/password
```
(`/dashboard/analytics` was a standalone statistics page; Analytics now lives as
a modal inside Reports, and the old URL 308-redirects to `/dashboard/reports`.)

**Role-based access:** after login, `staff` (bus monitor/driver) lands on `/`,
`director` on `/dashboard`. The dashboard is wrapped in `RequireRole
role="director"` (`src/components/RequireRole.tsx`) — signed-out visitors go to
`/login`, non-directors bounce back to `/`. The dashboard sidebar shows the
signed-in school's name (`src/lib/school.ts`), so each tenant sees their own.

**Two sign-in modes on `/login`:** a segmented toggle switches between **Driver
code** (default — a 6-digit access code, see "Driver access codes" below) and
**Director** (email/password, see "Director sign-in" below). Both modes are
exchanged **server-side** for a custom token before any session exists.

- `src/app/(mobile)/layout.tsx` — the phone-column shell (`max-w-[480px]`);
  `(mobile)/page.tsx` is the attendance screen. URL stays `/`.
- `src/app/dashboard/layout.tsx` — responsive shell: `Sidebar` + sticky
  `TopBar`. `dashboard/page.tsx` is the Live Monitor screen.
- `src/app/providers.tsx` wraps the tree in the auth provider (`src/lib/auth.tsx`).
- One root layout (`src/app/layout.tsx`) provides fonts + icon CDN for both.
- Dashboard is **responsive**: the `w-64` sidebar is a fixed rail at `≥lg`
  (1024px) and collapses into a hamburger + off-canvas drawer below it (the
  drawer reuses the shared `Dialog` `placement="end"` pattern, so focus trap /
  Escape / scroll-lock come for free). The top bar hides its brand text and
  live-clock chip on narrow screens; wide tables keep horizontal scroll.
- Sidebar nav: **Live Map** (`/dashboard`), **Reports** (`/dashboard/reports`),
  **Assignments** (`/dashboard/assignments`), and **Drivers**
  (`/dashboard/drivers`) are real routes; the active pill follows the path.
  **Fleet Status** is intentionally inert (the fleet grid already lives on the
  Live Map) and **Routes** isn't built yet.
- **Analytics** is not a route — it's a modal (`AnalyticsModal`, launched by the
  **Analytics** button in the Reports toolbar). It shows the two analysis views
  the printable report doesn't: per-bus boarded/absent **rate bars** and the
  multi-day attendance trend (`useAttendanceTrend`: paginated date-range query
  on `attendance.date`, CSS stacked-bar chart, default last 7 days, capped at
  31). It reuses the report's already-loaded bus summaries and follows its run
  segment; only the trend queries Firestore, and only while the modal is open.
- **Reports** — overview KPIs, by-bus and by-grade summary tables, the full
  roster (paginated/searchable/filterable like the Live Map table), **Export
  CSV** (reuses `src/lib/csv.ts`; exports the currently filtered rows), and
  **Print** (the sidebar + top bar are hidden on print via `print:` variants).
- **Assignments** — director-only driver↔bus and student↔bus assignment. The
  Drivers table links a staff user to each bus (one driver per bus; the write
  keeps the denormalized `driver` name in sync and clears the driver's previous
  bus atomically). The Students table is cursor-paginated (via
  `src/lib/school-admin.ts`) with a client-side name search and a per-row bus
  `<select>`.

## Mobile screen (per-driver morning run)

Faithful to the Stitch design: attendance roster with status summary chips,
student search, segmented filter tabs (All / Waiting / Boarded / Done), roster
cards per status, and a bottom bar. The roster is **per-driver** — the app bar
title and roster come from the signed-in user's bus (`buses where driverUid ==
uid`, resolved by `useDriverBus`), so every staff account sees only its own
bus. A staff user linked to no bus gets a friendly empty state instead of a
roster. The roster is **live-only** — it reads the school's current run from
Firestore and tapping a student's status pill writes the new status back;
signed out, the screen shows a sign-in prompt. The bottom bar's **Complete
Run** marks the run `COMPLETED` and any `WAITING` students `ABSENT` in one
atomic batch. Each card's "⋯" menu offers **View history** and **Mark absent**;
the top-bar "⋯" menu shows run details (bus / type / date / status) and **Sign
out**. See the git history for the original one-screen build.

## Director dashboard (School Transit Live Monitor)

Faithful to the Stitch `code.html` — a **light Material 3** admin UI (the
folder's `DESIGN.md` is a stale dark "Command Center" concept and is **not**
the rendered design). One screen: the Live Monitor.

- **KPI cards** — Total Assigned / Currently Onboard (live pulse) / Safely
  Dropped Off / Marked Absent-Pending (error accent).
- **Active Fleet grid** — bus cards (route progress, In/Out/Wait counts).
- **Live Student Attendance table** — student name, grade, bus #, morning
  boarded, drop-off time, status badge, actions. The **History** action opens a
  per-student attendance sheet; **Call** is disabled (no contact numbers on file).
  The table is **paginated (10 rows/page)** with a per-list toolbar: student
  name search, a grade dropdown, and status chips (All / Boarded / Waiting /
  Dropped Off / Absent) — shared by the Live Map and Reports rosters via
  `useStudentList` + `StudentList` (`src/lib/use-student-list.ts`,
  `src/components/dashboard/StudentList.tsx`).
- **Filter bar** — date picker (re-queries the dashboard for a chosen day),
  Morning Pickup / Afternoon Drop-off segment control (filters the table, KPIs,
  and fleet), and **Export CSV** (downloads the current filtered rows — the
  shared search/grade/status filters apply).
- **Dispatch Vehicle** (sidebar) — creates a run for a chosen bus/type/date and
  pre-registers that bus's students as `WAITING`; refuses to clobber an existing
  run.
- **Top bar** — Help dialog, Settings drawer (account, language, sign out).
  Notifications stays inert.

## Driver access codes (staff sign-in)

Bus drivers are typically in their 40s–50s with no valid email, so they sign in
with a **6-digit numeric code** instead of email/password. Directors keep
email/password and manage driver accounts from the **Drivers** page
(`/dashboard/drivers`): create a driver by name → an auto-generated code is
shown **once** (copyable), with per-row reveal / copy / regenerate, and
"Generate code" for any staff account that has none.

- **Mechanism:** the code is exchanged server-side for a **Firebase custom
  token** (`POST /api/auth/verify-code` → Admin SDK collectionGroup lookup on
  `driverCodes.codeHash` → `createCustomToken`), then the client calls
  `signInWithCustomToken`. The session stays a normal Firebase Auth session, so
  `onAuthStateChanged`, `useUserProfile`, `RequireRole`, and the rules'
  `request.auth.uid` gating all work unchanged.
- **Codes are stored hashed, not plaintext.** The doc holds
  `codeHash = HMAC-SHA256(CODE_PEPPER, code)` (hex) — `CODE_PEPPER` is a
  server-only env var (`.env.local` / hosting secret, never committed). The
  plaintext code exists only in the API response at create/regenerate time
  (shown once, copyable). Legacy docs that still carry a plaintext `code` field
  keep displaying until they are regenerated (or the demo DB is re-seeded);
  verification only matches `codeHash`, so any legacy code stops working once
  its doc is rotated — the **Regenerate** action is the recovery path for lost
  codes.
- **Creating drivers is server-side** (`POST /api/drivers`, director-only via a
  verified Bearer ID token): `auth.createUser` with a placeholder
  `{uuid}@drivers.invalid` email and no password, plus the staff profile and
  code doc. Regeneration (`POST /api/drivers/regenerate`) is also server-side so
  codes stay globally unique.
- **Codes are director-only data** in `schools/{schoolId}/driverCodes/{driverUid}`
  (rules deny staff), generated with a global-uniqueness re-query. The verify
  route runs a uniform ~400ms delay on success/failure, a bounded per-IP rate
  limit, an Origin check (CSRF), and a transactional per-code
  `attempts`/`lockedUntil` counter that locks a code for 15 minutes after 10
  failed role-gate attempts; the login page adds a 5-attempt → 15-minute client
  lockout (localStorage, UX only).
- **Server modules:** `src/lib/firebase-admin.ts` (Admin SDK singleton, same
  credential resolution as `scripts/seed.mjs`) and `src/lib/driver-admin.ts`
  (`requireDirector`, `hashCode`, `generateUniqueCode`, `createDriver`,
  `rotateCode`, `isAllowedOrigin`, `rateLimited`, `logAudit`).

## Director sign-in (email/password)

Directors sign in with email/password on the **Director** tab of `/login`.
Like driver codes, credentials are exchanged **server-side** before a session
can exist:

- **Mechanism:** `POST /api/auth/director-sign-in` verifies the email/password
  against Firebase Auth (identitytoolkit REST, public web API key), then
  requires the account's `users/{uid}` profile to be `role: "director"`
  (fresh Admin SDK read) before minting a custom token the client exchanges
  via `signInWithCustomToken`.
- **Why:** the Director tab must never hand a session to a staff/driver
  account that happens to have email/password credentials. Previously the
  client signed in directly (`signInWithEmailAndPassword`) and role guards
  silently bounced staff to the driver app; now the server rejects the wrong
  role with `403 not_director` and the login page shows a localized message
  pointing drivers to the code tab. Session shape is unchanged — a normal
  Firebase Auth session, so `onAuthStateChanged`, `useUserProfile`,
  `RequireRole`, and rules gating all work as before.
- The route applies the same uniform ~400ms delay, bounded per-IP rate limit,
  and Origin check (CSRF) as `/api/auth/verify-code`; Firebase Auth additionally
  throttles repeated password failures per account. Both sign-in routes log
  structured one-line failures (event + reason + ip — never credentials).

## Security hardening (recent)

- **Firestore rules** (`firestore.rules`): profiles are Admin-SDK-provisioned
  only (no client `create` — a self-created profile could forge
  role/schoolId); staff writes to `runs`/`attendance` are scoped to the caller's
  own bus (`buses/{id}.driverUid`) with validated fields (`status` enums,
  `runType`, `date`); director creates of `students`/`buses` must carry core
  fields; `schools/{sid}/audit` is director-read-only, written by the Admin SDK.
- **Audit trail:** `createDriver`/`rotateCode` best-effort write
  `schools/{sid}/audit/{uuid}` events (`driver.created`,
  `driver.code_regenerated`) with the acting director's uid — codes/passwords
  never enter the log (`src/lib/driver-admin.ts` → `logAudit`).
- **HTTP headers:** `next.config.ts` sends `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy`, and disables
  `X-Powered-By`.
- **Other:** the `locale` cookie is `SameSite=Lax` + `Secure`; the CSV exporter
  neutralizes spreadsheet-formula injection (`=`, `+`, `-`, `@`, including
  whitespace/tab-prefixed cells); the local service-account key is chmod 600.

## Data model

### Firestore schema (multi-school, tenant-isolated)

```
users/{uid}                          { role: "director"|"staff", schoolId, email }
schools/{schoolId}                   { name }
schools/{schoolId}/students/{id}     { name, grade, busId }
schools/{schoolId}/buses/{id}        { name, driver, driverUid? }
schools/{schoolId}/driverCodes/{uid} { codeHash }  // HMAC-SHA256(CODE_PEPPER, code);
                                   // director-only; driver sign-in. Legacy docs
                                   // may still carry a plaintext { code } field.
schools/{schoolId}/runs/{id}         { busId, runType, date, status }
schools/{schoolId}/attendance/{id}   { runId, date, busId, busName, studentName,
                                       grade, status, boardedAt, droppedOffAt }
schools/{schoolId}/audit/{id}        { event, actorUid, at, detail? }
                                   // director-read-only; Admin-SDK-written
```

- **Tenant isolation:** everything lives under `schools/{schoolId}`; the rules
  only ever expose the caller's own school (`users/{uid}.schoolId`).
- **Attendance is denormalized** (a flat per-school collection, one doc per
  run+student) so both views are single-query realtime reads:
  mobile reads `where runId == X`, dashboard reads `where date == today`.
- Run ids are deterministic: `${busId}-${yyyy-mm-dd}-${runType}`.
- **Driver↔bus link lives on the bus** (`buses/{id}.driverUid` — the staff
  `users/{uid}` who drives it); `driver` is a denormalized display copy kept in
  sync on assignment. Buses are already director-writable in the rules, so
  assigning needs no rules changes. One driver per bus (enforced client-side in
  Assignments).
- **Driver access codes** live in `schools/{schoolId}/driverCodes/{driverUid}`,
  readable/writable only by that school's director (rules). Code verification
  (`/api/auth/verify-code`) queries them via Admin SDK `collectionGroup`, which
  needs a **single-field collection-group index on `codeHash`**. Single-field
  collection-group indexes can't be deployed via `firestore.indexes.json`
  (firebase CLI rejects them) — enable it once in the Firebase console:
  Firestore → Indexes → Single Field → Collection Group, add
  `driverCodes.codeHash` ASCENDING (the missing-index error from the verify
  query links straight to the creation page). Legacy plaintext `code` docs are
  replaced on the next code rotation or demo re-seed.
- The per-student history query (`attendance` where `studentName` + order by
  `date`, `runId`) needs the composite index declared in `firestore.indexes.json`
  (deploy with `firebase deploy --only firestore:indexes`).

### App data access

- `src/data/students.ts` + `src/data/dashboard.ts` — types + presentation
  config only (statuses, tabs, KPI ids, nav, run segments). No data lives here.
- `src/lib/school-data.ts` — `useRunRoster()` (mobile roster + status writes +
  `completeRun` / `markAbsent`; resolves the signed-in user's bus via an internal
  `useDriverBus`), `useDashboardData(date, segment)` (KPIs / fleet / attendance,
  filtered by run segment and re-queried by date), `useStudentHistory()`
  (paginated per-student history), and `useAttendanceTrend(start, end, segment)`
  (paginated date-range daily totals) with `summarizeByBus` / `summarizeByGrade`
  helpers. All `onSnapshot` / paginated Firestore — nothing renders without a
  live session.
- `src/lib/school-admin.ts` — director-only Assignments data: `useBuses()`
  (realtime, exposes `driverUid`), `useStaffUsers()` (the school's staff),
  `useStudentsPaginated()` (cursor-paginated + client-side search),
  `useBusStudentCounts()` (server-side per-bus counts), and the
  `assignDriverToBus` / `assignStudentToBus` write helpers.
- `src/lib/use-student-list.ts` — `useStudentList(rows)` — client-side search
  (name) + grade + status filters and table-view pagination (10/page) over an
  already-loaded row set. Powers the shared `StudentList` component used by the
  Live Map and Reports rosters.
- `src/lib/csv.ts` — attendance CSV export (`buildAttendanceCsv` / `downloadCsv`).
- `scripts/clear-data.mjs` — wipes the seeded demo data (schools subtree; pass
  `--users` to also remove the demo accounts).
- `scripts/seed.mjs` — one-time bootstrap (Admin SDK): creates a **director**
  and two **staff** (bus monitor/driver) users + profiles (linked to bus04 and
  bus01 via `buses.driverUid`), a demo school, 4 buses, 32 students, and
  today's morning runs with attendance. Idempotent — safe to re-run.
  Env-overridable (`DIRECTOR_*`, `STAFF_*`, `MONITOR2_*`, `SCHOOL_ID`).
  Passwords fail closed (no well-known defaults unless `--demo` /
  `ALLOW_DEMO_DEFAULTS=1`), codes are stored hashed, and `CODE_PEPPER` is read
  from the env or `.env.local` (plain node doesn't auto-load it).

## Internationalization

English is the default UI language; a manual toggle switches to Arabic (for
drivers who don't read English). Lightweight custom layer — **no routing
changes, no third-party i18n library** (this Next.js has no `middleware` and no
`i18n` config option, so the `[lang]` routing approach was deliberately skipped).

- **Locale core** (`src/lib/i18n/`): typed `en`/`ar` dictionaries
  (`dictionaries/*.ts`, key set derived from `en.ts` as `Messages`), a client
  `LocaleProvider` + `useLocale()` (`context.tsx`) exposing
  `{ locale, setLocale, dir, t }`, and `Intl`-based formatting (`format.ts`:
  `formatTime`, `toLocaleDigits`, `localizeTimeString`, `translateDataLabel`).
- **Persistence:** the choice lives in a `locale` cookie (`path=/`). Server
  layouts read it (`getServerLocale()`) so `<html lang/dir>` and tab metadata
  match on first paint (no wrong-direction flash); the provider writes it on
  toggle. No localStorage.
- **Arabic numerals:** Arabic mode uses Eastern Arabic digits (٠١٢٣) — `Intl`
  via `ar-EG` for times (with Arabic `ص`/`م`), `toLocaleDigits` for counts, bus
  numbers, and grade suffixes.
- **RTL:** `dir="rtl"` flips the layout. Components use Tailwind logical
  utilities (`start-*`/`end-*`/`ms-*`/`ps-*`/`text-start`/`border-e`), so the
  dashboard's fixed sidebar moves to the right and text right-aligns. Arrow-key
  navigation in the segmented controls (tabs, run-type) is direction-aware.
- **Fonts:** Inter (Latin) + IBM Plex Sans Arabic share one `--font-sans` stack
  in `globals.css`; unicode-range serves Arabic glyphs from the Arabic font.
- **Toggle:** `src/components/LanguageToggle.tsx` — shown on login (so drivers
  can switch before signing in), the mobile top bar, and the dashboard top bar.
- **Not translated:** proper nouns — student/driver names, bus number suffixes,
  grade codes, and the product brands (`Fleet Ops`, `TransitFlow Monitor`).

## UI system

Material 3 light for both sections. Tokens live in the `@theme` block of
`src/app/globals.css`:

- **Mobile palette** — `surface`/`on-surface`/`primary`/`success`/`waiting`/
  `error` (Material Utility tokens, per the mobile `DESIGN.md`).
- **Dashboard palette** — fully namespaced `--color-dash-*` (values per the
  dashboard `code.html`). Deliberately **not** shared with the mobile palette:
  several values look alike but differ (`surface-container`, `on-surface`,
  `primary-container`, `success`, `error`), and scoping means a mobile token
  change can never bleed into `/dashboard`.
- Type scale: mobile `headline-md`/`body-lg`/`body-md`/`label-lg`; dashboard
  `dash-metric-xl` (JetBrains Mono, for numbers) + `dash-headline-lg`/
  `dash-label-md`/`dash-body-sm`.
- **Icons:** `src/components/Icon.tsx` takes a `variant` prop —
  `"rounded"` (filled, mobile) or `"outlined"` (line, dashboard). Both font
  families are loaded from the CDN.
- **Skeletons:** shared loading placeholders — base `Skeleton` /
  `SkeletonText` / `SkeletonCircle` in `src/components/Skeleton.tsx`, composed
  into screen shapes in `src/components/dashboard/DashboardSkeletons.tsx`
  (KPI grid, fleet grid, tables, trend) and `src/components/RosterSkeleton.tsx`
  (roster + history list). Each skeleton mirrors the exact layout of the content
  it replaces; screens swap it in while live data loads (`role="status"`).

## Layout

- **Mobile:** centered phone column (`max-w-[480px]`, `sm:border-x`) with
  sticky top app bar and bottom bar, from `(mobile)/layout.tsx`.
- **Dashboard:** `w-64` sidebar + `lg:ms-64` main with a sticky top bar and
  sticky filter bar (`sticky top-0` / `top-16`); below `lg` the sidebar becomes
  a drawer and the main margin collapses (`ms-0`). Document scrolls normally —
  do not convert the shell to an `h-screen overflow-hidden` flex (it breaks the
  sticky offsets).

## Deployment

Not deployed yet. Standard Next.js build (`npm run build`); candidate for
Vercel or a PWA. `/`, `/dashboard`, and `/login` ship in the same build.

Firebase lifecycle (one-time + per-change):
- `node scripts/seed.mjs` — bootstrap the director user + demo data (needs a
  service-account key at `service-account.json` or `FIREBASE_SERVICE_ACCOUNT`;
  needs `CODE_PEPPER` set or in `.env.local`; real passwords via env unless
  `--demo`). After the hashed-code change, re-seed (or regenerate each demo
  driver's code once) so every `driverCodes` doc stores `codeHash`.
- `firebase deploy --only firestore:rules` — push `firestore.rules` (after any
  rules edit). The rules now deny client profile creation and scope staff
  writes to their own bus — smoke-test staff/director flows on staging first.
- `firebase deploy --only firestore:indexes` — push `firestore.indexes.json`
  (required for the per-student history query; the `driverCodes.codeHash`
  collection-group index is console-only).

Known limitation / next step: per-tenant onboarding (creating a school + its
**director** from a meeting) is done via the seed script rather than a UI.
Driver accounts now have a full UI (create + codes on `/dashboard/drivers`);
only brand-new schools/directors still need the seed script.

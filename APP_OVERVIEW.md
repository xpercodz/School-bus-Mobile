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
  init in `src/lib/firebase.ts`. UI falls back to mock data when unconfigured
  or signed out.
- **i18n:** lightweight custom layer in `src/lib/i18n/` — typed `en`/`ar`
  dictionaries, a client `LocaleProvider`, and `Intl`-based formatting. English
  default, Arabic via a UI toggle, persisted in a `locale` cookie. See
  "Internationalization" below.

## Routing

```
/            (mobile) group  — phone-column roster (Bus #04 • Morning Run)
/dashboard   dashboard/      — director "School Transit Live Monitor"
/login       login/          — email/password sign-in
```

**Role-based access:** after login, `staff` (bus monitor/driver) lands on `/`,
`director` on `/dashboard`. The dashboard is wrapped in `RequireRole
role="director"` (`src/components/RequireRole.tsx`) — signed-out visitors go to
`/login`, non-directors bounce back to `/`. The dashboard sidebar shows the
signed-in school's name (`src/lib/school.ts`), so each tenant sees their own.

- `src/app/(mobile)/layout.tsx` — the phone-column shell (`max-w-[480px]`);
  `(mobile)/page.tsx` is the attendance screen. URL stays `/`.
- `src/app/dashboard/layout.tsx` — desktop shell: fixed `Sidebar` + sticky
  `TopBar`. `dashboard/page.tsx` is the Live Monitor screen.
- `src/app/providers.tsx` wraps the tree in the auth provider (`src/lib/auth.tsx`).
- One root layout (`src/app/layout.tsx`) provides fonts + icon CDN for both.
- Dashboard is **desktop-only by design** (fixed `w-64` sidebar); not responsive
  below tablet. Known limitation, matches the design.
- Sidebar nav sections (Fleet Status, Routes, Analytics, Reports) are inert
  links in the UI-only build — future routes under `dashboard/` share the shell.

## Mobile screen (Bus #04 • Morning Run)

Faithful to the Stitch design: attendance roster with status summary chips,
student search, segmented filter tabs (All / Waiting / Boarded / Done), roster
cards per status, and a bottom bar. When signed in, the roster reads the
school's current run from Firestore and tapping a student's status pill writes
the new status back; signed out, it runs on the mock roster (local cycling).
See the git history for the original one-screen build.

## Director dashboard (School Transit Live Monitor)

Faithful to the Stitch `code.html` — a **light Material 3** admin UI (the
folder's `DESIGN.md` is a stale dark "Command Center" concept and is **not**
the rendered design). One screen: the Live Monitor.

- **KPI cards** — Total Assigned / Currently Onboard (live pulse) / Safely
  Dropped Off / Marked Absent-Pending (error accent).
- **Active Fleet grid** — bus cards (route progress, In/Out/Wait counts).
- **Live Student Attendance table** — student name, grade, bus #, morning
  boarded, drop-off time, status badge, call/history actions.
- **Filter bar** — date chip (inert), Morning Pickup / Afternoon Drop-off
  segment control, student search (filters the table live), Export (inert).

## Data model

### Firestore schema (multi-school, tenant-isolated)

```
users/{uid}                          { role: "director"|"staff", schoolId, email }
schools/{schoolId}                   { name }
schools/{schoolId}/students/{id}     { name, grade, busId }
schools/{schoolId}/buses/{id}        { name, driver }
schools/{schoolId}/runs/{id}         { busId, runType, date, status }
schools/{schoolId}/attendance/{id}   { runId, date, busId, busName, studentName,
                                       grade, status, boardedAt, droppedOffAt }
```

- **Tenant isolation:** everything lives under `schools/{schoolId}`; the rules
  only ever expose the caller's own school (`users/{uid}.schoolId`).
- **Attendance is denormalized** (a flat per-school collection, one doc per
  run+student) so both views are single-query realtime reads:
  mobile reads `where runId == X`, dashboard reads `where date == today`.
- Run ids are deterministic: `${busId}-${yyyy-mm-dd}-${runType}`.

### App data access

- `src/data/students.ts` + `src/data/dashboard.ts` — typed **mock** fallbacks
  (used when Firebase is unconfigured or the user is signed out).
- `src/lib/school-data.ts` — `useRunRoster()` (mobile roster + status writes)
  and `useDashboardData()` (KPIs / fleet / attendance). Both `onSnapshot`
  Firestore and fall back to the mocks when not live.
- `scripts/seed.mjs` — one-time bootstrap (Admin SDK): creates a **director**
  and a **staff** (bus monitor) user + profiles, a demo school, 4 buses, 32
  students, and today's morning runs with attendance. Idempotent — safe to
  re-run. Env-overridable (`DIRECTOR_*`, `STAFF_*`, `SCHOOL_ID`).

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

## Layout

- **Mobile:** centered phone column (`max-w-[480px]`, `sm:border-x`) with
  sticky top app bar and bottom bar, from `(mobile)/layout.tsx`.
- **Dashboard:** fixed `w-64` sidebar + `ml-64` main with a sticky top bar
  and sticky filter bar (`sticky top-0` / `top-16`). Document scrolls normally —
  do not convert the shell to an `h-screen overflow-hidden` flex (it breaks the
  sticky offsets).

## Deployment

Not deployed yet. Standard Next.js build (`npm run build`); candidate for
Vercel or a PWA. `/`, `/dashboard`, and `/login` ship in the same build.

Firebase lifecycle (one-time + per-change):
- `node scripts/seed.mjs` — bootstrap the director user + demo data (needs a
  service-account key at `service-account.json` or `FIREBASE_SERVICE_ACCOUNT`).
- `firebase deploy --only firestore:rules` — push `firestore.rules` (after any
  rules edit).

Known limitation / next step: per-tenant onboarding (creating a school + its
users from a meeting) is done via the seed script rather than a UI — a small
provisioning page or CLI is the natural next increment as tenants grow.

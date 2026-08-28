# APP_OVERVIEW — School Bus Mobile

Mobile-first school bus attendance app. This is the canonical architecture
document for the repo — keep it accurate as the project evolves.

## Stack

- **Framework:** Next.js (App Router) + React 19 + TypeScript — mobile-first web app
- **Styling:** Tailwind CSS v4 (CSS-first config in `src/app/globals.css`)
- **Fonts:** Inter (`next/font/google`), Material Symbols Rounded (Google Fonts CDN)
- **Backend:** **none yet** — Firebase (Auth + Firestore) planned for a later phase

## Scope (current)

One screen, faithful to the Stitch design (`DESIGN.md` / `code.html` in
`~/Downloads`): **Bus #04 • Morning Run** — an attendance roster with:

- Top app bar (bus icon, run title, overflow menu)
- Status summary chips — Boarded / Dropped Off / Waiting counts
- Student search (pill field, case-insensitive, clear button)
- Segmented filter tabs — All / Waiting / Boarded / Done (counts derived from data)
- Roster cards with per-status styling (BOARDED / WAITING / DROPPED OFF / ABSENT)
- Bottom bar — sync status + disabled "Complete Run" action

Interactions are local-only for now: search, tab filtering, and tapping a
student's status pill cycles its status (demo affordance to reach every card
variant). The `more_vert` buttons are intentionally inert.

## Data model

All data is defined in `src/data/students.ts` — the single source of truth.
Chips, tabs, and the roster all derive their counts from the same typed module,
so they can never disagree.

```ts
type StudentStatus = "BOARDED" | "WAITING" | "DROPPED_OFF" | "ABSENT";

interface Student {
  id: string;
  name: string;
  grade: string;
  status: StudentStatus;
}
```

`STUDENTS` is mock data (12 entries). Firebase phase: replace with a Firestore
query returning the same `Student` shape — no component changes required.
`STATUS_META` centralizes per-status presentation (icon, pill label/classes,
card/name overrides); `CHIPS`/`TABS` define the summary chips and filter tabs.

## UI system

Material 3 light theme ("Material Utility"). All design tokens live in the
`@theme` block of `src/app/globals.css`: color roles (`surface*`, `primary`,
`success`/`waiting`/`error`), type scale (`headline-md`, `body-lg/md`,
`label-lg`), and the Level-1 card shadow. Spacing is Tailwind's default 4px
unit; touch targets are ≥48px.

Two small deliberate a11y deviations from the generated mockup (`code.html`):
the status-pill text and chip icons use `on-success` (`#137333`) / the ABSENT
name uses `on-error-container` (`#93000a`) so they pass WCAG AA contrast (the
mockup's `#1e8e3e`/`#d93025` fail at 3.7:1 / 4.35:1), and the status pill is
48px tall per the design spec's touch-target rule (the mockup rendered it at
40px).

Components under `src/components/` are small and presentational; state lives
only in `src/app/page.tsx`.

## Layout

Centered phone column (`max-w-[480px]`, `sm:border-x`) with sticky top app bar
and bottom bar inside the column — looks like a mobile app at any viewport
width. 16px side margins, single column, fluid 4px-grid spacing.

## Deployment

Not deployed yet. Standard Next.js build (`npm run build`); candidate for
Vercel or a PWA when Firebase lands.

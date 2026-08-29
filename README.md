# School Bus Transit

One Next.js (App Router, TypeScript, Tailwind v4) app with two sections:

- **`/` (mobile)** — the **Bus #04 • Morning Run** attendance roster: live status
  (Boarded / Waiting / Dropped Off / Absent), search, and status filter tabs.
- **`/dashboard` (desktop)** — the director's **School Transit Live Monitor**:
  KPI cards, active fleet grid, and a live student attendance table.

Both sections are **live-only**: they read from **Firebase** (Auth + Firestore)
and show a sign-in prompt when there's no session — there is no mock data. See
[`APP_OVERVIEW.md`](./APP_OVERVIEW.md) for the full picture and
[`SECURITY.md`](./SECURITY.md) for the security model.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app is mobile-first: it
renders as a centered phone-width column on desktop, or open it in a mobile
viewport in DevTools.

## Scripts

| Command        | Purpose                    |
| -------------- | -------------------------- |
| `npm run dev`  | Start the dev server       |
| `npm run build`| Production build + typecheck |
| `npm run lint` | ESLint                     |

## Fonts

- **Inter** — self-hosted via `next/font/google`.
- **Material Symbols Rounded** — loaded from the Google Fonts CDN (see
  `src/app/layout.tsx`). Swap to the `material-symbols` npm package to
  self-host when the app goes to production.

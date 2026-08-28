# School Bus Mobile

Mobile-first school bus attendance UI for **Bus #04 • Morning Run** — roster with
live status (Boarded / Waiting / Dropped Off / Absent), search, and status filter
tabs. Built as a Next.js (App Router, TypeScript, Tailwind v4) web app.

**UI only.** No backend, auth, or database yet — the roster is served by a typed
mock module (`src/data/students.ts`) that swaps for Firestore later. See
[`APP_OVERVIEW.md`](./APP_OVERVIEW.md) for the full picture.

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

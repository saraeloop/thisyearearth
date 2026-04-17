# Earth Wrapped · MMXXVI

A letter from the planet. Eleven cards. One year. Signed, Earth.

Interactive year-in-review experience delivered as an 11-card story: global temperature anomaly, atmospheric CO₂, ice loss, forest loss, biodiversity, plastic, renewables — plus interactive cards for location, pledges (minted to an on-chain ledger), and a closing constellation of everyone who read tonight.

## Stack

- **Next.js 16** (app router, Turbopack, React 19)
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **Framer Motion** — every animation
- **Neon** (`@neondatabase/serverless`) — pledges + locations
- **Solana** (stubbed) — pledge tx hashes
- **Gemini** — dynamic Earth quotes (optional, falls back to static lines)

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

### Environment

All optional — app runs fully without them (fallback data, in-memory store, stub tx hashes).

```bash
# .env.local
GEMINI_API_KEY=...        # enables tone-variant quotes via /api/earth-voice
DATABASE_URL=postgres://... # Neon connection string for pledges + locations
```

## Project structure

```
app/                  routes + API handlers
  api/co2/            server-side NOAA Mauna Loa fetch
  api/earth-voice/    Gemini proxy (tone-variant quotes)
  api/pledges/        GET count · POST mint
components/
  cards/              one file per card — all use CardShell
  ui/                 CardShell, ProgressBar, ShareSheet, MintButton, SwipeContainer
  Story.tsx           orchestrator (nav, swipe, keyboard, persistence)
constants/            card ids, colors, animation variants, endpoints, copy
hooks/                useSwipe, useCountUp, useLocation, useEarthVoice, useCo2, usePledge
lib/
  api/                co2.ts, gemini.ts (server-only)
  db/                 Neon clients — pledges.ts, locations.ts
  solana/             mint.ts (stubbed tx hashes)
types/                shared types with barrel index — CardId, Accent, Location, Pledge, ClimateData, CardData, Tweaks, VoiceTone
config/site.ts        site metadata
```

## Conventions

- Components never call APIs directly — always through hooks.
- `lib/` is pure TypeScript, no React.
- All magic strings live in `constants/`; all external URLs in `constants/endpoints.ts`.
- Gemini calls proxied through `app/api/earth-voice/route.ts`. CO₂ fetched server-side via `app/api/co2/route.ts`.
- Every card uses `CardShell`. Single responsibility per file.
- Shared types (used in >1 file) live in `types/` with a barrel. Single-use types colocate in the file that owns them.
- Component prop types are named `{ComponentName}Props` — never a generic `Props`.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build + type check
npm start       # run production build
npm run lint    # eslint
```

## Navigation

- `←` / `→` · arrow keys
- `space` · advance
- swipe on touch
- tap sides (on stat cards)
- interactive cards: location, pledge, final — advance via in-card button

# Earth Wrapped · MMXXVI

Earth is the user. 2026 is the year being reviewed.

`thisyear.earth` is an immersive climate year-in-review told as eleven full-screen chapters. It borrows the emotional grammar of a wrapped recap, but the narrator is Earth: ancient, factual, dry, tired, and still here.

## Experience

The site moves through eleven chapters:

1. **Preface · The Record**
2. **Chapter II · Coordinates**
3. **Chapter III · The Fever**
4. **Chapter IV · The Atmosphere**
5. **Chapter V · The Melt**
6. **Chapter VI · The Canopy**
7. **Chapter VII · The Ledger**
8. **Chapter VIII · The Roll Call**
9. **Chapter IX · The Residue**
10. **Chapter X · The Turn**
11. **Epilogue · Sincerely**

Mobile is a native-feeling card experience: swipe, tap, pledge, share.

Desktop is a cinematic scroll experience: one chapter per viewport, Lenis smooth scroll, billboard-scale numbers, and pinned story beats.

## Stack

- **Next.js 16** with the App Router
- **React 19**
- **TypeScript strict**
- **Tailwind CSS v4**
- **Framer Motion**
- **Lenis** for desktop smooth scroll
- **NOAA GML** daily Mauna Loa CO₂ data
- **Neon** for pledge data
- **Solana memo transactions** for the pledge ledger
- **globe.gl / three-globe assets** for the final reader globe

## Local Development

```bash
npm install
npm run dev
```

The dev server runs at:

```text
http://localhost:3000
```

## Environment

The app can run without environment variables. Missing services fall back to local or stubbed behavior where possible.

```bash
GEMINI_API_KEY=...
DATABASE_URL=postgres://...
```

`GEMINI_API_KEY` enables generated one-sentence Earth voice copy through `/api/earth-voice`.

`DATABASE_URL` enables persistent pledge counts and pledge records through Neon.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Data

The CO₂ chapter reads NOAA GML daily Mauna Loa data server-side and caches the response. The card uses the latest reading, year-to-date high, year-to-date average, long-term delta, and a subtle sparkline.

Other climate figures are presented as editorial chapter data inside the experience:

- global temperature anomaly
- ice loss
- forest loss
- species threatened
- plastic production
- renewable energy growth

## Ledger

The pledge chapter asks for one small action for next year. The product language for the Solana interaction is:

```text
MINT TO THE LEDGER
```

Pledges can be stored through Neon and represented with a Solana memo transaction hash.

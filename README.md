<h1 align="center">Earth Wrapped · MMXXVI</h1>

Earth is the narrator.
The year is the subject.
The reader is asked to answer back.

`thisyear.earth` is an immersive climate year-in-review told as eleven full-screen chapters. It uses the familiar emotional shape of a wrapped recap, then turns the perspective inside out: the account belongs to Earth, the receipts are climate data, and the final action becomes a pledge.

## Creative Direction

The experience is:

- an annual report from a planet
- a wrapped recap with consequences
- a climate story that is beautiful without becoming decorative
- a ledger, archive, and confession at the same time

## Chapters

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

## Product Notes

The pledge chapter asks for one small action for next year. The primary Solana interaction is framed as:

```text
MINT TO THE LEDGER
```

Pledges can be stored through Neon and represented with a Solana memo transaction hash. The ledger is not meant to feel like a crypto feature first. It is a public record of intent.

## Stack

- **Next.js 16** with the App Router
- **React 19**
- **TypeScript strict**
- **Tailwind CSS v4**
- **Framer Motion**
- **Lenis** for desktop smooth scroll
- **NOAA GML** daily Mauna Loa CO2 data
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
DATABASE_URL=postgres://...
```

`DATABASE_URL` enables persistent pledge counts and pledge records through Neon.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Data

The CO2 chapter reads NOAA GML daily Mauna Loa data server-side and caches the response. The card uses the latest reading, year-to-date high, year-to-date average, long-term delta, and a subtle sparkline.

Other climate figures are presented as editorial chapter data inside the experience:

- global temperature anomaly
- ice loss
- forest loss
- species threatened
- plastic production
- renewable energy growth

## TODO / Refactor

- Clarify story shell CSS ownership so desktop, tablet, and phone rules do not override each other accidentally.
- Reduce inline style duplication across card components where repeated layout contracts already exist.
- Give each major card family a clearer layout primitive: stat cards, interactive cards, receipt/share cards, and final globe.

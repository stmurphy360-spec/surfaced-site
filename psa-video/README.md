# PSA Video (Remotion)

A PSA-style animated text video built with [Remotion](https://www.remotion.dev/).
The piece uses kinetic typography with fade-ins, slide-ups, and subtle
scale animations on a clean white background with brand color `#1B976A`.

## Setup

```bash
cd psa-video
npm install
```

## Develop

Launch Remotion Studio to preview and edit interactively:

```bash
npm start
```

Open the `PsaVideo` composition.

## Render

Render to MP4:

```bash
npm run build
```

The output is written to `out/psa-video.mp4`.

## Structure

- `src/index.ts` — Remotion entry, registers the root.
- `src/Root.tsx` — Declares the `PsaVideo` composition (1920×1080, 30fps).
- `src/PsaVideo.tsx` — The full scene timeline, kinetic typography primitives
  (`LineText`, `EmphasisText`, `StackedText`), and specialized scenes
  (`PhoneEmphasis`, `Disclaimer`, `FinalCTA`).

## Design notes

- Background: `#FFFFFF`
- Primary brand color: `#1B976A`
- Muted / disclaimer color: `#6B7280`
- Typography: Inter / system sans-serif, weights 400–900
- Emphasized phrases (`sell some or all`, `significant amount of cash`,
  `Inflation is real and unpredictable`, `877 CASH NOW`, `no obligation`,
  `life changing`) use larger sizes, heavier weight, punchy spring scale-in,
  and an underline draw.

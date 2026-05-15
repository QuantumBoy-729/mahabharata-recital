# Mahabharata Recital

A quiet, modern web reader for the Mahabharata that reads the epic aloud,
sentence by sentence, using your browser's built-in speech synthesis.

- **Translation**: Kisari Mohan Ganguli (1883–1896, public domain)
- **Source**: [sacred-texts.com](https://sacred-texts.com/hin/maha/index.htm)
- **Coverage**: All 18 parvas and ~2,108 sections
- **Stack**: Vite + React + TypeScript + Tailwind, no backend

## Features

- 18 parvas with Sanskrit names, summaries, and full section indexes.
- Text-to-speech via the Web Speech API — voice, rate, pitch, and volume
  controls; nothing is uploaded.
- Sentence-level highlighting that follows the narration; click any sentence
  to start reciting from there.
- Skip / pause / stop / next / previous controls; settings persist in
  `localStorage`.
- Graceful "section not yet downloaded" view with copy-paste scrape commands.

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

The site ships with a curated sample of pre-scraped sections so it works
out of the box:

- **Adi Parva** — sections 1–8 (translator's preface and the opening of the
  epic at Naimisha forest).
- **Bhishma Parva** — sections 25–30 (the opening of the Bhagavad Gita).
- **Mahaprasthanika Parva** — all 3 sections.
- **Svargarohanika Parva** — all 5 sections.

Open any other section to see instructions for fetching it.

## Fetching more text

The included scraper pulls the KMG translation from sacred-texts.com into
local JSON files under `public/data/`.

```bash
# A single section
npm run scrape -- --parva=m01 --section=1

# A range of sections
npm run scrape -- --parva=m01 --from=1 --to=20

# A whole parva
npm run scrape -- --parva=m06

# All 18 parvas (2,108 sections \u2014 takes ~25 minutes at the default 600ms delay)
npm run scrape

# Re-download files that already exist locally
npm run scrape -- --parva=m01 --force

# Be more (or less) polite to sacred-texts.com
npm run scrape -- --parva=m01 --delay=1200
```

After scraping, the manifest at `public/data/manifest.json` is rebuilt
automatically; the parva pages will mark newly available sections.

The parva slugs are `m01` through `m18`, matching sacred-texts.com URLs.

## Project layout

```
src/
  data/
    parvas.ts         # Metadata for all 18 parvas
    sections.ts       # Section JSON loader + manifest types
  lib/
    tts.ts            # Sentence splitting + voice loading
    useReciter.ts     # Hook that drives speechSynthesis playback
  components/
    Header.tsx
    ReciterControls.tsx
    SectionReader.tsx
  pages/
    HomePage.tsx
    ParvaPage.tsx
    SectionPage.tsx
    AboutPage.tsx
  App.tsx, main.tsx, index.css

scripts/
  scrape.mjs          # Node scraper for sacred-texts.com KMG translation

public/
  data/               # Per-section JSON + manifest.json (created by scraper)
```

## Browser support

The recital feature requires the Web Speech API, which is available in
modern Chrome, Edge, Firefox, and Safari. Voice quality and selection vary
by operating system — Edge on Windows and Safari on macOS / iOS tend to
have the most natural-sounding voices.

## Building for production

```bash
npm run build
npm run preview
```

The output is a fully static site under `dist/` — host it on any static
file host (Netlify, Vercel, GitHub Pages, S3, etc.). Remember to ship the
`public/data/` directory along with the build.

## Credits and license

- The translation is **public domain**, courtesy of the late Kisari Mohan
  Ganguli (1848–1908). Many thanks to the team at sacred-texts.com for
  hosting it.
- Site code is yours to do with as you please.

`Sarvam khalv idam Brahma.`

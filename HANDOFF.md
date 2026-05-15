# Mahabharata Recital — Handoff

A project handoff doc for picking up where we left off on a different machine.

> Live deploy: **https://mahabharata-recital.vercel.app**

---

## 1. What this project is

A static React site that displays the Kisari Mohan Ganguli (KMG) English
translation of the Mahabharata and reads it aloud, sentence by sentence, with
synced highlighting and a spring-physics page-turn animation between
sections.

Stack:

- **Vite + React 19 + TypeScript + Tailwind 3**
- **react-router-dom 7** for routing
- **`motion`** (formerly `framer-motion`) for the page-turn spring animation
- **`node-html-parser`** in the scraper script
- Browser **Web Speech API** for current narration (to be replaced — see §4)

Data is per-section JSON under `public/data/{parvaSlug}/{NNN}.json` plus a
top-level `manifest.json`. Everything is static; no backend.

---

## 2. State at handoff

### Working

- 18 parva pages with section indexes
- Section reader with sentence highlighting, click-to-jump, recital controls
  (play / pause / stop / next / prev) and persistent voice/rate/pitch settings
- Spring-physics paper-turn animation on section navigation (forward and
  backward), respects `prefers-reduced-motion`
- Static SPA deployed to Vercel with proper rewrites + 1y immutable cache
  headers for `/data/*` and `/assets/*`

### Seeded content (`public/data/`)

| Parva | Sections downloaded                              |
| ----- | ------------------------------------------------ |
| m01   | 001–008 (translator's preface + start of epic)   |
| m06   | 025–030 (opening of the Bhagavad Gita)           |
| m17   | 001–003 (full — Pandavas' final journey)         |
| m18   | 001–005 (full — Yudhishthira's ascent to heaven) |

The other ~2,080 sections aren't downloaded yet; the parva pages mark them
with a dashed border, and the section page shows a "not yet downloaded" view
with the exact `npm run scrape` command to fetch them.

### Known quirks

- Section 1 of Adi Parva is the translator's preface, not narrative. The
  actual story begins around section 2.
- Sacred-texts.com sometimes splits a sentence across `<p>` tags
  (e.g. `Dhritarashtra said,--"Assembled together on the sacred plain of` /
  `Kurukshetra ...`). The reader displays them as separate paragraphs;
  acceptable for now.
- Editorial notes from the source (e.g. `(This is where the Bhagavad Gita
  proper starts...)`) are included as paragraphs.

---

## 3. Pending work — soothing AI narration

This is the open thread. Browser TTS sounds robotic; we want pre-rendered
high-quality narration. We surveyed the options but didn't pick yet.

### Decision matrix

| Provider              | Voice quality                | Indian accent         | Cost (full epic, ~10M chars / ~200h audio) | Cost per section (~5K chars) |
| --------------------- | ---------------------------- | --------------------- | ------------------------------------------ | ---------------------------- |
| **OpenAI TTS-1-HD**   | Very good (nova, onyx)       | No                    | ~$300                                      | ~$0.15                       |
| **OpenAI TTS-1**      | Good                         | No                    | ~$150                                      | ~$0.08                       |
| **ElevenLabs**        | Best in class                | Yes (Rishi, Ananya)   | ~$3,000–6,600                              | ~$1.50                       |
| **Kokoro-82M (local)**| Excellent (#1 TTS Arena '26) | No                    | $0 (your electricity)                      | $0                           |
| **Kokoro / Together** | Same as above                | No                    | ~$10                                       | ~$0.05                       |
| **Google Studio**     | Very good                    | Yes (en-IN voices)    | ~$160                                      | ~$0.08                       |

If "soothing + authentic" is the dominant requirement, the realistic top
two are:

1. **ElevenLabs with Rishi or Ananya** — only path to a genuine Indian
   storyteller voice, but expensive at full scope. Sweet spot: render the
   Gita and the most-loved sections (~50 sections, ~$75) and use OpenAI for
   the long tail.
2. **OpenAI TTS-1-HD with `onyx`** (deep male sage) — universally good,
   fast, single API key, ~$300 for the whole epic. No Indian accent though.

**Free path**: Kokoro-82M run locally. Quality is genuinely competitive with
the paid options — just no Indian accent. ~3–5× real-time on CPU, so the
whole epic on a laptop is ~50–60 hours of compute (or one weekend on a GPU).

### Sentence-highlighting architecture

Two viable approaches:

**A. One MP3 per sentence** (recommended for simplicity)
- Generate audio per sentence: `public/data/m06/025/sentence-001.mp3`, ...
- Player just plays them in sequence; sentence highlight follows naturally
- No timestamp alignment needed
- Tiny pauses between sentences — actually reads as deliberate, soothing
- Easy to "click sentence to play from here"

**B. One MP3 per section + word/sentence timestamps**
- Generate one MP3 for the whole section
- Run OpenAI Whisper or `whisper-timestamped` on the MP3 to get word offsets
- Map words back to sentences in the text
- Player uses timestamps to drive highlight (`audio.currentTime` listener)
- More natural reading flow but more work; sync can drift on long sections
- Whisper cost: ~$0.005/section, ~$10 for full epic

### Suggested implementation order

1. **Add a `narrate` script** alongside `scrape.mjs`:
   ```bash
   npm run narrate -- --parva=m06 --section=25
   npm run narrate -- --parva=m06           # whole parva
   npm run narrate                           # everything in manifest
   ```
   Skeleton: read `public/data/{slug}/{NNN}.json`, split into sentences using
   `splitSentences` from `src/lib/tts.ts` (or duplicate into the script),
   call the chosen TTS API per sentence, write
   `public/data/{slug}/{NNN}/sentence-{idx}.mp3`. Update an `audio.json`
   manifest with the sentence list and audio URLs.

2. **Augment the section JSON / add a sidecar**:
   ```jsonc
   // public/data/m06/025.audio.json
   {
     "version": 1,
     "voice": "openai/tts-1-hd/onyx",
     "sentences": [
       { "index": 0, "text": "...", "src": "025/000.mp3", "duration": 4.2 },
       { "index": 1, "text": "...", "src": "025/001.mp3", "duration": 6.8 }
     ]
   }
   ```

3. **Update `useReciter.ts`**:
   - Try to load `audio.json` for the section
   - If present, drive playback with an `<audio>` element instead of
     `speechSynthesis`
   - The existing sentence-highlighting logic still works — same `currentIndex`
     contract, just driven by `audio.onended` instead of utterance events
   - Fall back to `speechSynthesis` when no audio sidecar exists

4. **Update the player UI** — voice picker becomes "narration source"
   (recorded vs. browser TTS). Keep speed control (use `audio.playbackRate`).

5. **Re-deploy** — the new MP3s go in `public/data/`, served as static files
   from Vercel's CDN with the immutable-cache headers already configured in
   `vercel.json`.

### API keys + secrets

The narration generator script will need an API key. Pattern to use:

- Read from `OPENAI_API_KEY` / `ELEVENLABS_API_KEY` env var
- Add `.env.local` to `.gitignore` (already covered by Vite's defaults)
- Never commit keys; document required env vars in `README.md`
- For production builds nothing changes — the audio is generated offline

---

## 4. Files to know

```
src/
  data/
    parvas.ts           # 18 parvas metadata (names, Sanskrit, summaries, counts)
    sections.ts         # SectionData type + loadSection / loadManifest
  lib/
    tts.ts              # splitSentences, flattenSentences, voice loader
    useReciter.ts       # The TTS playback hook — REPLACE TO ADD MP3 SUPPORT
  components/
    Header.tsx
    ReciterControls.tsx # Player UI
    SectionReader.tsx   # Renders text with per-sentence spans
  pages/
    HomePage.tsx
    ParvaPage.tsx
    SectionPage.tsx     # Animation lives here (motion.div + AnimatePresence)
    AboutPage.tsx
  App.tsx, main.tsx, index.css

scripts/
  scrape.mjs            # Pulls KMG text from sacred-texts.com
  narrate.mjs           # TODO — add this for audio generation

public/
  data/
    manifest.json       # Auto-rebuilt by scrape.mjs
    m01/001.json ...    # One file per scraped section
```

The animation in `SectionPage.tsx` (look for `<motion.div>` + the
`springTransition` constant). Three knobs:
- Faster: `stiffness: 90`, `mass: 1`
- Slower / heavier: `stiffness: 55`, `mass: 1.8`
- Touch of bounce: `damping: 18` (will overshoot ~3°)

---

## 5. Setting up on a new machine

```bash
# 1. Unzip and enter
cd mahabharata-recital
npm install                       # ~1 minute

# 2. Run locally
npm run dev                       # http://localhost:5173

# 3. Fetch more text (optional — site already ships with 22 sections)
npm run scrape -- --parva=m06     # whole Bhishma Parva, etc.

# 4. Build for production
npm run build
npm run preview                   # smoke-test the build
```

Required tooling:

- Node.js >= 20 (project tested on 22.x)
- npm >= 10

Nothing else (no Docker, no databases). The site is pure static files.

---

## 6. Redeploying to Vercel

The included `.vercel/project.json` links this folder to the existing Vercel
project (`mahabharata-recital`, currently aliased to
`mahabharata-recital.vercel.app`).

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Get a fresh token at https://vercel.com/account/tokens
#    (Old tokens were shared in chat and may have been revoked.)

# 3. Deploy. If you hit the SSL trust error from corporate TLS inspection,
#    set NODE_TLS_REJECT_UNAUTHORIZED=0 for that command (insecure but
#    only affects that shell).
vercel deploy --prod --yes --token=<YOUR_TOKEN>

# Behind a corporate VPN with TLS inspection (PowerShell):
$env:NODE_TLS_REJECT_UNAUTHORIZED=0
vercel deploy --prod --yes --token=<YOUR_TOKEN>
```

If `.vercel/project.json` doesn't link cleanly on the new machine, run
`vercel link` to re-link to the same project (you'll be prompted for the
project name; pick `mahabharata-recital`).

Vercel project IDs (from `.vercel/project.json`):
- Project ID: `prj_WqZL4aSElC5h6Q7wFwP6piScTURE`
- Org / team ID: `team_ewAzfQmwBQL87WPXMRHAm2N2`
- Alias: `mahabharata-recital.vercel.app`

---

## 7. The exact next thing to do

The narration upgrade is the next planned step. To resume:

1. **Pick a TTS provider.** Default recommendation: **OpenAI TTS-1-HD with
   `onyx`** — best price/quality tradeoff, easy single-API setup. Switch to
   ElevenLabs (Rishi/Ananya) if Indian accent matters more than budget.

2. **Pick highlight architecture.** Default recommendation: **one MP3 per
   sentence** — simplest, no alignment, sounds deliberate.

3. **Write `scripts/narrate.mjs`** following the sketch in §3. Mirror the
   shape of `scripts/scrape.mjs`. Generate audio for the seeded sections
   first as a smoke test (~22 sections, ~$3-4 with OpenAI).

4. **Wire `useReciter.ts`** to prefer recorded audio when present, fall back
   to browser TTS otherwise. Keep the existing sentence-index contract so
   `SectionReader.tsx` doesn't change.

5. **Verify locally**, then redeploy.

The full conversation that produced this project is bundled at
[`docs/chat-history.md`](docs/chat-history.md). Search it for "narration"
or "TTS" to find the decision context that led to the open question above.

If you ever want to regenerate that file from a fresh JSONL transcript:

```bash
node scripts/transcript-to-md.mjs <transcript.jsonl> docs/chat-history.md
```

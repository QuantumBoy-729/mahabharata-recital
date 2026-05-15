#!/usr/bin/env node
/**
 * Scrapes the Kisari Mohan Ganguli English translation of the Mahabharata
 * from sacred-texts.com into local JSON, one file per section.
 *
 * Output:
 *   public/data/{parvaSlug}/{padded3}.json   (per-section text)
 *   public/data/manifest.json                (which sections are present)
 *
 * Usage:
 *   node scripts/scrape.mjs                              # everything (long!)
 *   node scripts/scrape.mjs --parva=m01                  # whole parva
 *   node scripts/scrape.mjs --parva=m01 --section=1      # one section
 *   node scripts/scrape.mjs --parva=m01 --from=1 --to=10 # range
 *   node scripts/scrape.mjs --force                      # re-download existing
 *
 * Be polite: there is a configurable delay between requests (default 600ms).
 */
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseHtml } from 'node-html-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = join(ROOT, 'public', 'data');
const SOURCE_BASE = 'https://sacred-texts.com/hin';
const USER_AGENT =
  'mahabharata-recital scraper (educational, https://github.com/your/repo)';

const PARVAS = [
  { slug: 'm01', name: 'Adi Parva', sections: 236 },
  { slug: 'm02', name: 'Sabha Parva', sections: 80 },
  { slug: 'm03', name: 'Vana Parva', sections: 313 },
  { slug: 'm04', name: 'Virata Parva', sections: 72 },
  { slug: 'm05', name: 'Udyoga Parva', sections: 197 },
  { slug: 'm06', name: 'Bhishma Parva', sections: 117 },
  { slug: 'm07', name: 'Drona Parva', sections: 202 },
  { slug: 'm08', name: 'Karna Parva', sections: 96 },
  { slug: 'm09', name: 'Shalya Parva', sections: 65 },
  { slug: 'm10', name: 'Sauptika Parva', sections: 18 },
  { slug: 'm11', name: 'Stri Parva', sections: 27 },
  { slug: 'm12', name: 'Shanti Parva', sections: 365 },
  { slug: 'm13', name: 'Anushasana Parva', sections: 168 },
  { slug: 'm14', name: 'Ashvamedhika Parva', sections: 96 },
  { slug: 'm15', name: 'Ashramavasika Parva', sections: 39 },
  { slug: 'm16', name: 'Mausala Parva', sections: 9 },
  { slug: 'm17', name: 'Mahaprasthanika Parva', sections: 3 },
  { slug: 'm18', name: 'Svargarohanika Parva', sections: 5 },
];

function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, raw = 'true'] = arg.slice(2).split('=');
    args[key] = raw;
  }
  return args;
}

function paddedSection(n) {
  return String(n).padStart(3, '0');
}

function sectionUrl(parvaSlug, section) {
  return `${SOURCE_BASE}/${parvaSlug}/${parvaSlug}${paddedSection(section)}.htm`;
}

function sectionFilePath(parvaSlug, section) {
  return join(DATA_DIR, parvaSlug, `${paddedSection(section)}.json`);
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res.text();
}

/**
 * Extracts paragraphs from a sacred-texts.com Mahabharata section page.
 *
 * Page structure (consistent across all books):
 *   - A title link "p. NNN" near the top
 *   - A bold header like "SECTION I"
 *   - One or more <p> paragraphs of body text
 *   - A trailing nav block (Next/Previous/Up) we want to drop
 */
function extractSection(html, source, parva, section) {
  const root = parseHtml(html);
  // Strip script/style tags and nav links before walking text.
  for (const el of root.querySelectorAll('script, style, noscript, iframe')) {
    el.remove();
  }
  for (const a of root.querySelectorAll('a')) {
    const text = (a.text || '').trim();
    if (/^(Next|Previous|Up):/i.test(text)) {
      a.remove();
    }
  }

  let title;
  const header =
    root.querySelector('h1, h2, h3, h4') ??
    root.querySelector('center b') ??
    root.querySelector('b');
  if (header) {
    const t = header.text.replace(/\s+/g, ' ').trim();
    if (t && /section/i.test(t)) title = t;
  }

  const paragraphs = [];
  for (const p of root.querySelectorAll('p')) {
    let text = p.text.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    // Strip the "[paragraph continues]" prefix the OCR added to mid-page breaks.
    text = text.replace(/^\[paragraph continues\]\s*/i, '');
    // Page-break markers ("p. 12", "p. xi"). They bloat audio.
    if (/^p\.\s*[\divxlcdmIVXLCDM]+$/i.test(text)) continue;
    // Footer / nav remnants from sacred-texts.com.
    if (/^(Next|Previous|Up):/i.test(text)) continue;
    if (/^Sacred Texts/i.test(text)) continue;
    if (/Cloudflare|cdn-cgi|window\.__CF/i.test(text)) continue;
    if (text.length < 4) continue;
    paragraphs.push(text);
  }

  return {
    parva: parva.number,
    parvaSlug: parva.slug,
    parvaName: parva.name,
    section,
    title,
    paragraphs,
    source,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function rebuildManifest() {
  const available = {};
  for (const parva of PARVAS) {
    const dir = join(DATA_DIR, parva.slug);
    if (!existsSync(dir)) continue;
    const files = await readdir(dir);
    const nums = files
      .filter((f) => /^\d{3}\.json$/.test(f))
      .map((f) => Number(f.slice(0, 3)))
      .sort((a, b) => a - b);
    if (nums.length) available[parva.slug] = nums;
  }
  const manifest = { available, generatedAt: new Date().toISOString() };
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    join(DATA_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );
  return manifest;
}

async function scrapeSection(parva, section, { force, delay }) {
  const out = sectionFilePath(parva.slug, section);
  if (!force && existsSync(out)) {
    return { skipped: true };
  }
  const url = sectionUrl(parva.slug, section);
  const html = await fetchText(url);
  const data = extractSection(html, url, parva, section);
  if (!data.paragraphs.length) {
    throw new Error(`no paragraphs parsed at ${url}`);
  }
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(data, null, 2), 'utf8');
  await sleep(delay);
  return { written: true, paragraphs: data.paragraphs.length };
}

async function main() {
  const args = parseArgs(process.argv);
  const force = args.force === 'true';
  const delay = Number(args.delay ?? 600);

  // Build the work list.
  let targets;
  if (args.parva) {
    const parva = {
      ...PARVAS.find((p) => p.slug === args.parva),
      number: PARVAS.findIndex((p) => p.slug === args.parva) + 1,
    };
    if (!parva.slug) {
      console.error(`unknown parva: ${args.parva}`);
      process.exit(1);
    }
    let from = 1;
    let to = parva.sections;
    if (args.section) {
      from = to = Number(args.section);
    } else {
      if (args.from) from = Number(args.from);
      if (args.to) to = Number(args.to);
    }
    targets = [];
    for (let s = from; s <= to; s++) targets.push({ parva, section: s });
  } else {
    targets = [];
    PARVAS.forEach((p, i) => {
      const parva = { ...p, number: i + 1 };
      for (let s = 1; s <= p.sections; s++) targets.push({ parva, section: s });
    });
  }

  console.log(
    `Scraping ${targets.length} section(s)${force ? ' (force re-download)' : ''}`,
  );
  let written = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < targets.length; i++) {
    const { parva, section } = targets[i];
    const tag = `${parva.slug}/${paddedSection(section)}`;
    try {
      const r = await scrapeSection(parva, section, { force, delay });
      if (r.skipped) {
        skipped++;
        if (i % 50 === 0) console.log(`  [${i + 1}/${targets.length}] ${tag} skipped`);
      } else {
        written++;
        console.log(
          `  [${i + 1}/${targets.length}] ${tag} \u2713 (${r.paragraphs} paragraphs)`,
        );
      }
    } catch (err) {
      failed++;
      failures.push({ tag, error: String(err?.message || err) });
      console.warn(`  [${i + 1}/${targets.length}] ${tag} FAILED: ${err?.message}`);
    }
  }

  await rebuildManifest();
  console.log(
    `\nDone. ${written} written, ${skipped} skipped, ${failed} failed.`,
  );
  if (failures.length) {
    console.log('Failures:');
    for (const f of failures) console.log(`  ${f.tag}: ${f.error}`);
  }
}

// Allow this module to expose its functions for tests / programmatic use.
export { extractSection, rebuildManifest, scrapeSection, PARVAS };

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

// Avoid warning on unused stat import in some Node versions.
void stat;
void readFile;

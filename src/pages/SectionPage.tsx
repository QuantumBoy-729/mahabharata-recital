import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getParva, PARVAS } from '../data/parvas';
import { loadSection, type SectionData } from '../data/sections';
import { useReciter } from '../lib/useReciter';
import { ReciterControls } from '../components/ReciterControls';
import { SectionReader } from '../components/SectionReader';

type LoadState = 'loading' | 'ready' | 'missing';
type TurnDirection = 'forward' | 'backward' | null;

export function SectionPage() {
  const { parvaNumber, sectionNumber } = useParams<{
    parvaNumber: string;
    sectionNumber: string;
  }>();
  const pNum = Number(parvaNumber);
  const sNum = Number(sectionNumber);
  const parva = useMemo(() => getParva(pNum), [pNum]);

  const [state, setState] = useState<LoadState>('loading');
  const [data, setData] = useState<SectionData | null>(null);

  // Fetch the section JSON when the route changes; reset state to "loading"
  // first so we don't show stale paragraphs from the previous section.
  useEffect(() => {
    if (!parva || !Number.isFinite(sNum)) return;
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setState('loading');
    setData(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    loadSection(parva.slug, sNum).then((d) => {
      if (cancelled) return;
      if (!d) {
        setState('missing');
        return;
      }
      setData(d);
      setState('ready');
    });
    return () => {
      cancelled = true;
    };
  }, [parva, sNum]);

  const paragraphs = useMemo(() => data?.paragraphs ?? [], [data]);
  const reciter = useReciter(paragraphs);

  // Page-turn animation: compare the new route to the previous one to decide
  // whether the paper should turn forward (deeper into the epic) or backward.
  // The first render leaves direction null so the page just appears \u2014 the
  // animation only fires on real navigation.
  const routeKey = `${pNum}:${sNum}`;
  const [turnDirection, setTurnDirection] = useState<TurnDirection>(null);
  const prevRouteKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevRouteKeyRef.current;
    prevRouteKeyRef.current = routeKey;
    if (!prev || prev === routeKey) return;
    const [pP, pS] = prev.split(':').map(Number);
    const isForward = pNum > pP || (pNum === pP && sNum > pS);
    setTurnDirection(isForward ? 'forward' : 'backward');
  }, [routeKey, pNum, sNum]);

  const reduceMotion = useReducedMotion();

  // Tuned for "fluid paper" \u2014 a critically-damped spring (no overshoot) with
  // enough mass to feel weighty but stiffness high enough to settle in
  // ~1 second. Spring physics mean velocity is continuous edge-to-edge \u2014
  // there are no boundary stalls like the keyframe approach had.
  const springTransition = {
    type: 'spring' as const,
    mass: 1.4,
    stiffness: 70,
    damping: 22,
    restDelta: 0.001,
  };

  const initialRotateY =
    turnDirection === 'forward' ? 65 : turnDirection === 'backward' ? -65 : 0;
  const transformOrigin =
    turnDirection === 'forward'
      ? 'left center'
      : turnDirection === 'backward'
      ? 'right center'
      : 'center';

  if (!parva) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink-900">Parva not found.</h1>
        <Link to="/" className="btn-primary mt-4 inline-flex">
          Back to home
        </Link>
      </div>
    );
  }

  const prevSection = sNum > 1 ? sNum - 1 : null;
  const nextSection = sNum < parva.sectionCount ? sNum + 1 : null;
  const prevParva =
    sNum === 1 ? PARVAS.find((p) => p.number === parva.number - 1) : null;
  const nextParva =
    sNum === parva.sectionCount
      ? PARVAS.find((p) => p.number === parva.number + 1)
      : null;

  return (
    <div className="page-turn-stage mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-4 flex items-center justify-between text-sm">
        <Link
          to={`/parva/${parva.number}`}
          className="inline-flex items-center gap-1 text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {parva.name}
        </Link>
        <span className="text-ink-500">
          Section {sNum} of {parva.sectionCount}
        </span>
      </div>

      {/* AnimatePresence with mode="wait" lets the previous section unmount
          before the new one mounts, so the spring animation runs on a single
          element \u2014 no overlapping transforms, no velocity discontinuities.
          The motion.div uses real spring physics, which produces a smooth
          continuous curve from start to settle. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={routeKey}
          className="relative"
          style={{
            transformOrigin,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            willChange: 'transform, opacity',
          }}
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { rotateY: initialRotateY, z: 80, opacity: 0 }
          }
          animate={
            reduceMotion
              ? { opacity: 1 }
              : { rotateY: 0, z: 0, opacity: 1 }
          }
          transition={
            reduceMotion
              ? { duration: 0.22, ease: 'easeOut' }
              : {
                  rotateY: springTransition,
                  z: springTransition,
                  opacity: { duration: 0.45, ease: 'easeOut' },
                }
          }
        >
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron-700">
            Book {parva.number} &middot; {parva.name}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink-900 md:text-4xl">
            {data?.title ?? `Section ${sNum}`}
          </h1>
        </header>

        <div className="mb-8">
          <ReciterControls
            reciter={reciter}
            label={`${parva.name} — Section ${sNum}`}
          />
        </div>

        {state === 'loading' && (
          <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white/60 p-6 text-ink-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading section…
          </div>
        )}

        {state === 'missing' && (
          <MissingSection
            parvaSlug={parva.slug}
            parvaName={parva.name}
            sectionNumber={sNum}
          />
        )}

        {state === 'ready' && data && (
          <article className="rounded-2xl border border-ink-200 bg-white/85 p-6 shadow-sm md:p-10">
            <SectionReader paragraphs={data.paragraphs} reciter={reciter} />
            <footer className="mt-8 border-t border-ink-200 pt-4 text-xs text-ink-500">
              Source:{' '}
              <a
                href={data.source}
                className="underline hover:text-ink-800"
                target="_blank"
                rel="noreferrer noopener"
              >
                sacred-texts.com
              </a>{' '}
              &middot; Translation by Kisari Mohan Ganguli (1883–1896, public
              domain).
            </footer>
          </article>
        )}

        <nav className="mt-10 grid gap-3 sm:grid-cols-2">
          {prevSection ? (
            <Link
              to={`/parva/${parva.number}/section/${prevSection}`}
              className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 hover:border-saffron-400"
            >
              <ArrowLeft className="h-5 w-5 text-ink-500" />
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-500">
                  Previous
                </p>
                <p className="font-serif text-base text-ink-900">
                  {parva.name} &middot; Section {prevSection}
                </p>
              </div>
            </Link>
          ) : prevParva ? (
            <Link
              to={`/parva/${prevParva.number}/section/${prevParva.sectionCount}`}
              className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 hover:border-saffron-400"
            >
              <ArrowLeft className="h-5 w-5 text-ink-500" />
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-500">
                  Previous parva
                </p>
                <p className="font-serif text-base text-ink-900">
                  {prevParva.name}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextSection ? (
            <Link
              to={`/parva/${parva.number}/section/${nextSection}`}
              className="flex items-center justify-end gap-3 rounded-xl border border-ink-200 bg-white p-4 text-right hover:border-saffron-400"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-500">
                  Next
                </p>
                <p className="font-serif text-base text-ink-900">
                  {parva.name} &middot; Section {nextSection}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-500" />
            </Link>
          ) : nextParva ? (
            <Link
              to={`/parva/${nextParva.number}/section/1`}
              className="flex items-center justify-end gap-3 rounded-xl border border-ink-200 bg-white p-4 text-right hover:border-saffron-400"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-500">
                  Next parva
                </p>
                <p className="font-serif text-base text-ink-900">
                  {nextParva.name}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-500" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface MissingProps {
  parvaSlug: string;
  parvaName: string;
  sectionNumber: number;
}

function MissingSection({ parvaSlug, parvaName, sectionNumber }: MissingProps) {
  const padded = String(sectionNumber).padStart(3, '0');
  const sourceUrl = `https://sacred-texts.com/hin/${parvaSlug}/${parvaSlug}${padded}.htm`;
  return (
    <div className="rounded-2xl border border-ink-200 bg-white/80 p-6 md:p-8">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-saffron-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-saffron-700">
        <BookOpen className="h-3.5 w-3.5" />
        Not yet downloaded
      </div>
      <h2 className="font-serif text-2xl text-ink-900">
        {parvaName} &middot; Section {sectionNumber}
      </h2>
      <p className="mt-2 text-ink-600">
        This section&rsquo;s text isn&rsquo;t bundled locally yet. The site ships
        with a curated sample so it works offline; the full corpus is fetched on
        demand by the included scraper.
      </p>
      <div className="mt-5 rounded-xl bg-ink-900 p-4 font-mono text-xs text-ink-100">
        <p className="text-ink-400"># Fetch just this section:</p>
        <p>npm run scrape -- --parva={parvaSlug} --section={sectionNumber}</p>
        <p className="mt-2 text-ink-400"># Or fetch this entire parva:</p>
        <p>npm run scrape -- --parva={parvaSlug}</p>
      </div>
      <p className="mt-4 text-sm text-ink-500">
        You can also read it directly at{' '}
        <a
          href={sourceUrl}
          className="underline hover:text-ink-800"
          target="_blank"
          rel="noreferrer noopener"
        >
          sacred-texts.com
        </a>
        .
      </p>
    </div>
  );
}

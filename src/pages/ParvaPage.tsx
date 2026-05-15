import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { getParva, PARVAS } from '../data/parvas';
import { loadManifest } from '../data/sections';

export function ParvaPage() {
  const { parvaNumber } = useParams<{ parvaNumber: string }>();
  const num = Number(parvaNumber);
  const parva = useMemo(() => getParva(num), [num]);
  const [available, setAvailable] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    loadManifest().then((m) => {
      if (cancelled || !parva) return;
      setAvailable(new Set(m.available[parva.slug] ?? []));
    });
    return () => {
      cancelled = true;
    };
  }, [parva]);

  if (!parva) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Parva not found</h1>
        <p className="mt-3 text-ink-600">
          The Mahabharata has eighteen parvas, numbered 1–18.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to home
        </Link>
      </div>
    );
  }

  const prev = PARVAS.find((p) => p.number === parva.number - 1);
  const next = PARVAS.find((p) => p.number === parva.number + 1);
  const sectionList = Array.from({ length: parva.sectionCount }, (_, i) => i + 1);
  const availableCount = available.size;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" />
        All parvas
      </Link>

      <header className="mt-4 mb-8 border-b border-ink-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-saffron-700">
          Book {parva.number}
        </p>
        <h1 className="mt-1 font-serif text-4xl font-semibold text-ink-900 md:text-5xl">
          {parva.name}
        </h1>
        <p className="font-sanskrit mt-1 text-lg text-ink-500">{parva.sanskrit}</p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-700">
          {parva.summary}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <Link to={`/parva/${parva.number}/section/1`} className="btn-primary">
            Begin section 1
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-ink-500">
            {availableCount > 0
              ? `${availableCount} of ${parva.sectionCount} sections downloaded locally`
              : `${parva.sectionCount} sections — run the scraper to fetch text`}
          </span>
        </div>
      </header>

      <section>
        <h2 className="mb-3 font-serif text-xl font-semibold text-ink-900">
          Sections
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sectionList.map((s) => {
            const isAvailable = available.has(s);
            return (
              <Link
                key={s}
                to={`/parva/${parva.number}/section/${s}`}
                className={`group flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                  isAvailable
                    ? 'border-ink-200 bg-white hover:border-saffron-400 hover:bg-saffron-50'
                    : 'border-dashed border-ink-200 bg-ink-50/50 text-ink-500 hover:border-ink-300 hover:bg-white'
                }`}
                title={
                  isAvailable
                    ? `Section ${s} — available`
                    : `Section ${s} — not yet downloaded`
                }
              >
                <span className="font-medium">Section {s}</span>
                {isAvailable ? (
                  <CheckCircle2 className="h-4 w-4 text-saffron-600" />
                ) : (
                  <Circle className="h-4 w-4 text-ink-300" />
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <nav className="mt-12 grid gap-3 border-t border-ink-200 pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            to={`/parva/${prev.number}`}
            className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 hover:border-saffron-400"
          >
            <ArrowLeft className="h-5 w-5 text-ink-500" />
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-500">
                Previous parva
              </p>
              <p className="font-serif text-lg text-ink-900">{prev.name}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            to={`/parva/${next.number}`}
            className="flex items-center justify-end gap-3 rounded-xl border border-ink-200 bg-white p-4 text-right hover:border-saffron-400"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-500">
                Next parva
              </p>
              <p className="font-serif text-lg text-ink-900">{next.name}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-ink-500" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}

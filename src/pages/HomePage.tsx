import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Languages, ScrollText } from 'lucide-react';
import { PARVAS, TOTAL_SECTIONS } from '../data/parvas';

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
      <section className="mb-14 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-saffron-700">
          The Great Tale of the Bharatas
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-tight text-ink-900 md:text-6xl">
          Listen to the Mahabharata,
          <br />
          one sentence at a time.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-ink-600 md:text-lg">
          A quiet, modern reader for Kisari Mohan Ganguli&rsquo;s English
          translation of the epic. Press play, follow along as each line
          highlights, and let the story unfold across all eighteen parvas.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/parva/1" className="btn-primary">
            Begin with Adi Parva
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/parva/6/section/25" className="btn-outline">
            Jump to the Bhagavad Gita
          </Link>
        </div>
        <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-4 text-center">
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-500">
              Parvas
            </dt>
            <dd className="font-serif text-2xl text-ink-900">18</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-500">
              Sections
            </dt>
            <dd className="font-serif text-2xl text-ink-900">
              {TOTAL_SECTIONS.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-500">
              Translation
            </dt>
            <dd className="font-serif text-2xl text-ink-900">KMG</dd>
          </div>
        </dl>
      </section>

      <section className="mb-14 grid gap-4 md:grid-cols-3">
        <Feature
          icon={<Headphones className="h-5 w-5" />}
          title="Spoken word"
          body="Sentence-by-sentence text-to-speech with adjustable voice, speed and pitch. Click any line to jump there."
        />
        <Feature
          icon={<ScrollText className="h-5 w-5" />}
          title="The full epic"
          body="All eighteen parvas of the Mahabharata, organised section by section, ready to read or recite."
        />
        <Feature
          icon={<Languages className="h-5 w-5" />}
          title="Public domain"
          body="Text is the 1883–1896 Kisari Mohan Ganguli English translation — the first complete rendering into English."
        />
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-2xl font-semibold text-ink-900 md:text-3xl">
            The Eighteen Parvas
          </h2>
          <span className="text-sm text-ink-500">Choose a book to begin</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PARVAS.map((p) => (
            <Link key={p.number} to={`/parva/${p.number}`} className="parva-card group">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-saffron-700">
                  Book {p.number}
                </span>
                <span className="text-xs text-ink-500">
                  {p.sectionCount} sections
                </span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-ink-900">
                {p.name}
              </h3>
              <p className="font-sanskrit mt-0.5 text-sm text-ink-500">
                {p.sanskrit}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-700 line-clamp-4">
                {p.summary}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-saffron-700 transition-transform group-hover:translate-x-0.5">
                Open
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  body: string;
}

function Feature({ icon, title, body }: FeatureProps) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white/70 p-5 shadow-sm">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-saffron-100 text-saffron-700">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-600">{body}</p>
    </div>
  );
}

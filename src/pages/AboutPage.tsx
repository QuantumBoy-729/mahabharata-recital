import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="font-serif text-4xl font-semibold text-ink-900">
        About this site
      </h1>
      <div className="prose-recital mt-6">
        <p>
          The Mahabharata is the longest known epic poem in human literature —
          roughly ten times the combined length of the Iliad and the Odyssey. It
          is told in eighteen books called <em>parvas</em>, and within each parva
          in shorter sections called <em>adhyayas</em>.
        </p>
        <p>
          This site is a quiet, modern reader for that epic. It uses the 1883–1896
          English translation by <strong>Kisari Mohan Ganguli</strong>, the first
          complete rendering of the Mahabharata into English and now in the public
          domain. The text is loaded from{' '}
          <a
            href="https://sacred-texts.com/hin/maha/index.htm"
            target="_blank"
            rel="noreferrer noopener"
          >
            sacred-texts.com
          </a>
          .
        </p>
        <p>
          Recital uses your browser&rsquo;s built-in speech synthesis (the Web
          Speech API). No audio is sent to a server; all narration happens
          locally on your device. You can pick a voice, adjust speed and pitch,
          jump between sentences, and click any line to start reading from
          there.
        </p>
        <h2 className="mt-8 font-serif text-2xl font-semibold text-ink-900">
          A note on the text
        </h2>
        <p>
          Ganguli&rsquo;s translation is faithful, dense, and occasionally
          archaic — it preserves the original&rsquo;s long compound names and
          formal cadence rather than smoothing the story for modern readers.
          Combined with synthetic speech, some lines may sound stilted; clicking
          a sentence to re-hear it usually helps.
        </p>
        <h2 className="mt-8 font-serif text-2xl font-semibold text-ink-900">
          Where to start
        </h2>
        <ul>
          <li>
            <Link to="/parva/1/section/1">Adi Parva, Section 1</Link> — the
            opening of the epic, where the bards arrive at Naimisha forest.
          </li>
          <li>
            <Link to="/parva/6/section/25">Bhishma Parva, Section 25</Link> — the
            beginning of the Bhagavad Gita.
          </li>
          <li>
            <Link to="/parva/17/section/1">Mahaprasthanika Parva, Section 1</Link>{' '}
            — the Pandavas&rsquo; final journey.
          </li>
        </ul>
      </div>
    </div>
  );
}

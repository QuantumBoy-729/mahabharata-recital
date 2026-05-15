import { useEffect, useState } from 'react';
import {
  Pause,
  Play,
  Settings2,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
} from 'lucide-react';
import type { ReciterState } from '../lib/useReciter';

interface Props {
  reciter: ReciterState;
  /** Optional label shown on the left, e.g. "Adi Parva — Section 1". */
  label?: string;
}

export function ReciterControls({ reciter, label }: Props) {
  const {
    supported,
    voices,
    sentences,
    currentIndex,
    isSpeaking,
    isPaused,
    settings,
    setSettings,
    play,
    pause,
    resume,
    stop,
    next,
    prev,
  } = reciter;

  const [showSettings, setShowSettings] = useState(false);

  // English voices first \u2014 they actually pronounce the translation reasonably.
  const sortedVoices = [...voices].sort((a, b) => {
    const aEn = a.lang.toLowerCase().startsWith('en') ? 0 : 1;
    const bEn = b.lang.toLowerCase().startsWith('en') ? 0 : 1;
    if (aEn !== bEn) return aEn - bEn;
    return a.name.localeCompare(b.name);
  });

  // Auto-pick a sane default voice on first load.
  useEffect(() => {
    if (settings.voiceURI || !voices.length) return;
    const preferred =
      voices.find((v) => v.default && v.lang.toLowerCase().startsWith('en')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('en')) ??
      voices[0];
    if (preferred) setSettings({ voiceURI: preferred.voiceURI });
  }, [voices, settings.voiceURI, setSettings]);

  if (!supported) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Your browser does not support the Web Speech API, so recital is unavailable.
        You can still read the text below. Try the latest Chrome, Edge, or Safari.
      </div>
    );
  }

  const total = sentences.length;
  const progress = total > 0 ? ((currentIndex + (isSpeaking ? 1 : 0)) / total) * 100 : 0;

  const onTogglePlay = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isSpeaking && isPaused) {
      resume();
    } else {
      play();
    }
  };

  return (
    <div className="rounded-2xl border border-ink-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-ink-500">
            Recital
          </p>
          <p className="truncate font-serif text-base text-ink-900">
            {label ?? 'Press play to begin'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            disabled={currentIndex === 0 && !isSpeaking}
            className="btn-ghost h-10 w-10 rounded-full p-0"
            aria-label="Previous sentence"
            title="Previous sentence"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={total === 0}
            className="btn-primary h-12 w-12 rounded-full p-0"
            aria-label={
              isSpeaking && !isPaused
                ? 'Pause'
                : isSpeaking && isPaused
                ? 'Resume'
                : 'Play'
            }
            title={
              isSpeaking && !isPaused
                ? 'Pause'
                : isSpeaking && isPaused
                ? 'Resume'
                : 'Play'
            }
          >
            {isSpeaking && !isPaused ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={currentIndex >= total - 1}
            className="btn-ghost h-10 w-10 rounded-full p-0"
            aria-label="Next sentence"
            title="Next sentence"
          >
            <SkipForward className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={stop}
            disabled={!isSpeaking && currentIndex === 0}
            className="btn-ghost h-10 w-10 rounded-full p-0"
            aria-label="Stop"
            title="Stop and rewind"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className={`btn-ghost h-10 w-10 rounded-full p-0 ${
              showSettings ? 'bg-ink-100 text-ink-900' : ''
            }`}
            aria-label="Recital settings"
            aria-expanded={showSettings}
            title="Voice and speed"
          >
            <Settings2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full bg-gradient-to-r from-saffron-400 to-saffron-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-ink-500">
          <span>
            Sentence {Math.min(currentIndex + 1, Math.max(total, 1))} of {total}
          </span>
          <span>
            Rate {settings.rate.toFixed(2)}&times;
          </span>
        </div>
      </div>

      {showSettings && (
        <div className="grid gap-4 border-t border-ink-200 bg-ink-50/60 px-4 py-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="flex items-center gap-2 text-ink-700">
              <Volume2 className="h-4 w-4" />
              Voice
            </span>
            <select
              className="select"
              value={settings.voiceURI ?? ''}
              onChange={(e) => setSettings({ voiceURI: e.target.value || null })}
            >
              <option value="">Browser default</option>
              {sortedVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} &mdash; {v.lang}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-700">
              Speed{' '}
              <span className="text-ink-400">({settings.rate.toFixed(2)}&times;)</span>
            </span>
            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.05}
              value={settings.rate}
              onChange={(e) =>
                setSettings({ rate: parseFloat(e.target.value) })
              }
              className="accent-saffron-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-700">
              Pitch{' '}
              <span className="text-ink-400">({settings.pitch.toFixed(2)})</span>
            </span>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={settings.pitch}
              onChange={(e) =>
                setSettings({ pitch: parseFloat(e.target.value) })
              }
              className="accent-saffron-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-700">
              Volume{' '}
              <span className="text-ink-400">
                ({Math.round(settings.volume * 100)}%)
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) =>
                setSettings({ volume: parseFloat(e.target.value) })
              }
              className="accent-saffron-600"
            />
          </label>
        </div>
      )}
    </div>
  );
}

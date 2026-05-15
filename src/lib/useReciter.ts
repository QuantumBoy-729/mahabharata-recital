import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  flattenSentences,
  getVoicesAsync,
  isSpeechSynthesisSupported,
  type FlatSentence,
} from './tts';

export interface ReciterSettings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
  volume: number;
}

export interface ReciterState {
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  sentences: FlatSentence[];
  /** Index into `sentences` of the currently spoken (or paused) sentence. */
  currentIndex: number;
  isSpeaking: boolean;
  isPaused: boolean;
  settings: ReciterSettings;
  setSettings: (next: Partial<ReciterSettings>) => void;
  play: (startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  jumpTo: (index: number) => void;
}

const STORAGE_KEY = 'mahabharata-reciter-settings-v1';

const DEFAULT_SETTINGS: ReciterSettings = {
  voiceURI: null,
  rate: 0.95,
  pitch: 1,
  volume: 1,
};

function loadSettings(): ReciterSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReciterSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: ReciterSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota / privacy mode failures */
  }
}

/**
 * Drives sequential TTS playback of a list of paragraphs with sentence-level
 * highlighting and persistent voice/rate settings. Designed to be the only
 * speechSynthesis consumer in the app.
 */
export function useReciter(paragraphs: string[]): ReciterState {
  const supported = isSpeechSynthesisSupported();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettingsState] = useState<ReciterSettings>(() => loadSettings());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const sentences = useMemo(() => flattenSentences(paragraphs), [paragraphs]);

  // Refs for values the speak loop needs without re-binding on every change.
  const sentencesRef = useRef(sentences);
  const settingsRef = useRef(settings);
  const voicesRef = useRef(voices);
  const indexRef = useRef(0);
  /** Set true while we manually advance/cancel so the onend handler skips. */
  const isManualStopRef = useRef(false);

  useEffect(() => {
    sentencesRef.current = sentences;
  }, [sentences]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    voicesRef.current = voices;
  }, [voices]);

  // Load voices once.
  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    getVoicesAsync().then((v) => {
      if (!cancelled) setVoices(v);
    });
    return () => {
      cancelled = true;
    };
  }, [supported]);

  // When the paragraphs change (new section), stop and reset. The setState
  // calls here mirror the external speechSynthesis state we just cancelled,
  // which is exactly what effects are for; the lint rule is disabled below.
  useEffect(() => {
    if (!supported) return;
    isManualStopRef.current = true;
    window.speechSynthesis.cancel();
    indexRef.current = 0;
    /* eslint-disable react-hooks/set-state-in-effect */
    setCurrentIndex(0);
    setIsSpeaking(false);
    setIsPaused(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      isManualStopRef.current = true;
      window.speechSynthesis.cancel();
    };
    // Depends on paragraphs array identity \u2014 callers pass a stable ref per section.
  }, [paragraphs, supported]);

  const setSettings = useCallback((next: Partial<ReciterSettings>) => {
    setSettingsState((prev) => {
      const merged = { ...prev, ...next };
      saveSettings(merged);
      return merged;
    });
  }, []);

  // The speak loop is recursive (onend triggers the next sentence). We keep
  // the latest implementation in a ref so the callback can call into itself
  // without relying on TDZ-violating forward references.
  const speakAtRef = useRef<(idx: number) => void>(() => {});

  const speakAt = useCallback(
    (idx: number) => {
      if (!supported) return;
      const list = sentencesRef.current;
      if (!list.length) return;
      if (idx < 0 || idx >= list.length) {
        isManualStopRef.current = true;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        return;
      }
      const sentence = list[idx];
      const utter = new SpeechSynthesisUtterance(sentence.text);
      const s = settingsRef.current;
      utter.rate = s.rate;
      utter.pitch = s.pitch;
      utter.volume = s.volume;
      const voice = s.voiceURI
        ? voicesRef.current.find((v) => v.voiceURI === s.voiceURI) ?? null
        : null;
      if (voice) utter.voice = voice;

      utter.onend = () => {
        if (isManualStopRef.current) {
          isManualStopRef.current = false;
          return;
        }
        const nextIdx = indexRef.current + 1;
        if (nextIdx >= sentencesRef.current.length) {
          setIsSpeaking(false);
          setIsPaused(false);
          return;
        }
        indexRef.current = nextIdx;
        setCurrentIndex(nextIdx);
        speakAtRef.current(nextIdx);
      };
      utter.onerror = (e) => {
        // "interrupted" / "canceled" fire when we manually stop \u2014 ignore those.
        const err = (e as SpeechSynthesisErrorEvent).error;
        if (err === 'interrupted' || err === 'canceled') return;
        setIsSpeaking(false);
        setIsPaused(false);
      };

      isManualStopRef.current = true;
      window.speechSynthesis.cancel();
      // give the browser a tick to flush the cancel before starting fresh
      setTimeout(() => {
        isManualStopRef.current = false;
        window.speechSynthesis.speak(utter);
        setIsSpeaking(true);
        setIsPaused(false);
      }, 30);
    },
    [supported],
  );

  // Keep the ref pointed at the latest speakAt so onend handlers can recurse.
  useEffect(() => {
    speakAtRef.current = speakAt;
  }, [speakAt]);

  const play = useCallback(
    (startIndex?: number) => {
      if (!supported) return;
      const idx = startIndex ?? indexRef.current ?? 0;
      indexRef.current = idx;
      setCurrentIndex(idx);
      speakAt(idx);
    },
    [supported, speakAt],
  );

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    isManualStopRef.current = true;
    window.speechSynthesis.cancel();
    indexRef.current = 0;
    setCurrentIndex(0);
    setIsSpeaking(false);
    setIsPaused(false);
  }, [supported]);

  const jumpTo = useCallback(
    (idx: number) => {
      indexRef.current = idx;
      setCurrentIndex(idx);
      if (isSpeaking) speakAt(idx);
    },
    [isSpeaking, speakAt],
  );

  const next = useCallback(() => {
    const idx = Math.min(indexRef.current + 1, sentencesRef.current.length - 1);
    jumpTo(idx);
  }, [jumpTo]);

  const prev = useCallback(() => {
    const idx = Math.max(indexRef.current - 1, 0);
    jumpTo(idx);
  }, [jumpTo]);

  // Some browsers (Chrome) silently stop long utterances after ~15s. A periodic
  // resume() while playing keeps it alive without affecting paused state.
  useEffect(() => {
    if (!supported || !isSpeaking || isPaused) return;
    const id = window.setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10_000);
    return () => window.clearInterval(id);
  }, [supported, isSpeaking, isPaused]);

  return {
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
    jumpTo,
  };
}

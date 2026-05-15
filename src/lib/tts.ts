/**
 * Splits a paragraph into "sentences" suitable for sequential TTS playback
 * with sentence-level highlighting. We are conservative \u2014 it's better to
 * have one slightly long sentence than to break mid-thought.
 */
export function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const matches = trimmed.match(/[^.!?\u2026]+[.!?\u2026]+["'\u201d)\]]?(?:\s+|$)/g);
  if (!matches) return [trimmed];
  const result: string[] = [];
  for (const raw of matches) {
    const s = raw.trim();
    if (s) result.push(s);
  }
  if (result.length === 0) return [trimmed];
  return result;
}

export interface FlatSentence {
  /** Index of the parent paragraph in SectionData.paragraphs. */
  paragraphIndex: number;
  /** Index of this sentence within its paragraph. */
  sentenceIndex: number;
  text: string;
}

/** Flatten a list of paragraphs into a single ordered sentence stream. */
export function flattenSentences(paragraphs: string[]): FlatSentence[] {
  const out: FlatSentence[] = [];
  paragraphs.forEach((para, pi) => {
    splitSentences(para).forEach((text, si) => {
      out.push({ paragraphIndex: pi, sentenceIndex: si, text });
    });
  });
  return out;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Get the list of available voices, retrying briefly on browsers that load
 * voices asynchronously (notably Chrome). */
export function getVoicesAsync(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }
    const synth = window.speechSynthesis;
    const initial = synth.getVoices();
    if (initial && initial.length) {
      resolve(initial);
      return;
    }
    let settled = false;
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      synth.onvoiceschanged = null;
      resolve(voices);
    };
    synth.onvoiceschanged = () => finish(synth.getVoices());
    setTimeout(() => finish(synth.getVoices()), timeoutMs);
  });
}

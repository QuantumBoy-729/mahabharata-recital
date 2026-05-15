import { useEffect, useMemo, useRef } from 'react';
import { splitSentences } from '../lib/tts';
import type { ReciterState } from '../lib/useReciter';

interface Props {
  paragraphs: string[];
  reciter: ReciterState;
}

/**
 * Renders the section text with one <span> per sentence so we can highlight
 * the sentence currently being spoken and let the user click any sentence to
 * jump there.
 */
export function SectionReader({ paragraphs, reciter }: Props) {
  // Build the same flat list of sentences the reciter uses, but also keep a
  // per-paragraph view for layout. The flat-index lets us map (p, s) -> i.
  const flatIndex = useMemo(() => {
    const map = new Map<string, number>();
    let i = 0;
    paragraphs.forEach((para, pi) => {
      splitSentences(para).forEach((_text, si) => {
        map.set(`${pi}:${si}`, i);
        i += 1;
      });
    });
    return map;
  }, [paragraphs]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!reciter.isSpeaking || reciter.isPaused) return;
    const el = activeRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [reciter.currentIndex, reciter.isSpeaking, reciter.isPaused]);

  return (
    <div ref={containerRef} className="prose-recital">
      {paragraphs.map((para, pi) => {
        const sentences = splitSentences(para);
        return (
          <p key={pi}>
            {sentences.map((text, si) => {
              const idx = flatIndex.get(`${pi}:${si}`) ?? -1;
              const isActive = idx === reciter.currentIndex && idx !== -1;
              return (
                <span
                  key={si}
                  ref={isActive ? activeRef : undefined}
                  className={`recital-sentence ${isActive ? 'is-active' : ''}`}
                  onClick={() => idx !== -1 && reciter.jumpTo(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && idx !== -1) {
                      e.preventDefault();
                      reciter.jumpTo(idx);
                    }
                  }}
                  title="Click to start recital from here"
                >
                  {text}
                  {si < sentences.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

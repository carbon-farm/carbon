import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TOURS, tourStorageKey, type Audience, type TourStep } from './steps';
import { Bi } from '../i18n/Bi';
import { strings } from '../i18n/strings';

export const START_TOUR_EVENT = 'agriai:start-tour';

// Anything (the Help page, a header button) can start the tour by dispatching this event.
export function startTour() {
  window.dispatchEvent(new Event(START_TOUR_EVENT));
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 6; // breathing room around the highlighted element
const CARD_GAP = 14;

const seenBefore = (key: string) => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return true; // storage blocked: do not nag on every page load
  }
};
const markSeen = (key: string) => {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // ignore
  }
};

const findTarget = (step: TourStep): HTMLElement | null =>
  step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;

// A first-visit guided tour: dims the page, spotlights one thing at a time and explains it in
// English then Telugu. It runs once per person per device (and again when TOUR_VERSION is
// bumped), can be skipped at any moment with a button or Esc, and can be replayed from Help.
// A step whose target is not on the current screen is left out.
export function Tour({ audience, userId, ready }: { audience: Audience; userId?: string | null; ready: boolean }) {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardSize, setCardSize] = useState({ w: 340, h: 220 });
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const key = tourStorageKey(audience, userId);

  const begin = useCallback(() => {
    const usable = TOURS[audience].filter((s) => !s.target || findTarget(s));
    if (usable.length === 0) return;
    setIndex(0);
    setSteps(usable);
  }, [audience]);

  const close = useCallback(() => {
    markSeen(key);
    setSteps(null);
    setRect(null);
  }, [key]);

  // Auto-start once the screen has settled: wait until the number of things the tour can point
  // at stops growing (lists and menus load in after the first paint), for at most 6 seconds.
  useEffect(() => {
    if (!ready || seenBefore(key)) return;
    let last = -1;
    let waited = 0;
    const timer = setInterval(() => {
      waited += 500;
      const count = TOURS[audience].filter((s) => !s.target || findTarget(s)).length;
      if ((count > 0 && count === last) || waited >= 6000) {
        clearInterval(timer);
        begin();
      }
      last = count;
    }, 500);
    return () => clearInterval(timer);
  }, [ready, key, audience, begin]);

  // Replay on request.
  useEffect(() => {
    window.addEventListener(START_TOUR_EVENT, begin);
    return () => window.removeEventListener(START_TOUR_EVENT, begin);
  }, [begin]);

  const step = steps?.[index];

  // Point at the current step's element: bring it into view, then measure it.
  useLayoutEffect(() => {
    if (!step) return;
    const el = findTarget(step);
    if (!el) {
      setRect(null);
      return;
    }
    const narrow = window.innerWidth <= 720;
    el.scrollIntoView({ block: narrow ? 'start' : 'center', inline: 'center', behavior: 'auto' });
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step]);

  // Keep keyboard focus on the Next button, and learn the card's real size for placement.
  useEffect(() => {
    if (!step) return;
    nextRef.current?.focus();
    if (cardRef.current) setCardSize({ w: cardRef.current.offsetWidth, h: cardRef.current.offsetHeight });
  }, [step, index]);

  useEffect(() => {
    if (!steps) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') setIndex((i) => (i < steps.length - 1 ? i + 1 : i));
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steps, close]);

  if (!steps || !step) return null;

  const isLast = index === steps.length - 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const narrow = vw <= 720;

  // Card placement: a bottom sheet on phones; otherwise beside the target (below it if there is
  // room, above it if not), clamped to the screen; centred when there is nothing to point at.
  let cardStyle: React.CSSProperties;
  if (narrow) {
    cardStyle = { left: 12, right: 12, bottom: 12 };
  } else if (!rect) {
    cardStyle = { left: Math.max(12, (vw - cardSize.w) / 2), top: Math.max(12, (vh - cardSize.h) / 2) };
  } else {
    const below = rect.top + rect.height + CARD_GAP;
    const top = below + cardSize.h + 12 <= vh ? below : Math.max(12, rect.top - cardSize.h - CARD_GAP);
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - cardSize.w / 2), vw - cardSize.w - 12);
    cardStyle = { left, top };
  }

  return createPortal(
    <div className="tour-root" role="dialog" aria-modal="true" aria-label={strings.tourLabel.en}>
      {/* a click-catcher so a stray tap on the dimmed page does not navigate away mid-tour */}
      <div className="tour-shield" />
      {rect ? (
        <div className="tour-spot" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
      ) : (
        <div className="tour-dim" />
      )}
      <div className="tour-card" ref={cardRef} style={cardStyle}>
        <div className="tour-count">
          {strings.tourStepOf.en.replace('{n}', String(index + 1)).replace('{total}', String(steps.length))} /{' '}
          {strings.tourStepOf.te.replace('{n}', String(index + 1)).replace('{total}', String(steps.length))}
        </div>
        <p className="tour-text">
          <span className="bi-en">{step.en}</span>
          <span className="bi-te">{step.te}</span>
        </p>
        <div className="tour-actions">
          <button type="button" className="secondary tour-skip" onClick={close}>
            <Bi id="tourSkip" />
          </button>
          <div className="tour-nav">
            {index > 0 && (
              <button type="button" className="secondary" onClick={() => setIndex(index - 1)}>
                <Bi id="tourBack" />
              </button>
            )}
            <button type="button" ref={nextRef} onClick={() => (isLast ? close() : setIndex(index + 1))}>
              <Bi id={isLast ? 'tourDone' : 'tourNext'} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

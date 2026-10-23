import { API_BASE_URL } from '../api/client';

// Privacy-light usage statistics and error reports, sent to our own server (no third party).
// What is sent: what kind of thing happened, its name (a screen path with ids removed, a help
// question, an error message) and the visitor's role. Never a name, number or password; the
// server also strips anything that looks like a mobile number. A browser set to "Do Not Track"
// sends error reports only.

export type EventKind = 'page' | 'chat_answer' | 'chat_unanswered' | 'tour' | 'error';

interface QueuedEvent {
  kind: EventKind;
  name: string;
  detail?: string;
  role?: string;
}

const FLUSH_AT = 10;
const FLUSH_AFTER_MS = 5000;
const MAX_QUEUE = 100;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

const doNotTrack = () => typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1');

function currentRole(): string | undefined {
  try {
    const raw = localStorage.getItem('agriai.session');
    return raw ? (JSON.parse(raw) as { role?: string }).role : undefined;
  } catch {
    return undefined;
  }
}

// "/marketplace/products/3f2a…" -> "/marketplace/products/:id", so the list of screens stays short.
export function normalizePath(pathname: string): string {
  return pathname
    .split('/')
    .map((seg) => (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(seg) || /^\d{4,}$/.test(seg) || (seg.length > 24 && /\d/.test(seg)) ? ':id' : seg))
    .join('/');
}

function send(events: QueuedEvent[], unloading: boolean) {
  if (events.length === 0) return;
  const url = `${API_BASE_URL}/telemetry`;
  const body = JSON.stringify({ events });
  try {
    if (unloading && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      return;
    }
    void fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch {
    // statistics must never get in the way of the app
  }
}

export function flush(unloading = false) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const batch = queue.slice(0, 20);
  queue = queue.slice(20);
  send(batch, unloading);
  if (queue.length > 0) flush(unloading);
}

export function track(kind: EventKind, name: string, detail?: string) {
  if (kind !== 'error' && doNotTrack()) return;
  if (queue.length >= MAX_QUEUE) return;
  queue.push({ kind, name, ...(detail ? { detail } : {}), role: currentRole() });
  if (queue.length >= FLUSH_AT) flush();
  else if (!timer) timer = setTimeout(() => flush(), FLUSH_AFTER_MS);
}

export function trackError(error: unknown, where = 'window') {
  const e = error instanceof Error ? error : new Error(String(error));
  track('error', `${where}: ${e.message}`.slice(0, 200), e.stack?.split('\n').slice(0, 6).join(' | '));
}

let started = false;
// Call once at start-up: reports uncaught errors and sends anything still queued when the page closes.
export function initTelemetry() {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('error', (e) => trackError(e.error ?? e.message, 'window'));
  window.addEventListener('unhandledrejection', (e) => trackError(e.reason, 'promise'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true);
  });
  window.addEventListener('pagehide', () => flush(true));
}

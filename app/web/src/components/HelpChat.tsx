import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../auth/roleHome';
import { audienceFor } from '../tour/steps';
import { startTour } from '../tour/Tour';
import { FAQS, type Faq } from '../help/faq';
import { answer, popularFor } from '../help/faqMatch';
import { Bi, biInline } from '../i18n/Bi';

type Message =
  | { kind: 'user'; text: string }
  | { kind: 'bot'; faqId: string; other: boolean; related: string[] }
  | { kind: 'nomatch'; related: string[] };

const storageKey = (audience: string) => `agriai.chat.v1.${audience}`;

function load(audience: string): Message[] {
  try {
    const raw = sessionStorage.getItem(storageKey(audience));
    const parsed = raw ? (JSON.parse(raw) as Message[]) : [];
    // Drop answers whose FAQ no longer exists (the content changed since this was saved).
    return parsed.filter((m) => m.kind !== 'bot' || FAQS.some((f) => f.id === m.faqId));
  } catch {
    return [];
  }
}

function save(audience: string, messages: Message[]) {
  try {
    sessionStorage.setItem(storageKey(audience), JSON.stringify(messages.slice(-40)));
  } catch {
    // storage blocked: the conversation just will not survive a page change
  }
}

const faqById = (id: string): Faq | undefined => FAQS.find((f) => f.id === id);

function Stacked({ text }: { text: { en: string; te: string } }) {
  return (
    <>
      <span className="bi-en">{text.en}</span>
      <span className="bi-te">{text.te}</span>
    </>
  );
}

// The help assistant: a round button at the bottom right of every screen that opens a small
// chat. It answers from the FAQ list (help/faq.ts) — no server, no AI, the same answer every
// time — in English then Telugu, and links straight to the screen being described.
export function HelpChat() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const audience = audienceFor(session?.role);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => load(audience));
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // A different person (or login state) gets a clean conversation of their own.
  useEffect(() => {
    setMessages(load(audience));
  }, [audience]);

  useEffect(() => {
    save(audience, messages);
  }, [audience, messages]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const el = logRef.current;
    // A fresh chat shows its greeting from the top; once there are messages, follow the latest.
    if (el) el.scrollTop = messages.length === 0 ? 0 : el.scrollHeight;
  }, [messages, open]);

  function ask(text: string, forced?: Faq) {
    const q = text.trim();
    if (!q) return;
    if (forced) {
      setMessages((m) => [...m, { kind: 'user', text: q }, { kind: 'bot', faqId: forced.id, other: false, related: [] }]);
      return;
    }
    const result = answer(q, audience);
    setMessages((m) => [
      ...m,
      { kind: 'user', text: q },
      result.best
        ? { kind: 'bot', faqId: result.best.faq.id, other: result.otherAudience, related: result.related.map((f) => f.id) }
        : { kind: 'nomatch', related: result.related.map((f) => f.id) },
    ]);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    ask(input);
    setInput('');
  }

  function goTo(path: string) {
    setOpen(false);
    navigate(path);
  }

  function replayTour() {
    setOpen(false);
    navigate(session ? roleHomePath(session.role) : '/marketplace');
    setTimeout(startTour, 1200);
  }

  const suggestions = (ids: string[]) =>
    ids
      .map(faqById)
      .filter((f): f is Faq => !!f)
      .map((f) => (
        <button type="button" className="chat-chip" key={f.id} onClick={() => ask(`${f.q.en} / ${f.q.te}`, f)}>
          <Stacked text={f.q} />
        </button>
      ));

  return (
    <>
      {!open && (
        <button
          type="button"
          className="chat-fab"
          data-tour="chat"
          onClick={() => setOpen(true)}
          aria-label={biInline('chatOpenLabel')}
          title={biInline('chatOpenLabel')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z" />
            <path d="M9.6 9.2a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .8-1 1.6" />
            <path d="M12 16.2h.01" />
          </svg>
          <span className="chat-fab-label">
            <Bi id="chatOpenLabel" />
          </span>
        </button>
      )}

      {open && (
        <section className="chat-panel" role="dialog" aria-label={biInline('chatTitle')}>
          <header className="chat-head">
            <Bi id="chatTitle" as="strong" />
            <div className="chat-head-actions">
              {messages.length > 0 && (
                <button type="button" className="link-button" onClick={() => setMessages([])}>
                  <Bi id="chatClear" />
                </button>
              )}
              <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label={biInline('chatClose')}>
                ✕
              </button>
            </div>
          </header>

          <div className="chat-log" ref={logRef} role="log" aria-live="polite">
            <div className="chat-msg bot">
              <Bi id="chatGreeting" />
              {messages.length === 0 && (
                <div className="chat-chips">
                  <span className="chat-chips-label">
                    <Bi id="chatPopular" />
                  </span>
                  {suggestions(popularFor(audience).map((f) => f.id))}
                </div>
              )}
            </div>

            {messages.map((m, i) => {
              if (m.kind === 'user') {
                return (
                  <div className="chat-msg user" key={i}>
                    {m.text}
                  </div>
                );
              }
              if (m.kind === 'nomatch') {
                return (
                  <div className="chat-msg bot" key={i}>
                    <Bi id="chatNoMatch" />
                    {m.related.length > 0 && (
                      <div className="chat-chips">
                        <span className="chat-chips-label">
                          <Bi id="chatTryAsking" />
                        </span>
                        {suggestions(m.related)}
                      </div>
                    )}
                    <div className="chat-actions">
                      <button type="button" onClick={() => goTo('/help')}>
                        <Bi id="chatOpenHelp" />
                      </button>
                    </div>
                    <small className="chat-note">
                      <Bi id="chatStillStuck" />
                    </small>
                  </div>
                );
              }
              const faq = faqById(m.faqId);
              if (!faq) return null;
              return (
                <div className="chat-msg bot" key={i}>
                  {m.other && (
                    <small className="chat-note">
                      <Bi id="chatOtherAudience" />
                    </small>
                  )}
                  {faq.a.map((p, j) => (
                    <p key={j}>
                      <Stacked text={p} />
                    </p>
                  ))}
                  <div className="chat-actions">
                    {faq.id === 'tour' && (
                      <button type="button" onClick={replayTour}>
                        <Bi id="tourReplayButton" />
                      </button>
                    )}
                    {faq.link && !m.other && (
                      <button type="button" onClick={() => goTo(faq.link!.to)}>
                        <Stacked text={faq.link.label} />
                      </button>
                    )}
                    {faq.link && m.other && (
                      <Link to="/help" className="link-button" onClick={() => setOpen(false)}>
                        <Bi id="chatOpenHelp" />
                      </Link>
                    )}
                  </div>
                  {m.related.length > 0 && (
                    <div className="chat-chips">
                      <span className="chat-chips-label">
                        <Bi id="chatTryAsking" />
                      </span>
                      {suggestions(m.related)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <form className="chat-form" onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={biInline('chatPlaceholder')}
              aria-label={biInline('chatPlaceholder')}
              maxLength={200}
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim()}>
              <Bi id="chatSend" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}

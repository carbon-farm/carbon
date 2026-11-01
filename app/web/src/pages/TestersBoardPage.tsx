import { Fragment, useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import {
  listBoard,
  postBoardItem,
  postBoardReply,
  setBoardStatus,
  type BoardItem,
  type BoardKind,
  type BoardStatus,
} from '../api/testerBoard';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, type Bilingual, type StringKey } from '../i18n/strings';

const KINDS: { value: BoardKind; key: StringKey }[] = [
  { value: 'BUG', key: 'tbKindBug' },
  { value: 'REQUIREMENT', key: 'tbKindRequirement' },
  { value: 'FEEDBACK', key: 'tbKindFeedback' },
  { value: 'QUESTION', key: 'tbKindQuestion' },
];
const STATUSES: { value: BoardStatus; key: StringKey }[] = [
  { value: 'NEW', key: 'tbStatusNew' },
  { value: 'SEEN', key: 'tbStatusSeen' },
  { value: 'IN_PROGRESS', key: 'tbStatusInProgress' },
  { value: 'DONE', key: 'tbStatusDone' },
  { value: 'WONT_DO', key: 'tbStatusWontDo' },
];
const kindLabel = (k: BoardKind): Bilingual => strings[KINDS.find((x) => x.value === k)!.key];
const statusLabel = (s: BoardStatus): Bilingual => strings[STATUSES.find((x) => x.value === s)!.key];
const both = (b: Bilingual) => `${b.en} / ${b.te}`;

const NAME_KEY = 'agriai.testerName';
const POLL_MS = 60_000;

type SortKey = 'number' | 'kind' | 'where' | 'what' | 'by' | 'status' | 'replies';

const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const replyCount = (i: BoardItem) => i.comments.filter((c) => !c.isSystem).length;

function readName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

// The testers' board: where testers post what they find or need — errors, requirements, feedback,
// questions — and follow what happens to it. It needs no sign-in: the secret in the address is the
// key, and the developer reads the same list through the API. (It replaced the shared sheet.)
export function TestersBoardPage() {
  const { key = '' } = useParams();
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [badLink, setBadLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState(readName);
  const [busy, setBusy] = useState(false);
  // the new-item form
  const [kind, setKind] = useState<BoardKind>('BUG');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [expected, setExpected] = useState('');
  const [trap, setTrap] = useState(''); // hidden box only a bot fills in
  // the list
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [byFilter, setByFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [openId, setOpenId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});

  // the page is not for search engines
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const previous = document.title;
    document.title = "Testers' board";
    return () => {
      meta.remove();
      document.title = previous;
    };
  }, []);

  const load = useCallback(
    async (quiet = false) => {
      try {
        setItems(await listBoard(key));
        setBadLink(false);
        if (!quiet) setError(null);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) setBadLink(true);
        else if (!quiet) setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
      } finally {
        setLoading(false);
      }
    },
    [key],
  );

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void load(true);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  function rememberName(value: string) {
    setName(value);
    try {
      localStorage.setItem(NAME_KEY, value);
    } catch {
      /* the name just is not remembered */
    }
  }

  const needName = () => {
    if (name.trim()) return false;
    setError(both(strings.tbNeedName));
    return true;
  };

  async function guarded(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setBadLink(true);
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handlePost(event: FormEvent) {
    event.preventDefault();
    if (needName()) return;
    await guarded(async () => {
      await postBoardItem(key, {
        kind,
        location: location.trim() || undefined,
        description: description.trim(),
        expected: expected.trim() || undefined,
        authorName: name.trim(),
        faxExtra: trap || undefined,
      });
      setLocation('');
      setDescription('');
      setExpected('');
      setNotice(both(strings.tbPosted));
      await load(true);
    });
  }

  async function handleReply(item: BoardItem) {
    const body = (replies[item.id] ?? '').trim();
    if (!body || needName()) return;
    await guarded(async () => {
      await postBoardReply(key, item.id, { authorName: name.trim(), body });
      setReplies((r) => ({ ...r, [item.id]: '' }));
      await load(true);
    });
  }

  async function handleStatus(item: BoardItem, status: BoardStatus) {
    if (status === item.status || needName()) return;
    await guarded(async () => {
      await setBoardStatus(key, item.id, { status, by: name.trim() });
      await load(true);
    });
  }

  const authors = useMemo(() => [...new Set(items.map((i) => i.authorName))].sort((a, b) => a.localeCompare(b)), [items]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) c[i.status] = (c[i.status] ?? 0) + 1;
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = items.filter(
      (i) =>
        (!kindFilter || i.kind === kindFilter) &&
        (!statusFilter || i.status === statusFilter) &&
        (!byFilter || i.authorName === byFilter) &&
        (!q || [i.description, i.expected ?? '', i.location ?? '', i.authorName, String(i.number), ...i.comments.map((c) => c.body)].some((v) => v.toLowerCase().includes(q))),
    );
    const cmp = (a: BoardItem, b: BoardItem) => {
      switch (sortKey) {
        case 'kind':
          return a.kind.localeCompare(b.kind);
        case 'where':
          return (a.location ?? '').localeCompare(b.location ?? '');
        case 'what':
          return a.description.localeCompare(b.description);
        case 'by':
          return a.authorName.localeCompare(b.authorName);
        case 'status':
          return STATUSES.findIndex((s) => s.value === a.status) - STATUSES.findIndex((s) => s.value === b.status);
        case 'replies':
          return replyCount(a) - replyCount(b);
        default:
          return a.number - b.number;
      }
    };
    return rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
  }, [items, search, kindFilter, statusFilter, byFilter, sortKey, sortDir]);

  function sortBy(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir(k === 'number' ? 'desc' : 'asc');
    }
  }
  const th = (k: SortKey, label: Bilingual) => (
    <th
      className="sortable"
      tabIndex={0}
      aria-sort={k === sortKey ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      onClick={() => sortBy(k)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), sortBy(k))}
    >
      {label.en} / {label.te}
      {k === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );

  if (badLink) {
    return (
      <main className="screen testers-board">
        <Bi id="testersBoardTitle" as="h1" />
        <div className="error-banner">{both(strings.tbBadLink)}</div>
      </main>
    );
  }

  return (
    <main className="screen testers-board">
      <div>
        <Bi id="testersBoardTitle" as="h1" />
        <BiValue value={strings.testersBoardIntro} as="p" className="hint" />
      </div>

      {error && <div className="error-banner">{error}</div>}
      {notice && (
        <div className="payment-strip" role="status">
          {notice}
        </div>
      )}

      <section className="card">
        <label>
          <Bi id="tbYourName" />
          <input value={name} maxLength={60} onChange={(e) => rememberName(e.target.value)} placeholder={biInline('tbYourName')} autoComplete="name" />
          <small className="hint">
            <Bi id="tbNameHint" />
          </small>
        </label>
      </section>

      <form className="card" onSubmit={handlePost}>
        <Bi id="tbAddHeading" as="h2" />
        <label>
          <Bi id="tbColType" />
          <select value={kind} onChange={(e) => setKind(e.target.value as BoardKind)}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {both(strings[k.key])}
              </option>
            ))}
          </select>
        </label>
        <label>
          <Bi id="tbLocation" />
          <input value={location} maxLength={200} onChange={(e) => setLocation(e.target.value)} placeholder={biInline('tbLocationHint')} />
        </label>
        <label>
          <Bi id="tbDescription" />
          <textarea value={description} maxLength={4000} rows={4} required minLength={5} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          <Bi id="tbExpected" />
          <textarea value={expected} maxLength={2000} rows={2} onChange={(e) => setExpected(e.target.value)} />
        </label>
        {/* a trap for bots: people never see or fill this */}
        <input
          type="text"
          name="faxExtra"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }}
        />
        <button type="submit" disabled={busy || description.trim().length < 5}>
          {busy ? <BiValue value={strings.tbPosting} /> : <Bi id="tbPost" />}
        </button>
      </form>

      <section className="card">
        <div className="top-bar">
          <small className="hint">
            {strings.tbCount.en.replace('{n}', String(items.length))} / {strings.tbCount.te.replace('{n}', String(items.length))}
          </small>
          <button type="button" className="secondary" onClick={() => void load()}>
            <Bi id="tbRefresh" />
          </button>
        </div>

        <div className="chip-row" role="group" aria-label={biInline('tbColStatus')}>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={statusFilter === s.value ? 'chip-on' : 'secondary'}
              aria-pressed={statusFilter === s.value}
              onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
            >
              {both(strings[s.key])} ({counts[s.value] ?? 0})
            </button>
          ))}
        </div>

        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          <label>
            <Bi id="tbColType" />
            <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {both(strings[k.key])}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Bi id="tbColBy" />
            <select value={byFilter} onChange={(e) => setByFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {authors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <BiValue value={strings.loading} as="p" className="hint" />
        ) : visible.length === 0 ? (
          <BiValue value={strings.tbNone} as="p" className="hint" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {th('number', strings.tbColNumber)}
                  {th('kind', strings.tbColType)}
                  {th('where', strings.tbColWhere)}
                  {th('what', strings.tbColWhat)}
                  {th('by', strings.tbColBy)}
                  {th('status', strings.tbColStatus)}
                  {th('replies', strings.tbColReplies)}
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((i) => {
                  const open = openId === i.id;
                  return (
                    <Fragment key={i.id}>
                      <tr>
                        <td>{i.number}</td>
                        <td>{both(kindLabel(i.kind))}</td>
                        <td>{i.location}</td>
                        <td style={{ maxWidth: 360 }}>{i.description.length > 140 && !open ? `${i.description.slice(0, 140)}…` : i.description}</td>
                        <td>
                          {i.authorName}
                          <div className="meta">{when(i.createdAt)}</div>
                        </td>
                        <td>{both(statusLabel(i.status))}</td>
                        <td>{replyCount(i)}</td>
                        <td>
                          <button type="button" className="secondary" aria-expanded={open} onClick={() => setOpenId(open ? null : i.id)}>
                            {open ? <Bi id="tbCloseItem" /> : <Bi id="tbOpenItem" />}
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={8}>
                            <div className="board-detail">
                              <div style={{ whiteSpace: 'pre-wrap' }}>{i.description}</div>
                              {i.expected && (
                                <div>
                                  <strong>
                                    <Bi id="tbExpectedLabel" />:
                                  </strong>{' '}
                                  <span style={{ whiteSpace: 'pre-wrap' }}>{i.expected}</span>
                                </div>
                              )}
                              <label>
                                <Bi id="tbChangeStatus" />
                                <select value={i.status} disabled={busy} onChange={(e) => void handleStatus(i, e.target.value as BoardStatus)}>
                                  {STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                      {both(strings[s.key])}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              {i.comments.map((c) => (
                                <div key={c.id} className={c.isSystem ? 'meta' : 'board-reply'}>
                                  {c.isSystem ? (
                                    <em>
                                      {c.body} · {when(c.createdAt)}
                                    </em>
                                  ) : (
                                    <>
                                      <strong>{c.authorName}</strong> <span className="meta">{when(c.createdAt)}</span>
                                      <div style={{ whiteSpace: 'pre-wrap' }}>{c.body}</div>
                                    </>
                                  )}
                                </div>
                              ))}
                              <div className="chip-add">
                                <input
                                  value={replies[i.id] ?? ''}
                                  maxLength={2000}
                                  placeholder={biInline('tbReplyPlaceholder')}
                                  aria-label={biInline('tbReplyPlaceholder')}
                                  onChange={(e) => setReplies((r) => ({ ...r, [i.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      void handleReply(i);
                                    }
                                  }}
                                />
                                <button type="button" onClick={() => void handleReply(i)} disabled={busy || !(replies[i.id] ?? '').trim()}>
                                  <Bi id="tbReplyButton" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

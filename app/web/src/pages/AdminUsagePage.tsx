import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getUsageSummary, type UsageRow, type UsageSummary } from '../api/admin';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';

type SortKey = 'name' | 'count' | 'lastAt';
type SortDir = 'asc' | 'desc';

// One sortable, searchable table of "name — how many — last seen".
function UsageTable({ rows, nameColumn }: { rows: UsageRow[]; nameColumn: StringKey }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = rows.filter((r) => !q || r.name.toLowerCase().includes(q));
    const cmp = (a: UsageRow, b: UsageRow) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'count') return a.count - b.count;
      return (a.lastAt ?? '').localeCompare(b.lastAt ?? '');
    };
    return filtered.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
  }, [rows, search, sortKey, sortDir]);

  function sortBy(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  }
  const arrow = (key: SortKey) => (key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');
  const th = (key: SortKey, label: { en: string; te: string }) => (
    <th className="sortable" onClick={() => sortBy(key)}>
      {label.en} / {label.te}
      {arrow(key)}
    </th>
  );

  if (rows.length === 0) return <BiValue value={strings.usageNoData} as="p" className="hint" />;
  return (
    <>
      <div className="list-toolbar">
        <label>
          <Bi id="searchPlaceholder" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
        </label>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {th('name', strings[nameColumn])}
              {th('count', strings.usageCountColumn)}
              {th('lastAt', strings.usageLastColumn)}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.name}>
                <td style={{ overflowWrap: 'anywhere' }}>{r.name}</td>
                <td>{r.count}</td>
                <td>{r.lastAt ? new Date(r.lastAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// What people actually do in the app, from the app's own statistics (no third party, no names or
// numbers). The most useful table is "Questions the help assistant could not answer": each one
// is a missing FAQ entry (help/faq.ts) or a screen people cannot find.
export function AdminUsagePage() {
  const { session, logout } = useAuth();
  const [days, setDays] = useState(14);
  const [data, setData] = useState<UsageSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setLoading(true);
    getUsageSummary(session.accessToken, days)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) logout();
        else setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [session, days, logout]);

  const total = (k: string) => data?.totals[k] ?? 0;

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="usageTitle" as="h1" />
      </div>
      <BiValue value={strings.usageHint} as="p" className="hint" />

      <div className="list-toolbar">
        <label>
          <Bi id="usageDaysFilter" />
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {[7, 14, 30, 90].map((d) => (
              <option key={d} value={d}>
                {d} {strings.usageDaysUnit.en} / {strings.usageDaysUnit.te}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && !data ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        data && (
          <>
            <div className="stat-grid">
              <div className="card stat">
                <Bi id="usageStatPages" as="div" className="field-label" />
                <strong>{total('page')}</strong>
              </div>
              <div className="card stat">
                <Bi id="usageStatAnswered" as="div" className="field-label" />
                <strong>{total('chat_answer')}</strong>
              </div>
              <div className="card stat">
                <Bi id="usageStatUnanswered" as="div" className="field-label" />
                <strong>{total('chat_unanswered')}</strong>
              </div>
              <div className="card stat">
                <Bi id="usageStatErrors" as="div" className="field-label" />
                <strong>{total('error')}</strong>
              </div>
            </div>

            <div className="card">
              <Bi id="usageUnansweredHeading" as="h2" />
              <BiValue value={strings.usageUnansweredHint} as="p" className="hint" />
              <UsageTable rows={data.unanswered} nameColumn="usageQuestionColumn" />
            </div>

            <div className="card">
              <Bi id="usageErrorsHeading" as="h2" />
              <BiValue value={strings.usageErrorsHint} as="p" className="hint" />
              <UsageTable rows={data.errors} nameColumn="usageErrorColumn" />
            </div>

            <div className="card">
              <Bi id="usagePagesHeading" as="h2" />
              {data.pageViewsByRole.length > 0 && (
                <p className="hint">
                  {data.pageViewsByRole.map((r) => `${r.role}: ${r.count}`).join(' · ')}
                </p>
              )}
              <UsageTable rows={data.pages} nameColumn="usageScreenColumn" />
            </div>

            <div className="card">
              <Bi id="usageAnsweredHeading" as="h2" />
              <UsageTable rows={data.answered} nameColumn="usageAnswerColumn" />
            </div>

            <div className="card">
              <Bi id="usageToursHeading" as="h2" />
              <UsageTable rows={data.tours} nameColumn="usageTourColumn" />
            </div>
          </>
        )
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

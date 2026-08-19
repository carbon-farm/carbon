import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listMyCases, type Case } from '../api/cases';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel, caseStatusLabel } from '../i18n/strings';

type SortMode = 'newest' | 'oldest' | 'priority' | 'status';

export function CasesPage() {
  const { session, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    listMyCases(session.accessToken)
      .then(setCases)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCases.en} / ${strings.couldNotLoadCases.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const statuses = useMemo(() => Array.from(new Set(cases.map((c) => c.status))), [cases]);
  const categories = useMemo(
    () => Array.from(new Map(cases.map((c) => [c.category.id, c.category.name])).entries()),
    [cases],
  );

  const visible = useMemo(() => {
    let rows = cases;
    if (statusFilter) rows = rows.filter((c) => c.status === statusFilter);
    if (categoryFilter) rows = rows.filter((c) => c.category.id === categoryFilter);
    rows = [...rows];
    switch (sortMode) {
      case 'oldest':
        rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case 'priority':
        rows.sort((a, b) => Number(b.isPriority) - Number(a.isPriority) || b.updatedAt.localeCompare(a.updatedAt));
        break;
      case 'status':
        rows.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return rows;
  }, [cases, statusFilter, categoryFilter, sortMode]);

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="myCasesEyebrow" as="span" className="eyebrow" />
          <Bi id="myCasesTitle" as="h1" />
        </div>
        <Link to="/cases/new">
          <button type="button">
            <Bi id="newCaseButton" />
          </button>
        </Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && cases.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="statusFilterLabel" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {statuses.map((s) => {
                const label = caseStatusLabel(s);
                return (
                  <option key={s} value={s}>
                    {label.en} / {label.te}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            <Bi id="categoryLabel" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {categories.map(([id, name]) => {
                const label = caseCategoryLabel(name);
                return (
                  <option key={id} value={id}>
                    {label.en} / {label.te}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
              <option value="priority">{biInline('sortPriorityFirst')}</option>
              <option value="status">{biInline('sortStatusAZ')}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : cases.length === 0 ? (
        <BiValue value={strings.noCasesYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((c) => {
            const status = caseStatusLabel(c.status, c.closureReason);
            const category = caseCategoryLabel(c.category.name);
            return (
              <Link to={`/cases/${c.id}`} key={c.id} className="case-item">
                <div className="top-bar">
                  <div className="label">{c.caseNumber ?? <BiValue value={strings.statusDraft} />}</div>
                  {c.isPriority && <BiValue value={strings.priorityBadgeLabel} as="span" className="priority-badge" />}
                </div>
                <div className="meta">
                  <BiValue value={category} />
                </div>
                <div className="status-line">
                  <BiValue value={status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link to="/dashboard" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

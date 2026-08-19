import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listAssignedCases, type Case } from '../api/cases';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel, caseStatusLabel } from '../i18n/strings';

type SortMode = 'priority' | 'newest' | 'oldest' | 'status';

export function ExpertCasesPage() {
  const { session, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('priority');

  useEffect(() => {
    if (!session) return;
    listAssignedCases(session.accessToken)
      .then(setCases)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadAssigned.en} / ${strings.couldNotLoadAssigned.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const statuses = useMemo(() => Array.from(new Set(cases.map((c) => c.status))), [cases]);

  const visible = useMemo(() => {
    let rows = cases;
    if (statusFilter) rows = rows.filter((c) => c.status === statusFilter);
    rows = [...rows];
    switch (sortMode) {
      case 'newest':
        rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case 'oldest':
        rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case 'status':
        rows.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        rows.sort((a, b) => Number(b.isPriority) - Number(a.isPriority) || (a.submittedAt ?? '').localeCompare(b.submittedAt ?? ''));
    }
    return rows;
  }, [cases, statusFilter, sortMode]);

  return (
    <>
      <div>
        <Bi id="expertCasesEyebrow" as="span" className="eyebrow" />
        <Bi id="expertCasesTitle" as="h1" />
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
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="priority">{biInline('sortPriorityFirst')}</option>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
              <option value="status">{biInline('sortStatusAZ')}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : cases.length === 0 ? (
        <BiValue value={strings.noAssignedCases} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((c) => {
            const status = caseStatusLabel(c.status, c.closureReason);
            const category = caseCategoryLabel(c.category.name);
            return (
              <Link to={`/expert/cases/${c.id}`} key={c.id} className="case-item">
                <div className="top-bar">
                  <div className="label">{c.caseNumber ?? c.id.slice(0, 8)}</div>
                  {c.isPriority && <BiValue value={strings.priorityBadgeLabel} as="span" className="priority-badge" />}
                </div>
                <div className="meta">
                  <BiValue value={category} /> · {c.farmLand.label}
                </div>
                <div className="status-line">
                  <BiValue value={status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

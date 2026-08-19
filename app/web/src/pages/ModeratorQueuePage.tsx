import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listQueueCases, startReviewCase, assignCase, type Case } from '../api/cases';
import { listVerifiedExperts, type VerifiedExpert } from '../api/experts';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel, caseStatusLabel } from '../i18n/strings';

type SortMode = 'priority' | 'newest' | 'oldest' | 'status';

export function ModeratorQueuePage() {
  const { session, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [experts, setExperts] = useState<VerifiedExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [assignSelection, setAssignSelection] = useState<Record<string, string>>({});
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('priority');

  useEffect(() => {
    if (!session) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function load() {
    if (!session) return;
    setLoading(true);
    Promise.all([listQueueCases(session.accessToken), listVerifiedExperts(session.accessToken)])
      .then(([casesResult, expertsResult]) => {
        setCases(casesResult);
        setExperts(expertsResult);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadQueue.en} / ${strings.couldNotLoadQueue.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleStartReview(caseId: string) {
    if (!session) return;
    setBusyId(caseId);
    setError(null);
    try {
      const updated = await startReviewCase(session.accessToken, caseId);
      setCases((prev) => prev.map((c) => (c.id === caseId ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotStartReview.en} / ${strings.couldNotStartReview.te}`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleAssign(caseId: string) {
    if (!session) return;
    const expertId = assignSelection[caseId];
    if (!expertId) return;
    setBusyId(caseId);
    setError(null);
    try {
      const updated = await assignCase(session.accessToken, caseId, expertId);
      setCases((prev) => prev.map((c) => (c.id === caseId ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAssign.en} / ${strings.couldNotAssign.te}`);
    } finally {
      setBusyId(null);
    }
  }

  const categories = useMemo(
    () => Array.from(new Map(cases.map((c) => [c.category.id, c.category.name])).entries()),
    [cases],
  );

  const visible = useMemo(() => {
    let rows = cases;
    if (categoryFilter) rows = rows.filter((c) => c.category.id === categoryFilter);
    if (priorityOnly) rows = rows.filter((c) => c.isPriority);
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
        rows.sort((a, b) => Number(b.isPriority) - Number(a.isPriority) || a.createdAt.localeCompare(b.createdAt));
    }
    return rows;
  }, [cases, categoryFilter, priorityOnly, sortMode]);

  return (
    <>
      <div>
        <Bi id="moderatorQueueEyebrow" as="span" className="eyebrow" />
        <Bi id="moderatorQueueTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && cases.length > 0 && (
        <div className="list-toolbar">
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
          <label className="checkbox-label">
            <input type="checkbox" checked={priorityOnly} onChange={(e) => setPriorityOnly(e.target.checked)} />
            <Bi id="priorityOnlyFilterLabel" />
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
        <BiValue value={strings.noCasesInQueue} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((c) => {
            const status = caseStatusLabel(c.status, c.closureReason);
            const category = caseCategoryLabel(c.category.name);
            const isBusy = busyId === c.id;
            return (
              <div className="case-item" key={c.id}>
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
                <div className="hint">{c.problemDescription}</div>

                {c.status === 'SUBMITTED' && (
                  <button type="button" onClick={() => handleStartReview(c.id)} disabled={isBusy}>
                    {isBusy ? <BiValue value={strings.reviewing} /> : <Bi id="startReviewButton" />}
                  </button>
                )}

                {c.status === 'UNDER_REVIEW' && (
                  experts.length === 0 ? (
                    <BiValue value={strings.noVerifiedExperts} as="p" className="hint" />
                  ) : (
                    <label>
                      <Bi id="assignExpertFieldLabel" />
                      <select
                        value={assignSelection[c.id] ?? ''}
                        onChange={(e) => setAssignSelection((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      >
                        <option value="" disabled>
                          {biInline('selectPlaceholder')}
                        </option>
                        {experts.map((expert) => (
                          <option key={expert.id} value={expert.userId}>
                            {expert.user.name} — {expert.user.mobileNumber}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAssign(c.id)}
                        disabled={isBusy || !assignSelection[c.id]}
                      >
                        {isBusy ? <BiValue value={strings.assigning} /> : <Bi id="assignButton" />}
                      </button>
                    </label>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

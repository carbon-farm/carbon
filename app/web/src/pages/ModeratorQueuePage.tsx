import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listQueueCases, startReviewCase, assignCase, type Case } from '../api/cases';
import { listVerifiedExperts, type VerifiedExpert } from '../api/experts';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel, caseStatusLabel } from '../i18n/strings';

export function ModeratorQueuePage() {
  const { session, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [experts, setExperts] = useState<VerifiedExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [assignSelection, setAssignSelection] = useState<Record<string, string>>({});

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

  return (
    <>
      <div>
        <Bi id="moderatorQueueEyebrow" as="span" className="eyebrow" />
        <Bi id="moderatorQueueTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : cases.length === 0 ? (
        <BiValue value={strings.noCasesInQueue} as="p" className="hint" />
      ) : (
        <div className="card">
          {cases.map((c) => {
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

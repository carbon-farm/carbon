import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listAssignedCases, type Case } from '../api/cases';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseCategoryLabel, caseStatusLabel } from '../i18n/strings';

export function ExpertCasesPage() {
  const { session, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <div>
        <Bi id="expertCasesEyebrow" as="span" className="eyebrow" />
        <Bi id="expertCasesTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : cases.length === 0 ? (
        <BiValue value={strings.noAssignedCases} as="p" className="hint" />
      ) : (
        <div className="card">
          {cases.map((c) => {
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

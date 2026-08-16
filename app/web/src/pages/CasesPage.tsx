import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listMyCases, type Case } from '../api/cases';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseCategoryLabel, caseStatusLabel } from '../i18n/strings';

export function CasesPage() {
  const { session, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : cases.length === 0 ? (
        <BiValue value={strings.noCasesYet} as="p" className="hint" />
      ) : (
        <div className="card">
          {cases.map((c) => {
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listPendingArticles, approveArticle, rejectArticle, type Article } from '../api/knowledge';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function ModeratorArticlesPage() {
  const { session, logout } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!session) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function load() {
    if (!session) return;
    setLoading(true);
    listPendingArticles(session.accessToken)
      .then(setArticles)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadArticleQueue.en} / ${strings.couldNotLoadArticleQueue.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleApprove(id: string) {
    if (!session) return;
    setBusyId(id);
    setError(null);
    try {
      await approveArticle(session.accessToken, id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotApproveArticle.en} / ${strings.couldNotApproveArticle.te}`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    if (!session) return;
    const reason = rejectReason[id]?.trim();
    if (!reason) return;
    setBusyId(id);
    setError(null);
    try {
      await rejectArticle(session.accessToken, id, reason);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotRejectArticle.en} / ${strings.couldNotRejectArticle.te}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <div>
          <Bi id="knowledgeEyebrow" as="span" className="eyebrow" />
          <Bi id="articleQueueTitle" as="h1" />
        </div>
        <button type="button" className="secondary" onClick={logout}>
          <Bi id="logoutButton" />
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : articles.length === 0 ? (
        <BiValue value={strings.noArticlesInQueue} as="p" className="hint" />
      ) : (
        <div className="card">
          {articles.map((a) => {
            const isBusy = busyId === a.id;
            return (
              <div className="farm-item" key={a.id}>
                <div className="label">{a.title}</div>
                <div className="meta">
                  {a.author?.name}
                  {a.crop && ` · ${a.crop.name}`}
                </div>
                {a.symptoms && (
                  <div>
                    <div className="field-label"><Bi id="articleSymptomsField" /></div>
                    <div>{a.symptoms}</div>
                  </div>
                )}
                <div className="field-label"><Bi id="articleSolutionField" /></div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{a.expertSolution}</div>
                <button type="button" onClick={() => handleApprove(a.id)} disabled={isBusy}>
                  {isBusy ? <BiValue value={strings.approving} /> : <Bi id="approveButton" />}
                </button>
                <label>
                  <Bi id="rejectReasonField" />
                  <input
                    value={rejectReason[a.id] ?? ''}
                    onChange={(e) => {
                      setRejectReason((prev) => ({ ...prev, [a.id]: e.target.value }));
                      clearCustomValidity(e);
                    }}
                    onInvalid={bilingualInvalidHandler}
                  />
                </label>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => handleReject(a.id)}
                  disabled={isBusy || !rejectReason[a.id]?.trim()}
                >
                  {isBusy ? <BiValue value={strings.rejecting} /> : <Bi id="rejectButton" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Link to="/moderator/queue" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </div>
  );
}

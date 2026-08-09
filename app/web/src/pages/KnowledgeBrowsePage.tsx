import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listPublishedArticles, type Article } from '../api/knowledge';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';
import { roleHomePath } from '../auth/roleHome';

export function KnowledgeBrowsePage() {
  const { session, logout } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    listPublishedArticles(session.accessToken)
      .then(setArticles)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadPublished.en} / ${strings.couldNotLoadPublished.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  return (
    <div className="screen">
      <div className="top-bar">
        <div>
          <Bi id="knowledgeEyebrow" as="span" className="eyebrow" />
          <Bi id="knowledgeBrowseTitle" as="h1" />
        </div>
        <button type="button" className="secondary" onClick={logout}>
          <Bi id="logoutButton" />
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : articles.length === 0 ? (
        <BiValue value={strings.noPublishedArticles} as="p" className="hint" />
      ) : (
        <div className="card">
          {articles.map((a) => (
            <Link to={`/knowledge/${a.id}`} key={a.id} className="case-item">
              <div className="label">{a.title}</div>
              {a.category && (
                <div className="meta">
                  <BiValue value={caseCategoryLabel(a.category.name)} />
                </div>
              )}
              <div className="meta">
                {strings.byAuthorLabel.en} / {strings.byAuthorLabel.te} {a.author?.name}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link to={session ? roleHomePath(session.role) : '/login'} className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </div>
  );
}

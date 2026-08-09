import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getArticle, type Article } from '../api/knowledge';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';

export function ArticleViewPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !id) return;
    getArticle(session.accessToken, id)
      .then(setArticle)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadArticle.en} / ${strings.couldNotLoadArticle.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, id, logout]);

  return (
    <div className="screen">
      <div>
        <Bi id="knowledgeEyebrow" as="span" className="eyebrow" />
        <h1>{article?.title ?? ''}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !article ? (
        <BiValue value={strings.articleNotFoundError} as="p" className="hint" />
      ) : (
        <div className="card">
          {article.category && (
            <div>
              <div className="field-label"><Bi id="categoryLabel" /></div>
              <div><BiValue value={caseCategoryLabel(article.category.name)} /></div>
            </div>
          )}
          <div className="meta">
            {strings.byAuthorLabel.en} / {strings.byAuthorLabel.te} {article.author?.name}
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{article.content}</div>
        </div>
      )}

      <Link to="/knowledge" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </div>
  );
}

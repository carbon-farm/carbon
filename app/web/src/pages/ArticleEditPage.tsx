import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getArticle, updateArticleDraft, submitArticle, type Article } from '../api/knowledge';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, articleStatusLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

const EDITABLE_STATUSES = ['DRAFT', 'REJECTED'];

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'save' | 'submit' | null>(null);

  useEffect(() => {
    if (!session || !id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  function load() {
    if (!session || !id) return;
    setLoading(true);
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
  }

  async function handleSave(thenSubmit: boolean) {
    const form = formRef.current;
    if (!session || !article || !form || !form.reportValidity()) return;
    setError(null);
    setBusy(thenSubmit ? 'submit' : 'save');
    const data = new FormData(form);
    try {
      const updated = await updateArticleDraft(session.accessToken, article.id, {
        title: String(data.get('title') ?? ''),
        content: String(data.get('content') ?? ''),
      });
      if (thenSubmit) {
        setArticle(await submitArticle(session.accessToken, article.id));
      } else {
        setArticle(updated);
      }
    } catch (err) {
      const fallback = thenSubmit ? strings.couldNotSubmitArticle : strings.couldNotSaveArticle;
      setError(err instanceof ApiError ? err.message : `${fallback.en} / ${fallback.te}`);
    } finally {
      setBusy(null);
    }
  }

  const isEditable = article && EDITABLE_STATUSES.includes(article.status);

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
        <>
          <div className="status-line">
            <BiValue value={articleStatusLabel(article.status)} />
          </div>

          {article.status === 'REJECTED' && article.rejectionReason && (
            <div className="error-banner">
              <div className="field-label"><Bi id="rejectionNoticeLabel" /></div>
              {article.rejectionReason}
            </div>
          )}

          {isEditable ? (
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              <label>
                <Bi id="articleTitleField" />
                <input
                  name="title"
                  defaultValue={article.title}
                  onChange={clearCustomValidity}
                  onInvalid={bilingualInvalidHandler}
                  minLength={5}
                  required
                />
              </label>
              <label>
                <Bi id="articleContentField" />
                <textarea
                  name="content"
                  defaultValue={article.content}
                  onChange={clearCustomValidity}
                  onInvalid={bilingualInvalidHandler}
                  minLength={20}
                  rows={8}
                  required
                />
              </label>
              <button type="button" onClick={() => handleSave(false)} disabled={busy !== null}>
                {busy === 'save' ? <BiValue value={strings.saving} /> : <Bi id="saveDraftButton" />}
              </button>
              <button type="button" className="secondary" onClick={() => handleSave(true)} disabled={busy !== null}>
                {busy === 'submit' ? <BiValue value={strings.submitting} /> : <Bi id="submitArticleButton" />}
              </button>
            </form>
          ) : (
            <div className="card">
              <div style={{ whiteSpace: 'pre-wrap' }}>{article.content}</div>
            </div>
          )}
        </>
      )}

      <Link to="/expert/articles" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </div>
  );
}

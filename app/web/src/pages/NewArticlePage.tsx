import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listCaseCategories, type CaseCategory } from '../api/configuration';
import { createArticleDraft, submitArticle } from '../api/knowledge';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function NewArticlePage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'draft' | 'submit' | null>(null);

  useEffect(() => {
    if (!session) return;
    listCaseCategories(session.accessToken)
      .then(setCategories)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleAction(thenSubmit: boolean) {
    const form = formRef.current;
    if (!session || !form || !form.reportValidity()) return;
    setError(null);
    setBusy(thenSubmit ? 'submit' : 'draft');

    const data = new FormData(form);
    try {
      const created = await createArticleDraft(session.accessToken, {
        title: String(data.get('title') ?? ''),
        content: String(data.get('content') ?? ''),
        categoryId: String(data.get('categoryId') ?? '') || undefined,
      });
      if (thenSubmit) {
        try {
          await submitArticle(session.accessToken, created.id);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitArticle.en} / ${strings.couldNotSubmitArticle.te}`);
          navigate(`/expert/articles/${created.id}`);
          return;
        }
      }
      navigate(`/expert/articles/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotCreateArticle.en} / ${strings.couldNotCreateArticle.te}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="screen">
      <div>
        <Bi id="knowledgeEyebrow" as="span" className="eyebrow" />
        <Bi id="newArticleButton" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <label>
            <Bi id="articleTitleField" />
            <input
              name="title"
              placeholder={biInline('articleTitleField')}
              onChange={clearCustomValidity}
              onInvalid={bilingualInvalidHandler}
              minLength={5}
              required
            />
          </label>
          <label>
            <Bi id="articleCategoryField" />
            <select name="categoryId" defaultValue="">
              <option value="">{biInline('selectPlaceholder')}</option>
              {categories.map((cat) => {
                const label = caseCategoryLabel(cat.name);
                return (
                  <option key={cat.id} value={cat.id}>
                    {label.en} / {label.te}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            <Bi id="articleContentField" />
            <textarea
              name="content"
              placeholder={biInline('articleContentField')}
              onChange={clearCustomValidity}
              onInvalid={bilingualInvalidHandler}
              minLength={20}
              rows={8}
              required
            />
          </label>
          <button type="button" onClick={() => handleAction(false)} disabled={busy !== null}>
            {busy === 'draft' ? <BiValue value={strings.saving} /> : <Bi id="saveDraftButton" />}
          </button>
          <button type="button" className="secondary" onClick={() => handleAction(true)} disabled={busy !== null}>
            {busy === 'submit' ? <BiValue value={strings.submitting} /> : <Bi id="submitArticleButton" />}
          </button>
        </form>
      )}

      <Link to="/expert/articles" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </div>
  );
}

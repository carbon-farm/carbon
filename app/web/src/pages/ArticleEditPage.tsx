import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getArticle, updateArticleDraft, submitArticle, type Article } from '../api/knowledge';
import { listCrops, listTags, type Crop, type Tag } from '../api/configuration';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, articleStatusLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

const EDITABLE_STATUSES = ['DRAFT', 'REJECTED'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext));
}

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
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
    Promise.all([getArticle(session.accessToken, id), listCrops(session.accessToken), listTags(session.accessToken)])
      .then(([articleResult, cropsResult, tagsResult]) => {
        setArticle(articleResult);
        setCrops(cropsResult);
        setTags(tagsResult);
        setSelectedTagIds(articleResult.tags.map((t) => t.id));
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadArticle.en} / ${strings.couldNotLoadArticle.te}`);
      })
      .finally(() => setLoading(false));
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]));
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
        cropId: String(data.get('cropId') ?? '') || undefined,
        symptoms: String(data.get('symptoms') ?? '') || undefined,
        expertSolution: String(data.get('expertSolution') ?? ''),
        tagIds: selectedTagIds,
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

          <div className="card">
            <div className="field-label"><Bi id="problemLabel" /></div>
            <div>{article.problemDescription}</div>
            {article.evidenceMediaUrls.length > 0 && (
              <div className="evidence-media-grid">
                {article.evidenceMediaUrls.map((url) =>
                  isImageUrl(url) ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
                      <img src={url} alt="" className="evidence-thumb" />
                    </a>
                  ) : (
                    <a href={url} target="_blank" rel="noopener noreferrer" key={url} className="link-button">
                      {strings.watchVideoLink.en} / {strings.watchVideoLink.te}
                    </a>
                  ),
                )}
              </div>
            )}
          </div>

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
                <Bi id="articleCropField" />
                <select name="cropId" defaultValue={article.cropId ?? ''}>
                  <option value="">{biInline('selectPlaceholder')}</option>
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <Bi id="articleSymptomsField" />
                <textarea name="symptoms" defaultValue={article.symptoms ?? ''} rows={3} />
              </label>
              <label>
                <Bi id="articleSolutionField" />
                <textarea
                  name="expertSolution"
                  defaultValue={article.expertSolution}
                  onChange={clearCustomValidity}
                  onInvalid={bilingualInvalidHandler}
                  minLength={20}
                  rows={6}
                  required
                />
              </label>
              {tags.length > 0 && (
                <div>
                  <div className="field-label"><Bi id="articleTagsField" /></div>
                  {tags.map((tag) => (
                    <label className="checkbox-label" key={tag.id}>
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => handleSave(false)} disabled={busy !== null}>
                {busy === 'save' ? <BiValue value={strings.saving} /> : <Bi id="saveDraftButton" />}
              </button>
              <button type="button" className="secondary" onClick={() => handleSave(true)} disabled={busy !== null}>
                {busy === 'submit' ? <BiValue value={strings.submitting} /> : <Bi id="submitArticleButton" />}
              </button>
            </form>
          ) : (
            <div className="card">
              {article.symptoms && (
                <div>
                  <div className="field-label"><Bi id="articleSymptomsField" /></div>
                  <div>{article.symptoms}</div>
                </div>
              )}
              <div className="field-label"><Bi id="articleSolutionField" /></div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{article.expertSolution}</div>
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

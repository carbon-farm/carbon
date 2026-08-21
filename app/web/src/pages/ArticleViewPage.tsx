import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  getArticle,
  getFeedbackSummary,
  submitFeedback,
  isBookmarked as fetchIsBookmarked,
  toggleBookmark,
  type Article,
  type FeedbackSummary,
} from '../api/knowledge';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext));
}

export function ArticleViewPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSummary | null>(null);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

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

  useEffect(() => {
    if (!session || !id) return;
    getFeedbackSummary(session.accessToken, id)
      .then((summary) => {
        setFeedback(summary);
        if (summary.myFeedback) {
          setHelpful(summary.myFeedback.helpful);
          setRating(summary.myFeedback.rating);
          setComment(summary.myFeedback.comment ?? '');
        }
      })
      // Feedback is a secondary surface here — a failed fetch shouldn't
      // block reading the article itself, so it fails silently.
      .catch(() => {});
  }, [session, id]);

  useEffect(() => {
    if (!session || !id) return;
    fetchIsBookmarked(session.accessToken, id)
      .then((result) => setBookmarked(result.bookmarked))
      .catch(() => {});
  }, [session, id]);

  async function handleToggleBookmark() {
    if (!session || !id) return;
    setBookmarkBusy(true);
    setError(null);
    try {
      const result = await toggleBookmark(session.accessToken, id);
      setBookmarked(result.bookmarked);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotToggleBookmark.en} / ${strings.couldNotToggleBookmark.te}`);
    } finally {
      setBookmarkBusy(false);
    }
  }

  async function handleSubmitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !id || helpful === null || rating === 0) return;
    setFeedbackBusy(true);
    setFeedbackSaved(false);
    setError(null);
    try {
      await submitFeedback(session.accessToken, id, { helpful, rating, comment: comment.trim() || undefined });
      setFeedback(await getFeedbackSummary(session.accessToken, id));
      setFeedbackSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitFeedback.en} / ${strings.couldNotSubmitFeedback.te}`);
    } finally {
      setFeedbackBusy(false);
    }
  }

  return (
    <>
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
          <div className="top-bar">
            <div className="meta">
              {strings.byAuthorLabel.en} / {strings.byAuthorLabel.te} {article.author?.name}
            </div>
            <button type="button" className={bookmarked ? '' : 'secondary'} onClick={handleToggleBookmark} disabled={bookmarkBusy}>
              {bookmarked ? <Bi id="bookmarkedButton" /> : <Bi id="bookmarkButton" />}
            </button>
          </div>
          {article.crop && (
            <div>
              <div className="field-label"><Bi id="articleCropField" /></div>
              <div>{article.crop.name}</div>
            </div>
          )}
          {article.category && (
            <div>
              <div className="field-label"><Bi id="categoryLabel" /></div>
              <div><BiValue value={caseCategoryLabel(article.category.name)} /></div>
            </div>
          )}
          {article.symptoms && (
            <div>
              <div className="field-label"><Bi id="articleSymptomsField" /></div>
              <div>{article.symptoms}</div>
            </div>
          )}
          <div>
            <div className="field-label"><Bi id="articleSolutionField" /></div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{article.expertSolution}</div>
          </div>
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
          {article.tags.length > 0 && (
            <div className="stat-row">
              {article.tags.map((tag) => (
                <span key={tag.id} className="priority-badge">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {article && (
        <div className="card">
          <Bi id="feedbackHeading" as="h2" />

          {feedback && feedback.totalCount > 0 && (
            <div className="stat-row">
              <div className="stat-tile">
                <div className="value">{feedback.averageRating?.toFixed(1) ?? '—'} / 5</div>
                <BiValue value={strings.averageRatingLabel} as="div" className="label" />
              </div>
              <div className="stat-tile">
                <div className="value">{feedback.totalCount}</div>
                <BiValue value={strings.responsesCountLabel} as="div" className="label" />
              </div>
              <div className="stat-tile">
                <div className="value">{feedback.helpfulCount}</div>
                <BiValue value={strings.markHelpfulButton} as="div" className="label" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback}>
            <div className="stat-row">
              <button
                type="button"
                className={helpful === true ? '' : 'secondary'}
                onClick={() => setHelpful(true)}
              >
                <Bi id="markHelpfulButton" />
              </button>
              <button
                type="button"
                className={helpful === false ? '' : 'secondary'}
                onClick={() => setHelpful(false)}
              >
                <Bi id="markNotHelpfulButton" />
              </button>
            </div>

            <label>
              <Bi id="ratingFieldLabel" />
              <div className="stat-row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={rating >= n ? '' : 'secondary'}
                    onClick={() => setRating(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </label>

            <label>
              <Bi id="feedbackCommentField" />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={1000} />
            </label>

            {feedbackSaved && <BiValue value={strings.feedbackSavedNotice} as="p" className="hint" />}

            <button type="submit" disabled={feedbackBusy || helpful === null || rating === 0}>
              {feedbackBusy ? (
                <BiValue value={strings.submittingFeedback} />
              ) : feedback?.myFeedback ? (
                <Bi id="updateFeedbackButton" />
              ) : (
                <Bi id="submitFeedbackButton" />
              )}
            </button>
          </form>
        </div>
      )}

      <Link to="/knowledge" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

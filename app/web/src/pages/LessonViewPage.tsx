import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listLessons, markLessonComplete, getCourseProgress, type Lesson, type CourseProgress } from '../api/learning';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

export function LessonViewPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const { session, logout } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session || !courseId || !lessonId) return;
    listLessons(session.accessToken, courseId)
      .then((lessons) => setLesson(lessons.find((l) => l.id === lessonId) ?? null))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCourse.en} / ${strings.couldNotLoadCourse.te}`);
      })
      .finally(() => setLoading(false));
    getCourseProgress(session.accessToken, courseId).then(setProgress).catch(() => {});
  }, [courseId, lessonId, session, logout]);

  const isComplete = progress?.completedLessonIds.includes(lessonId ?? '');

  async function handleMarkComplete() {
    if (!session || !lessonId) return;
    setBusy(true);
    setError(null);
    try {
      setProgress(await markLessonComplete(session.accessToken, lessonId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotMarkComplete.en} / ${strings.couldNotMarkComplete.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div>
        <Bi id="coursesEyebrow" as="span" className="eyebrow" />
        <h1>{lesson?.title ?? ''}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !lesson ? (
        <BiValue value={strings.lessonNotFoundError} as="p" className="hint" />
      ) : (
        <div className="card">
          {lesson.contentType === 'ASSIGNMENT' ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{lesson.assignmentText}</div>
          ) : lesson.contentType === 'VIDEO' && lesson.contentUrl ? (
            <video controls src={lesson.contentUrl} style={{ width: '100%', borderRadius: 8 }} />
          ) : lesson.contentType === 'AUDIO' && lesson.contentUrl ? (
            <audio controls src={lesson.contentUrl} style={{ width: '100%' }} />
          ) : lesson.contentUrl ? (
            <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer" className="link-button">
              {strings.openContentLink.en} / {strings.openContentLink.te}
            </a>
          ) : (
            <BiValue value={strings.noContentUploadedYet} as="p" className="hint" />
          )}

          <button type="button" onClick={handleMarkComplete} disabled={busy || isComplete}>
            {busy ? (
              <BiValue value={strings.markingComplete} />
            ) : isComplete ? (
              <BiValue value={strings.lessonCompletedBadge} />
            ) : (
              <Bi id="markCompleteButton" />
            )}
          </button>
        </div>
      )}

      <Link to={`/courses/${courseId}`} className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

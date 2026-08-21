import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getCourse, listLessons, getCourseProgress, type Course, type Lesson, type CourseProgress } from '../api/learning';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, lessonContentTypeLabel } from '../i18n/strings';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !id) return;
    Promise.all([getCourse(session.accessToken, id), listLessons(session.accessToken, id), getCourseProgress(session.accessToken, id)])
      .then(([courseResult, lessonsResult, progressResult]) => {
        setCourse(courseResult);
        setLessons(lessonsResult);
        setProgress(progressResult);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCourse.en} / ${strings.couldNotLoadCourse.te}`);
      })
      .finally(() => setLoading(false));
  }, [id, session, logout]);

  return (
    <>
      <div>
        <Bi id="coursesEyebrow" as="span" className="eyebrow" />
        <h1>{course?.title ?? ''}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !course ? (
        <BiValue value={strings.courseNotFoundError} as="p" className="hint" />
      ) : (
        <>
          <div className="card">
            <div>{course.description}</div>
            {course.crop && (
              <div>
                <div className="field-label"><Bi id="articleCropField" /></div>
                <div>{course.crop.name}</div>
              </div>
            )}
            {course.tags.length > 0 && (
              <div className="stat-row">
                {course.tags.map((tag) => (
                  <span key={tag.id} className="priority-badge">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            {progress && (
              <div className="stat-row">
                <div className="stat-tile">
                  <div className="value">
                    {progress.completedLessonIds.length} / {progress.totalLessons}
                  </div>
                  <BiValue value={strings.courseProgressLabel} as="div" className="label" />
                </div>
              </div>
            )}
            {progress?.certificateIssued && <BiValue value={strings.certificateEarnedNotice} as="p" className="hint" />}
          </div>

          <div className="card">
            <Bi id="lessonsHeading" as="h2" />
            {lessons.length === 0 ? (
              <BiValue value={strings.noLessonsYet} as="p" className="hint" />
            ) : (
              lessons.map((lesson) => {
                const done = progress?.completedLessonIds.includes(lesson.id);
                const typeLabel = lessonContentTypeLabel(lesson.contentType);
                return (
                  <Link to={`/courses/${id}/lessons/${lesson.id}`} key={lesson.id} className="case-item">
                    <div className="top-bar">
                      <div className="label">{lesson.title}</div>
                      {done && <BiValue value={strings.lessonCompletedBadge} as="span" className="priority-badge" />}
                    </div>
                    <div className="meta">
                      {typeLabel.en} / {typeLabel.te}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </>
      )}

      <Link to="/courses" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

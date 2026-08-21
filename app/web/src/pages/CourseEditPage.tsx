import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  getCourse,
  listLessons,
  addLesson,
  uploadLessonContent,
  publishCourse,
  unpublishCourse,
  type Course,
  type Lesson,
  type LessonContentType,
} from '../api/learning';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, courseStatusLabel, lessonContentTypeLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const lessonFormRef = useRef<HTMLFormElement>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<LessonContentType>('VIDEO');
  const [addingLesson, setAddingLesson] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  function load() {
    if (!session || !id) return;
    setLoading(true);
    Promise.all([getCourse(session.accessToken, id), listLessons(session.accessToken, id)])
      .then(([courseResult, lessonsResult]) => {
        setCourse(courseResult);
        setLessons(lessonsResult);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCourse.en} / ${strings.couldNotLoadCourse.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleAddLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !id) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setAddingLesson(true);
    setError(null);
    try {
      const created = await addLesson(session.accessToken, id, {
        title: String(data.get('title') ?? ''),
        contentType,
        assignmentText: contentType === 'ASSIGNMENT' ? String(data.get('assignmentText') ?? '') : undefined,
      });
      setLessons((prev) => [...prev, created]);
      form.reset();
      setContentType('VIDEO');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddLesson.en} / ${strings.couldNotAddLesson.te}`);
    } finally {
      setAddingLesson(false);
    }
  }

  async function handleUploadContent(lessonId: string, file: File) {
    if (!session) return;
    setUploadingId(lessonId);
    setError(null);
    try {
      const updated = await uploadLessonContent(session.accessToken, lessonId, file);
      setLessons((prev) => prev.map((l) => (l.id === lessonId ? updated : l)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUploadContent.en} / ${strings.couldNotUploadContent.te}`);
    } finally {
      setUploadingId(null);
    }
  }

  async function handleTogglePublish() {
    if (!session || !course) return;
    setStatusBusy(true);
    setError(null);
    try {
      const updated = course.status === 'PUBLISHED' ? await unpublishCourse(session.accessToken, course.id) : await publishCourse(session.accessToken, course.id);
      setCourse(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotChangeCourseStatus.en} / ${strings.couldNotChangeCourseStatus.te}`);
    } finally {
      setStatusBusy(false);
    }
  }

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
            <div className="status-line">
              {courseStatusLabel(course.status).en} / {courseStatusLabel(course.status).te}
            </div>
            <div>{course.description}</div>
            <button type="button" onClick={handleTogglePublish} disabled={statusBusy}>
              {statusBusy ? (
                <BiValue value={course.status === 'PUBLISHED' ? strings.unpublishingCourse : strings.publishingCourse} />
              ) : course.status === 'PUBLISHED' ? (
                <Bi id="unpublishButton" />
              ) : (
                <Bi id="publishButton" />
              )}
            </button>
          </div>

          <div className="card">
            <Bi id="lessonsHeading" as="h2" />
            {lessons.length === 0 ? (
              <BiValue value={strings.noLessonsYet} as="p" className="hint" />
            ) : (
              lessons.map((lesson) => {
                const typeLabel = lessonContentTypeLabel(lesson.contentType);
                return (
                  <div className="farm-item" key={lesson.id}>
                    <div className="label">{lesson.title}</div>
                    <div className="meta">
                      {typeLabel.en} / {typeLabel.te}
                    </div>
                    {lesson.contentType === 'ASSIGNMENT' ? (
                      <div className="hint">{lesson.assignmentText}</div>
                    ) : (
                      <label>
                        <Bi id="uploadContentButton" />
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp4,audio/wav,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadContent(lesson.id, file);
                          }}
                          disabled={uploadingId === lesson.id}
                        />
                        {uploadingId === lesson.id && <BiValue value={strings.uploadingContent} as="p" className="hint" />}
                        {lesson.contentUrl && (
                          <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                            {strings.openContentLink.en} / {strings.openContentLink.te}
                          </a>
                        )}
                      </label>
                    )}
                  </div>
                );
              })
            )}

            <form ref={lessonFormRef} onSubmit={handleAddLesson}>
              <label>
                <Bi id="lessonTitleField" />
                <input name="title" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={3} required />
              </label>
              <label>
                <Bi id="lessonContentTypeField" />
                <select value={contentType} onChange={(e) => setContentType(e.target.value as LessonContentType)}>
                  <option value="VIDEO">{biInline('contentTypeVideo')}</option>
                  <option value="AUDIO">{biInline('contentTypeAudio')}</option>
                  <option value="PDF">{biInline('contentTypePdf')}</option>
                  <option value="ASSIGNMENT">{biInline('contentTypeAssignment')}</option>
                </select>
              </label>
              {contentType === 'ASSIGNMENT' && (
                <label>
                  <Bi id="assignmentInstructionsField" />
                  <textarea name="assignmentText" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={5} rows={3} required />
                </label>
              )}
              <button type="submit" disabled={addingLesson}>
                {addingLesson ? <BiValue value={strings.addingLesson} /> : <Bi id="addLessonButton" />}
              </button>
            </form>
          </div>
        </>
      )}

      <Link to="/courses/manage" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

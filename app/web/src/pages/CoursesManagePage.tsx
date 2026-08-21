import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listAllCoursesForStaff, createCourse, publishCourse, unpublishCourse, type Course } from '../api/learning';
import { listCrops, type Crop } from '../api/configuration';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, courseStatusLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

type SortMode = 'newest' | 'oldest' | 'title';

export function CoursesManagePage() {
  const { session, logout } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    load();
    listCrops(session.accessToken).then(setCrops).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function load() {
    if (!session) return;
    setLoading(true);
    listAllCoursesForStaff(session.accessToken)
      .then(setCourses)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCourses.en} / ${strings.couldNotLoadCourses.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleCreate() {
    const form = formRef.current;
    if (!session || !form || !form.reportValidity()) return;
    setCreating(true);
    setError(null);
    const data = new FormData(form);
    try {
      const created = await createCourse(session.accessToken, {
        title: String(data.get('title') ?? ''),
        description: String(data.get('description') ?? ''),
        cropId: String(data.get('cropId') ?? '') || undefined,
      });
      setCourses((prev) => [created, ...prev]);
      form.reset();
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotCreateCourse.en} / ${strings.couldNotCreateCourse.te}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleTogglePublish(course: Course) {
    if (!session) return;
    setBusyId(course.id);
    setError(null);
    try {
      const updated = course.status === 'PUBLISHED' ? await unpublishCourse(session.accessToken, course.id) : await publishCourse(session.accessToken, course.id);
      setCourses((prev) => prev.map((c) => (c.id === course.id ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotChangeCourseStatus.en} / ${strings.couldNotChangeCourseStatus.te}`);
    } finally {
      setBusyId(null);
    }
  }

  const visible = useMemo(() => {
    let rows = courses;
    if (statusFilter) rows = rows.filter((c) => c.status === statusFilter);
    rows = [...rows];
    switch (sortMode) {
      case 'oldest':
        rows.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
        break;
      case 'title':
        rows.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return rows;
  }, [courses, statusFilter, sortMode]);

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="coursesEyebrow" as="span" className="eyebrow" />
          <Bi id="coursesManageTitle" as="h1" />
        </div>
        <button type="button" className="secondary" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? <Bi id="cancelButton" /> : <Bi id="createCourseButton" />}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showAddForm && (
        <div className="card">
          <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <label>
              <Bi id="courseTitleField" />
              <input name="title" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={3} required />
            </label>
            <label>
              <Bi id="courseDescriptionField" />
              <textarea name="description" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={10} rows={3} required />
            </label>
            <label>
              <Bi id="articleCropField" />
              <select name="cropId" defaultValue="">
                <option value="">{biInline('selectPlaceholder')}</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={handleCreate} disabled={creating}>
              {creating ? <BiValue value={strings.creatingCourse} /> : <Bi id="createCourseButton" />}
            </button>
          </form>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="statusFilterLabel" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              <option value="DRAFT">{biInline('courseStatusDraft')}</option>
              <option value="PUBLISHED">{biInline('courseStatusPublished')}</option>
            </select>
          </label>
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
              <option value="title">{biInline('sortTitleAZ')}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : courses.length === 0 ? (
        <BiValue value={strings.noCoursesYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((c) => {
            const status = courseStatusLabel(c.status);
            const isBusy = busyId === c.id;
            return (
              <div className="farm-item" key={c.id}>
                <div className="top-bar">
                  <Link to={`/courses/manage/${c.id}`} className="label">
                    {c.title}
                  </Link>
                  <span className="status-line">
                    {status.en} / {status.te}
                  </span>
                </div>
                <div className="meta">
                  {c.crop?.name}
                  {c._count ? ` · ${c._count.lessons} ${strings.lessonsHeading.en}` : ''}
                </div>
                <button type="button" className="secondary" onClick={() => handleTogglePublish(c)} disabled={isBusy}>
                  {isBusy ? (
                    <BiValue value={c.status === 'PUBLISHED' ? strings.unpublishingCourse : strings.publishingCourse} />
                  ) : c.status === 'PUBLISHED' ? (
                    <Bi id="unpublishButton" />
                  ) : (
                    <Bi id="publishButton" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

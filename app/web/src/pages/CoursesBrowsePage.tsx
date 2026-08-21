import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listPublishedCourses, listMyCertificates, type Course, type CertificateEntry } from '../api/learning';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

type SortMode = 'newest' | 'oldest' | 'title';

export function CoursesBrowsePage() {
  const { session, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cropFilter, setCropFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    listPublishedCourses(session.accessToken)
      .then(setCourses)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCourses.en} / ${strings.couldNotLoadCourses.te}`);
      })
      .finally(() => setLoading(false));
    listMyCertificates(session.accessToken).then(setCertificates).catch(() => {});
  }, [session, logout]);

  const crops = useMemo(
    () => Array.from(new Map(courses.filter((c) => c.crop).map((c) => [c.crop!.id, c.crop!.name])).entries()),
    [courses],
  );

  const visible = useMemo(() => {
    let rows = courses;
    if (cropFilter) rows = rows.filter((c) => c.cropId === cropFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.title.toLowerCase().includes(q));
    }
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
  }, [courses, cropFilter, search, sortMode]);

  return (
    <>
      <div>
        <Bi id="coursesEyebrow" as="span" className="eyebrow" />
        <Bi id="coursesBrowseTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {certificates.length > 0 && (
        <div className="card">
          <Bi id="myCertificatesHeading" as="h2" />
          {certificates.map((c) => (
            <div className="farm-item" key={c.id}>
              <div className="label">{c.course.title}</div>
              <div className="meta">{new Date(c.issuedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          {crops.length > 0 && (
            <label>
              <Bi id="articleCropField" />
              <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
                <option value="">{biInline('allOption')}</option>
                {crops.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
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
          {visible.map((c) => (
            <Link to={`/courses/${c.id}`} key={c.id} className="case-item">
              <div className="label">{c.title}</div>
              <div className="meta">
                {c.crop?.name}
                {c.crop && c._count ? ' · ' : ''}
                {c._count ? `${c._count.lessons} ${strings.lessonsHeading.en}` : ''}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

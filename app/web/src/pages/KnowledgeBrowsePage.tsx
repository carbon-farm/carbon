import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listPublishedArticles, type Article } from '../api/knowledge';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';
import { roleHomePath } from '../auth/roleHome';

type SortMode = 'newest' | 'oldest' | 'title';

export function KnowledgeBrowsePage() {
  const { session, logout } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cropFilter, setCropFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    listPublishedArticles(session.accessToken)
      .then(setArticles)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadPublished.en} / ${strings.couldNotLoadPublished.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const crops = useMemo(
    () => Array.from(new Map(articles.filter((a) => a.crop).map((a) => [a.crop!.id, a.crop!.name])).entries()),
    [articles],
  );
  const categories = useMemo(
    () => Array.from(new Map(articles.filter((a) => a.category).map((a) => [a.category!.id, a.category!.name])).entries()),
    [articles],
  );

  const visible = useMemo(() => {
    let rows = articles;
    if (cropFilter) rows = rows.filter((a) => a.cropId === cropFilter);
    if (categoryFilter) rows = rows.filter((a) => a.categoryId === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((a) => a.title.toLowerCase().includes(q));
    }
    rows = [...rows];
    switch (sortMode) {
      case 'oldest':
        rows.sort((a, b) => (a.publishedAt ?? a.createdAt).localeCompare(b.publishedAt ?? b.createdAt));
        break;
      case 'title':
        rows.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        rows.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
    }
    return rows;
  }, [articles, cropFilter, categoryFilter, search, sortMode]);

  return (
    <>
      <div>
        <Bi id="knowledgeEyebrow" as="span" className="eyebrow" />
        <Bi id="knowledgeBrowseTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && articles.length > 0 && (
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
          {categories.length > 0 && (
            <label>
              <Bi id="categoryLabel" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">{biInline('allOption')}</option>
                {categories.map(([id, name]) => {
                  const label = caseCategoryLabel(name);
                  return (
                    <option key={id} value={id}>
                      {label.en} / {label.te}
                    </option>
                  );
                })}
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
      ) : articles.length === 0 ? (
        <BiValue value={strings.noPublishedArticles} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((a) => (
            <Link to={`/knowledge/${a.id}`} key={a.id} className="case-item">
              <div className="label">{a.title}</div>
              {(a.crop || a.category) && (
                <div className="meta">
                  {a.crop && a.category ? (
                    <>
                      {a.crop.name} · <BiValue value={caseCategoryLabel(a.category.name)} />
                    </>
                  ) : a.crop ? (
                    a.crop.name
                  ) : (
                    a.category && <BiValue value={caseCategoryLabel(a.category.name)} />
                  )}
                </div>
              )}
              <div className="meta">
                {strings.byAuthorLabel.en} / {strings.byAuthorLabel.te} {a.author?.name}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link to={session ? roleHomePath(session.role) : '/login'} className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listMedia, type MediaItem } from '../api/media';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, mediaKindLabel, mediaSourceLabel } from '../i18n/strings';

type SortKey = 'createdAt' | 'kind' | 'source' | 'ownerLabel';

// Read-only aggregation of every upload across modules (see MediaService).
// Sortable column headers + filters per the standing list-UX rule.
export function MediaLibraryPage() {
  const { session, logout } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    if (!session) return;
    listMedia(session.accessToken)
      .then(setItems)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadMedia.en} / ${strings.couldNotLoadMedia.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const kinds = useMemo(() => Array.from(new Set(items.map((i) => i.kind))), [items]);
  const sources = useMemo(() => Array.from(new Set(items.map((i) => i.source))), [items]);

  const visible = useMemo(() => {
    let rows = items;
    if (kindFilter) rows = rows.filter((i) => i.kind === kindFilter);
    if (sourceFilter) rows = rows.filter((i) => i.source === sourceFilter);
    const dir = sortDesc ? -1 : 1;
    return [...rows].sort((a, b) => a[sortKey].localeCompare(b[sortKey]) * dir);
  }, [items, kindFilter, sourceFilter, sortKey, sortDesc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(key === 'createdAt');
    }
  }

  const arrow = (key: SortKey) => (key === sortKey ? (sortDesc ? ' ↓' : ' ↑') : '');

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="mediaLibraryTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && items.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="mediaKindColumn" />
            <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {mediaKindLabel(k).en} / {mediaKindLabel(k).te}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Bi id="mediaSourceColumn" />
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {mediaSourceLabel(s).en} / {mediaSourceLabel(s).te}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : items.length === 0 ? (
        <BiValue value={strings.noMediaYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>
                  <Bi id="mediaPreviewColumn" />
                </th>
                <th>
                  <button type="button" className="link-button" onClick={() => toggleSort('kind')}>
                    {biInline('mediaKindColumn')}
                    {arrow('kind')}
                  </button>
                </th>
                <th>
                  <button type="button" className="link-button" onClick={() => toggleSort('source')}>
                    {biInline('mediaSourceColumn')}
                    {arrow('source')}
                  </button>
                </th>
                <th>
                  <button type="button" className="link-button" onClick={() => toggleSort('ownerLabel')}>
                    {biInline('mediaOwnerColumn')}
                    {arrow('ownerLabel')}
                  </button>
                </th>
                <th>
                  <button type="button" className="link-button" onClick={() => toggleSort('createdAt')}>
                    {biInline('mediaDateColumn')}
                    {arrow('createdAt')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={`${m.source}-${m.ownerId}-${m.url}`}>
                  <td>
                    <a href={m.url} target="_blank" rel="noreferrer">
                      {m.kind === 'IMAGE' ? (
                        <img src={m.url} alt="" style={{ width: 56, height: 56, objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        biInline('mediaOpenLink')
                      )}
                    </a>
                  </td>
                  <td>
                    {mediaKindLabel(m.kind).en} / {mediaKindLabel(m.kind).te}
                  </td>
                  <td>
                    {mediaSourceLabel(m.source).en} / {mediaSourceLabel(m.source).te}
                  </td>
                  <td>{m.ownerLabel}</td>
                  <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

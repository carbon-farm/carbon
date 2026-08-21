import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listQueueSamples, type SoilSample } from '../api/soilLab';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, sampleStatusLabel } from '../i18n/strings';

type SortMode = 'oldest' | 'newest';

export function SoilLabQueuePage() {
  const { session, logout } = useAuth();
  const [samples, setSamples] = useState<SoilSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('oldest');

  useEffect(() => {
    if (!session) return;
    listQueueSamples(session.accessToken)
      .then(setSamples)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadSamples.en} / ${strings.couldNotLoadSamples.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const statuses = useMemo(() => Array.from(new Set(samples.map((s) => s.status))), [samples]);

  const visible = useMemo(() => {
    let rows = samples;
    if (statusFilter) rows = rows.filter((s) => s.status === statusFilter);
    rows = [...rows];
    rows.sort((a, b) => (sortMode === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));
    return rows;
  }, [samples, statusFilter, sortMode]);

  return (
    <>
      <div>
        <Bi id="soilSamplesEyebrow" as="span" className="eyebrow" />
        <Bi id="sampleQueueTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && samples.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="statusFilterLabel" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {statuses.map((s) => {
                const label = sampleStatusLabel(s);
                return (
                  <option key={s} value={s}>
                    {label.en} / {label.te}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
              <option value="newest">{biInline('sortNewestFirst')}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : samples.length === 0 ? (
        <BiValue value={strings.noSamplesYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((s) => {
            const status = sampleStatusLabel(s.status);
            return (
              <Link to={`/soil-samples/${s.id}`} key={s.id} className="case-item">
                <div className="label">{s.sampleCode}</div>
                <div className="meta">
                  {s.farmLand.label} · {s.farmer?.name}
                </div>
                <div className="status-line">
                  {status.en} / {status.te}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listAuditLog, listAuditEntityTypes, type AuditLogEntry } from '../api/admin';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

type SortKey = 'createdAt' | 'action' | 'entityType' | 'actor';
type SortDir = 'asc' | 'desc';

export function AdminAuditPage() {
  const { session, logout } = useAuth();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [entityType, setEntityType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    listAuditEntityTypes(session.accessToken).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([
      listAuditLog(session.accessToken, { entityType: entityType || undefined, from: from || undefined, to: to || undefined }),
      listAuditEntityTypes(session.accessToken),
    ])
      .then(([entriesResult, typesResult]) => {
        setEntries(entriesResult);
        setEntityTypes(typesResult);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadAuditLog.en} / ${strings.couldNotLoadAuditLog.te}`);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, entityType, from, to]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...entries].sort((a, b) => {
    let cmp: number;
    if (sortKey === 'createdAt') cmp = a.createdAt.localeCompare(b.createdAt);
    else if (sortKey === 'action') cmp = a.action.localeCompare(b.action);
    else if (sortKey === 'entityType') cmp = a.entityType.localeCompare(b.entityType);
    else cmp = (a.actor?.name ?? '').localeCompare(b.actor?.name ?? '');
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function sortIndicator(key: SortKey) {
    if (key !== sortKey) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="auditLogPageTitle" as="h1" />
      </div>

      <div className="stat-row">
        <label>
          <Bi id="entityTypeFilterLabel" />
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
            <option value="">{strings.allEntityTypesOption.en} / {strings.allEntityTypesOption.te}</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          <Bi id="fromDateFilterLabel" />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          <Bi id="toDateFilterLabel" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : sorted.length === 0 ? (
        <BiValue value={strings.noAuditEntries} as="p" className="hint" />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  {strings.dateColumnLabel.en} / {strings.dateColumnLabel.te}{sortIndicator('createdAt')}
                </th>
                <th onClick={() => handleSort('action')} className="sortable">
                  {strings.actionColumnLabel.en} / {strings.actionColumnLabel.te}{sortIndicator('action')}
                </th>
                <th onClick={() => handleSort('entityType')} className="sortable">
                  {strings.entityColumnLabel.en} / {strings.entityColumnLabel.te}{sortIndicator('entityType')}
                </th>
                <th onClick={() => handleSort('actor')} className="sortable">
                  {strings.actorColumnLabel.en} / {strings.actorColumnLabel.te}{sortIndicator('actor')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>{entry.action}</td>
                  <td>{entry.entityType}</td>
                  <td>{entry.actor ? `${entry.actor.name} (${entry.actor.role})` : '—'}</td>
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

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listNotifications, markNotificationRead, markAllNotificationsRead, type NotificationItem } from '../api/notifications';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

type SortMode = 'newest' | 'oldest';

export function NotificationsPage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!session) return;
    listNotifications(session.accessToken)
      .then(setItems)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadNotifications.en} / ${strings.couldNotLoadNotifications.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const visible = useMemo(() => {
    let rows = unreadOnly ? items.filter((n) => !n.isRead) : items;
    rows = [...rows];
    rows.sort((a, b) => (sortMode === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
    return rows;
  }, [items, unreadOnly, sortMode]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  async function handleOpen(item: NotificationItem) {
    if (!session) return;
    if (!item.isRead) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      // Awaited so the freshly-mounted AppShell on the destination route
      // polls an unread count that already reflects this read — otherwise
      // navigate() below wins the race and the bell briefly shows stale.
      await markNotificationRead(session.accessToken, item.id).catch(() => {});
    }
    if (item.linkPath) navigate(item.linkPath);
  }

  async function handleMarkAllRead() {
    if (!session) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(session.accessToken);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="notificationsEyebrow" as="span" className="eyebrow" />
          <Bi id="notificationsPageTitle" as="h1" />
        </div>
        {unreadCount > 0 && (
          <button type="button" className="secondary" onClick={handleMarkAllRead} disabled={markingAll}>
            {markingAll ? <BiValue value={strings.markingRead} /> : <Bi id="markAllReadButton" />}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && items.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="showFilterLabel" />
            <select value={unreadOnly ? 'unread' : 'all'} onChange={(e) => setUnreadOnly(e.target.value === 'unread')}>
              <option value="all">{biInline('allOption')}</option>
              <option value="unread">{biInline('unreadOnlyOption')}</option>
            </select>
          </label>
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : items.length === 0 ? (
        <BiValue value={strings.noNotifications} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`case-item notification-item${item.isRead ? '' : ' unread'}`}
              onClick={() => handleOpen(item)}
            >
              <div className="top-bar">
                <div className="label">{item.title}</div>
                {!item.isRead && <span className="priority-badge">•</span>}
              </div>
              <div className="meta">{item.body}</div>
              <div className="hint">{new Date(item.createdAt).toLocaleString()}</div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

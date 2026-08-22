import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listMyOrders, type Order } from '../api/marketplace';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, orderStatusLabel } from '../i18n/strings';

type SortMode = 'newest' | 'oldest';

export function OrdersPage() {
  const { session, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    listMyOrders(session.accessToken)
      .then(setOrders)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadOrders.en} / ${strings.couldNotLoadOrders.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const statuses = useMemo(() => Array.from(new Set(orders.map((o) => o.status))), [orders]);

  const visible = useMemo(() => {
    let rows = orders;
    if (statusFilter) rows = rows.filter((o) => o.status === statusFilter);
    rows = [...rows];
    rows.sort((a, b) => (sortMode === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));
    return rows;
  }, [orders, statusFilter, sortMode]);

  return (
    <>
      <div>
        <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
        <Bi id="myOrdersTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && orders.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="statusFilterLabel" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {statuses.map((s) => {
                const label = orderStatusLabel(s);
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
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : orders.length === 0 ? (
        <BiValue value={strings.noOrdersYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((o) => {
            const status = orderStatusLabel(o.status);
            return (
              <Link to={`/marketplace/orders/${o.id}`} key={o.id} className="case-item">
                <div className="label">{o.orderNumber}</div>
                <div className="meta">₹{o.totalAmount.toFixed(2)} · {o.items.length} items</div>
                <div className="status-line">
                  {status.en} / {status.te}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link to="/marketplace" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { listOrdersQueue, type Order } from '../../api/marketplace';
import { Bi, BiValue, biInline } from '../../i18n/Bi';
import { strings, orderStatusLabel, orderPaymentStatusLabel } from '../../i18n/strings';

type SortMode = 'oldest' | 'newest';

// SUPPORT_AGENT's own view of the same order queue Administrators see —
// reuses listOrdersQueue/OrderDetailPage entirely; the only thing new here
// is surfacing each order's pending-item count so the dispatch team can see
// at a glance which orders still have something left to send, without
// opening every one. The actual Pending/Sent toggle lives on
// OrderDetailPage's existing per-item loop, not duplicated here.
export function DispatchQueuePage() {
  const { session, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [readyOnly, setReadyOnly] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('oldest');

  useEffect(() => {
    if (!session) return;
    listOrdersQueue(session.accessToken)
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

  // Ready to pack = not cancelled, and either Cash on Delivery or a UPI payment that has been verified.
  const isReady = (o: Order) => o.status !== 'CANCELLED' && (o.paymentMethod === 'COD' || o.paymentStatus === 'PAID');

  const visible = useMemo(() => {
    let rows = readyOnly ? orders.filter(isReady) : orders;
    if (pendingOnly) rows = rows.filter((o) => o.items.some((i) => i.dispatchStatus === 'PENDING'));
    rows = [...rows];
    rows.sort((a, b) => (sortMode === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, pendingOnly, readyOnly, sortMode]);

  return (
    <>
      <div>
        <Bi id="dispatchQueueNavTitle" as="span" className="eyebrow" />
        <Bi id="dispatchQueueTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && orders.length > 0 && (
        <div className="list-toolbar">
          <label className="checkbox-label">
            <input type="checkbox" checked={readyOnly} onChange={(e) => setReadyOnly(e.target.checked)} />
            <Bi id="dispatchReadyOnly" />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} />
            <Bi id="dispatchStatusPending" />
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
      ) : orders.length === 0 ? (
        <BiValue value={strings.noOrdersYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((o) => {
            const status = orderStatusLabel(o.status);
            const pendingCount = o.items.filter((i) => i.dispatchStatus === 'PENDING').length;
            return (
              <Link to={`/marketplace/orders/${o.id}`} key={o.id} className="case-item">
                <div className="label">{o.orderNumber}</div>
                <div className="meta">
                  {o.farmer?.name} · ₹{o.totalAmount.toFixed(2)} · {o.items.length} items
                </div>
                <div className="meta">
                  {o.shippingAddress ? `${o.shippingAddress.city} ${o.shippingAddress.pincode} · ${o.shippingAddress.phone}` : o.deliveryAddress}
                </div>
                <div className="meta">
                  {o.paymentMethod === 'UPI' ? strings.paymentUpiShort.en : strings.paymentCod.en} · {orderPaymentStatusLabel(o.paymentStatus).en}
                </div>
                <div className="status-line">
                  {status.en} / {status.te}
                  {pendingCount > 0 && ` · ${pendingCount} pending`}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

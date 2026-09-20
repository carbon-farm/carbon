import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listOrdersQueue, type Order } from '../api/marketplace';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, orderStatusLabel, orderPaymentStatusLabel } from '../i18n/strings';

type SortKey = 'orderNumber' | 'customer' | 'total' | 'payment' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

// The order queue: every order in one sortable, filterable table. UPI orders wait here for an
// Administrator to verify the payment before they can be confirmed and packed.
export function OrdersManagePage() {
  const { session, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

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

  const statuses = useMemo(() => Array.from(new Set(orders.map((o) => o.status))), [orders]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'createdAt' || key === 'total' ? 'desc' : 'asc');
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = orders.filter(
      (o) =>
        (!statusFilter || o.status === statusFilter) &&
        (!methodFilter || o.paymentMethod === methodFilter) &&
        (!paymentFilter || o.paymentStatus === paymentFilter) &&
        (!q || [o.orderNumber, o.farmer?.name, o.farmer?.mobileNumber, o.paymentUtr].some((v) => v?.toLowerCase().includes(q))),
    );
    const cmp = (a: Order, b: Order) => {
      switch (sortKey) {
        case 'orderNumber':
          return a.orderNumber.localeCompare(b.orderNumber);
        case 'customer':
          return (a.farmer?.name ?? '').localeCompare(b.farmer?.name ?? '');
        case 'total':
          return a.totalAmount - b.totalAmount;
        case 'payment':
          return `${a.paymentMethod}${a.paymentStatus}`.localeCompare(`${b.paymentMethod}${b.paymentStatus}`);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return a.createdAt.localeCompare(b.createdAt);
      }
    };
    return rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
  }, [orders, statusFilter, methodFilter, paymentFilter, search, sortKey, sortDir]);

  const needVerifying = orders.filter((o) => o.paymentMethod === 'UPI' && o.paymentStatus === 'CLAIMED' && o.status !== 'CANCELLED').length;

  const th = (key: SortKey, label: { en: string; te: string }) => (
    <th className="sortable" onClick={() => handleSort(key)}>
      {label.en} / {label.te}
      {key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="ordersQueueTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {needVerifying > 0 && (
        <button type="button" className="secondary" onClick={() => { setPaymentFilter('CLAIMED'); setMethodFilter('UPI'); }}>
          {strings.ordersNeedVerifying.en.replace('{n}', String(needVerifying))} / {strings.ordersNeedVerifying.te.replace('{n}', String(needVerifying))}
        </button>
      )}

      {!loading && orders.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
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
            <Bi id="paymentMethodLabel" />
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              <option value="COD">{strings.paymentCod.en} / {strings.paymentCod.te}</option>
              <option value="UPI">{strings.paymentUpiShort.en} / {strings.paymentUpiShort.te}</option>
            </select>
          </label>
          <label>
            <Bi id="orderPaymentStatusFilterLabel" />
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {(['PENDING', 'CLAIMED', 'PAID', 'REJECTED'] as const).map((p) => (
                <option key={p} value={p}>
                  {orderPaymentStatusLabel(p).en} / {orderPaymentStatusLabel(p).te}
                </option>
              ))}
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
        <div className="card table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {th('orderNumber', strings.orderNumberColumn)}
                {th('customer', strings.customerColumnLabel)}
                {th('total', strings.cartTotalLabel)}
                {th('payment', strings.paymentMethodLabel)}
                {th('status', strings.statusFilterLabel)}
                {th('createdAt', strings.dateColumnLabel)}
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const status = orderStatusLabel(o.status);
                const pay = orderPaymentStatusLabel(o.paymentStatus);
                return (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/marketplace/orders/${o.id}`} className="link-button">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>
                      {o.farmer?.name}
                      <div className="meta">{o.farmer?.mobileNumber}</div>
                    </td>
                    <td>₹{o.totalAmount.toFixed(2)}</td>
                    <td>
                      {o.paymentMethod === 'UPI' ? strings.paymentUpiShort.en : strings.paymentCod.en}
                      <div className="meta">
                        {pay.en} / {pay.te}
                      </div>
                    </td>
                    <td>
                      {status.en} / {status.te}
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
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

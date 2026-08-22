import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getOrder, confirmOrder, shipOrder, deliverOrder, cancelOrder, type Order } from '../api/marketplace';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, orderStatusLabel } from '../i18n/strings';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isStaff = session?.role === 'ADMINISTRATOR';
  const backTo = isStaff ? '/marketplace/manage/orders' : '/marketplace/orders';

  useEffect(() => {
    if (!session || !id) return;
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  function loadOrder() {
    if (!session || !id) return;
    setLoading(true);
    getOrder(session.accessToken, id)
      .then(setOrder)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadOrder.en} / ${strings.couldNotLoadOrder.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleAction(action: (token: string, id: string) => Promise<Order>) {
    if (!session || !order) return;
    setBusy(true);
    setError(null);
    try {
      setOrder(await action(session.accessToken, order.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUpdateOrder.en} / ${strings.couldNotUpdateOrder.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div>
        <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
        <h1>{order?.orderNumber ?? ''}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !order ? (
        <BiValue value={strings.orderNotFoundError} as="p" className="hint" />
      ) : (
        <div className="card">
          <div className="status-line">
            {orderStatusLabel(order.status).en} / {orderStatusLabel(order.status).te}
          </div>
          {isStaff && order.farmer && (
            <div>
              <div className="field-label"><Bi id="actorColumnLabel" /></div>
              <div>{order.farmer.name} · {order.farmer.mobileNumber}</div>
            </div>
          )}
          <div>
            <div className="field-label"><Bi id="deliveryAddressField" /></div>
            <div>{order.deliveryAddress}</div>
          </div>
          <div>
            <div className="field-label"><Bi id="paymentMethodLabel" /></div>
            <div>{order.paymentMethod}</div>
          </div>

          {order.items.map((item) => (
            <div className="farm-item" key={item.id}>
              <div className="label">{item.productName}</div>
              <div className="meta">
                {item.quantity} × ₹{item.unitPrice.toFixed(2)} = ₹{item.lineTotal.toFixed(2)}
              </div>
            </div>
          ))}
          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">₹{order.totalAmount.toFixed(2)}</div>
              <BiValue value={strings.cartTotalLabel} as="div" className="label" />
            </div>
          </div>

          {isStaff && order.status === 'PLACED' && (
            <button type="button" onClick={() => handleAction(confirmOrder)} disabled={busy}>
              {busy ? <BiValue value={strings.updatingOrder} /> : <Bi id="confirmOrderButton" />}
            </button>
          )}
          {isStaff && order.status === 'CONFIRMED' && (
            <button type="button" onClick={() => handleAction(shipOrder)} disabled={busy}>
              {busy ? <BiValue value={strings.updatingOrder} /> : <Bi id="shipOrderButton" />}
            </button>
          )}
          {isStaff && order.status === 'SHIPPED' && (
            <button type="button" onClick={() => handleAction(deliverOrder)} disabled={busy}>
              {busy ? <BiValue value={strings.updatingOrder} /> : <Bi id="deliverOrderButton" />}
            </button>
          )}
          {isStaff && (order.status === 'PLACED' || order.status === 'CONFIRMED') && (
            <button type="button" className="secondary" onClick={() => handleAction(cancelOrder)} disabled={busy}>
              {busy ? <BiValue value={strings.updatingOrder} /> : <Bi id="cancelOrderButton" />}
            </button>
          )}
        </div>
      )}

      <Link to={backTo} className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

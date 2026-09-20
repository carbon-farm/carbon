import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  getOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  cancelOrder,
  setItemDispatchStatus,
  startOrderPayment,
  claimOrderPayment,
  reviewOrderPayment,
  type Order,
  type OrderPaymentLink,
} from '../api/marketplace';
import { AddressBlock } from '../components/AddressBlock';
import { UpiPaymentCard } from './hariharaa/UpiPaymentCard';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, orderStatusLabel, dispatchStatusLabel, orderPaymentStatusLabel } from '../i18n/strings';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [payLink, setPayLink] = useState<OrderPaymentLink | null>(null);
  const [paying, setPaying] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isStaff = session?.role === 'ADMINISTRATOR';
  const isOwner = session?.role === 'MEMBER';
  // Separate from isStaff deliberately: SUPPORT_AGENT gets the per-item
  // dispatch controls below but not the whole-order confirm/ship/deliver/
  // cancel buttons, which stay Administrator-only.
  const canDispatch = session?.role === 'ADMINISTRATOR' || session?.role === 'SUPPORT_AGENT';
  const backTo =
    session?.role === 'SUPPORT_AGENT'
      ? '/support/dispatch-queue'
      : isStaff
        ? '/marketplace/manage/orders'
        : '/marketplace/orders';

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

  // The customer's side of a UPI order: get the QR, pay, then type the UTR.
  async function handleStartPayment() {
    if (!session || !order) return;
    setPaying(true);
    setError(null);
    try {
      setPayLink(await startOrderPayment(session.accessToken, order.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotStartPayment.en} / ${strings.couldNotStartPayment.te}`);
    } finally {
      setPaying(false);
    }
  }

  async function handleClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !order) return;
    const utr = String(new FormData(event.currentTarget).get('utr') ?? '').trim();
    setPaying(true);
    setError(null);
    try {
      setOrder(await claimOrderPayment(session.accessToken, order.id, { utr }));
      setPayLink(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitHariharaaClaim.en} / ${strings.couldNotSubmitHariharaaClaim.te}`);
    } finally {
      setPaying(false);
    }
  }

  async function handleReview(approve: boolean) {
    if (!session || !order) return;
    if (!approve && !rejectReason.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setOrder(await reviewOrderPayment(session.accessToken, order.id, approve, approve ? undefined : rejectReason.trim()));
      setRejectReason('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotReviewHariharaaSubscription.en} / ${strings.couldNotReviewHariharaaSubscription.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleDispatchStatus(itemId: string, current: 'PENDING' | 'SENT') {
    if (!session || !order) return;
    setBusyItemId(itemId);
    setError(null);
    try {
      const next = current === 'PENDING' ? 'SENT' : 'PENDING';
      setOrder(await setItemDispatchStatus(session.accessToken, order.id, itemId, next));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUpdateDispatchStatus.en} / ${strings.couldNotUpdateDispatchStatus.te}`);
    } finally {
      setBusyItemId(null);
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
            {order.shippingAddress ? <AddressBlock address={order.shippingAddress} /> : <div>{order.deliveryAddress}</div>}
          </div>
          <div>
            <div className="field-label"><Bi id="paymentMethodLabel" /></div>
            <div>
              {order.paymentMethod === 'UPI' ? strings.paymentUpiShort.en + ' / ' + strings.paymentUpiShort.te : strings.paymentCod.en + ' / ' + strings.paymentCod.te}
            </div>
            <div className="status-line">
              {orderPaymentStatusLabel(order.paymentStatus).en} / {orderPaymentStatusLabel(order.paymentStatus).te}
            </div>
            {order.paymentUtr && <div className="meta">UTR: {order.paymentUtr}</div>}
            {order.paymentStatus === 'REJECTED' && order.paymentRejectionReason && <div className="hint">{order.paymentRejectionReason}</div>}
          </div>

          {isOwner && order.paymentMethod === 'UPI' && order.status !== 'CANCELLED' && (order.paymentStatus === 'PENDING' || order.paymentStatus === 'REJECTED') && (
            <div className="card">
              <Bi id="orderPayHeading" as="h2" />
              {!payLink ? (
                <button type="button" onClick={handleStartPayment} disabled={paying}>
                  {paying ? <BiValue value={strings.hariharaaStartingPayment} /> : <Bi id="hariharaaPayNowButton" />}
                </button>
              ) : (
                <>
                  <UpiPaymentCard payment={payLink} />
                  <BiValue value={strings.hariharaaPayThenSubmitHint} as="p" className="hint" />
                  <form onSubmit={handleClaim}>
                    <label>
                      <Bi id="hariharaaPaymentReferenceField" />
                      <input name="utr" required minLength={6} maxLength={40} onInvalid={bilingualInvalidHandler} onChange={clearCustomValidity} />
                    </label>
                    <button type="submit" disabled={paying}>
                      {paying ? <BiValue value={strings.hariharaaSubmittingClaim} /> : <Bi id="hariharaaSubmitClaimButton" />}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
          {isOwner && order.paymentMethod === 'UPI' && order.paymentStatus === 'CLAIMED' && (
            <BiValue value={strings.orderPayVerifyingNotice} as="p" className="hint" />
          )}

          {isStaff && order.paymentMethod === 'UPI' && order.paymentStatus === 'CLAIMED' && (
            <div className="card">
              <Bi id="orderVerifyHeading" as="h2" />
              <BiValue value={strings.orderVerifyHint} as="p" className="hint" />
              <button type="button" onClick={() => handleReview(true)} disabled={busy}>
                <Bi id="approveButton" />
              </button>
              <label>
                <Bi id="rejectReasonField" />
                <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </label>
              <button type="button" className="secondary" onClick={() => handleReview(false)} disabled={busy || !rejectReason.trim()}>
                <Bi id="rejectButton" />
              </button>
            </div>
          )}

          {order.items.map((item) => {
            const itemBusy = busyItemId === item.id;
            const itemStatus = dispatchStatusLabel(item.dispatchStatus);
            return (
              <div className="farm-item" key={item.id}>
                <div className="label">{item.productName}</div>
                <div className="meta">
                  {item.quantity} × ₹{item.unitPrice.toFixed(2)} = ₹{item.lineTotal.toFixed(2)}
                </div>
                <div className="status-line">
                  {itemStatus.en} / {itemStatus.te}
                </div>
                {canDispatch && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => handleToggleDispatchStatus(item.id, item.dispatchStatus)}
                    disabled={itemBusy}
                  >
                    {itemBusy ? (
                      <BiValue value={strings.updatingDispatchStatus} />
                    ) : item.dispatchStatus === 'PENDING' ? (
                      <Bi id="markSentButton" />
                    ) : (
                      <Bi id="markPendingButton" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">₹{order.totalAmount.toFixed(2)}</div>
              <BiValue value={strings.cartTotalLabel} as="div" className="label" />
            </div>
          </div>

          {isStaff && order.status === 'PLACED' && order.paymentMethod === 'UPI' && order.paymentStatus !== 'PAID' && (
            <BiValue value={strings.orderConfirmNeedsPayment} as="p" className="hint" />
          )}
          {isStaff && order.status === 'PLACED' && (
            <button
              type="button"
              onClick={() => handleAction(confirmOrder)}
              disabled={busy || (order.paymentMethod === 'UPI' && order.paymentStatus !== 'PAID')}
            >
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

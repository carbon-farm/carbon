import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getOrder, type Order } from '../api/marketplace';
import { AddressBlock } from '../components/AddressBlock';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, orderStatusLabel, orderPaymentStatusLabel } from '../i18n/strings';

// A clean, printable record of an order — "Print" lets the browser save it as a PDF. It is an
// order receipt, not a tax invoice (it carries no GST breakdown), and says so on the page.
export function OrderReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !id) return;
    getOrder(session.accessToken, id)
      .then(setOrder)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) logout();
        else setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, id, logout]);

  const date = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <div className="top-bar no-print">
        <div>
          <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
          <Bi id="receiptTitle" as="h1" />
        </div>
        <button type="button" onClick={() => window.print()} disabled={!order}>
          <Bi id="receiptPrintButton" />
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !order ? (
        <BiValue value={strings.orderNotFoundError} as="p" className="hint" />
      ) : (
        <div className="card receipt">
          <div className="receipt-head">
            <div>
              <strong className="receipt-brand">
                {strings.brand.en} · {strings.brandGroup.en}
              </strong>
              <div className="meta">
                {strings.brand.te} · {strings.brandGroup.te}
              </div>
            </div>
            <div className="receipt-meta">
              <div>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="meta">{date(order.createdAt)}</div>
            </div>
          </div>

          <div className="receipt-cols">
            <div>
              <div className="field-label">
                <Bi id="deliveryAddressField" />
              </div>
              {order.shippingAddress ? <AddressBlock address={order.shippingAddress} /> : <div>{order.deliveryAddress}</div>}
            </div>
            <div>
              <div className="field-label">
                <Bi id="paymentMethodLabel" />
              </div>
              <div>
                {order.paymentMethod === 'UPI' ? `${strings.paymentUpiShort.en} / ${strings.paymentUpiShort.te}` : `${strings.paymentCod.en} / ${strings.paymentCod.te}`}
              </div>
              <div className="meta">
                {orderPaymentStatusLabel(order.paymentStatus).en} / {orderPaymentStatusLabel(order.paymentStatus).te}
              </div>
              {order.paymentUtr && <div className="meta">UTR: {order.paymentUtr}</div>}
              <div className="meta">
                {orderStatusLabel(order.status).en} / {orderStatusLabel(order.status).te}
              </div>
            </div>
          </div>

          <table className="data-table receipt-table">
            <thead>
              <tr>
                <th>{strings.receiptItemColumn.en} / {strings.receiptItemColumn.te}</th>
                <th>{strings.receiptQtyColumn.en} / {strings.receiptQtyColumn.te}</th>
                <th>{strings.receiptPriceColumn.en} / {strings.receiptPriceColumn.te}</th>
                <th>{strings.receiptAmountColumn.en} / {strings.receiptAmountColumn.te}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td>{i.productName}</td>
                  <td>{i.quantity}</td>
                  <td>
                    ₹{i.unitPrice.toFixed(2)}
                    {i.unit ? ` ${i.unit}` : ''}
                  </td>
                  <td>₹{i.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={3}>{strings.cartTotalLabel.en} / {strings.cartTotalLabel.te}</th>
                <th>₹{order.totalAmount.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>

          <BiValue value={strings.receiptNotInvoice} as="p" className="hint" />
        </div>
      )}

      <Link to={order ? `/marketplace/orders/${order.id}` : '/marketplace/orders'} className="link-button no-print">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

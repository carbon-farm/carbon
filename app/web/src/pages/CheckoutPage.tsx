import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useMembership } from '../auth/MembershipContext';
import { ApiError } from '../api/client';
import { getMe, type AdminUser } from '../api/admin';
import { createAddress, listAddresses, type Address, type AddressInput } from '../api/addresses';
import { checkout, getCart, type Cart } from '../api/marketplace';
import { AddressBlock } from '../components/AddressBlock';
import { AddressForm } from '../components/AddressForm';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// Where to deliver, how to pay, then place the order. Everything the dispatch team needs
// (receiver, phone, full address) is collected here and saved to the member's address book.
export function CheckoutPage() {
  const { session, logout } = useAuth();
  const { applies, unlocked } = useMembership();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [me, setMe] = useState<AdminUser | null>(null);
  const [addressId, setAddressId] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([getCart(session.accessToken), listAddresses(session.accessToken), getMe(session.accessToken)])
      .then(([c, a, u]) => {
        setCart(c);
        setAddresses(a);
        setMe(u);
        setAddressId((a.find((x) => x.isDefault) ?? a[0])?.id ?? '');
        setAdding(a.length === 0);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCart.en} / ${strings.couldNotLoadCart.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleSaveAddress(data: AddressInput) {
    if (!session) return;
    setSavingAddress(true);
    setError(null);
    try {
      const created = await createAddress(session.accessToken, data);
      setAddresses(await listAddresses(session.accessToken));
      setAddressId(created.id);
      setAdding(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSaveAddress.en} / ${strings.couldNotSaveAddress.te}`);
    } finally {
      setSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (!session || !addressId) return;
    setPlacing(true);
    setError(null);
    try {
      const order = await checkout(session.accessToken, { addressId, paymentMethod });
      navigate(`/marketplace/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotCheckout.en} / ${strings.couldNotCheckout.te}`);
    } finally {
      setPlacing(false);
    }
  }

  const locked = applies && !unlocked;

  return (
    <>
      <div>
        <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
        <Bi id="checkoutTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !cart || cart.items.length === 0 ? (
        <>
          <BiValue value={strings.cartEmptyNotice} as="p" className="hint" />
          <Link to="/marketplace" className="link-button">
            <Bi id="marketplaceTitle" />
          </Link>
        </>
      ) : locked ? (
        <div className="card">
          <Bi id="membershipLockedTitle" as="h2" />
          <BiValue value={strings.checkoutNeedsMembershipNotice} as="p" />
          <button type="button" onClick={() => navigate('/hariharaa/subscription')}>
            <Bi id="membershipLockedButton" />
          </button>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-main">
            <div className="card">
              <Bi id="deliveryAddressHeading" as="h2" />
              {addresses.length > 0 && (
                <div className="option-list" role="radiogroup">
                  {addresses.map((a) => (
                    <label className={`option-card${addressId === a.id && !adding ? ' selected' : ''}`} key={a.id}>
                      <input type="radio" name="address" checked={addressId === a.id} onChange={() => { setAddressId(a.id); setAdding(false); }} />
                      <span>
                        <span className="label">
                          {a.label || strings.addrUntitled.en}
                          {a.isDefault && <span className="priority-badge"> ★ {strings.addrDefaultBadge.en}</span>}
                        </span>
                        <AddressBlock address={a} />
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {adding ? (
                <>
                  <Bi id="addAddressButton" as="h2" />
                  <AddressForm
                    submitting={savingAddress}
                    onSubmit={handleSaveAddress}
                    onCancel={addresses.length > 0 ? () => setAdding(false) : undefined}
                    defaultName={me?.name ?? ''}
                    defaultPhone={me?.mobileNumber ?? ''}
                  />
                </>
              ) : (
                <button type="button" className="secondary" onClick={() => setAdding(true)}>
                  <Bi id="addAddressButton" />
                </button>
              )}
            </div>

            <div className="card">
              <Bi id="paymentMethodHeading" as="h2" />
              <div className="option-list" role="radiogroup">
                <label className={`option-card${paymentMethod === 'COD' ? ' selected' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                  <span>
                    <Bi id="paymentCod" as="span" className="label" />
                    <BiValue value={strings.paymentCodHint} as="span" className="hint" />
                  </span>
                </label>
                <label className={`option-card${paymentMethod === 'UPI' ? ' selected' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                  <span>
                    <Bi id="paymentUpi" as="span" className="label" />
                    <BiValue value={strings.paymentUpiHint} as="span" className="hint" />
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="checkout-side">
            <div className="card">
              <Bi id="orderSummaryHeading" as="h2" />
              {cart.items.map((item) => (
                <div className="summary-line" key={item.id}>
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-line total">
                <BiValue value={strings.cartTotalLabel} />
                <span>₹{cart.total.toFixed(2)}</span>
              </div>
              <button type="button" onClick={handlePlaceOrder} disabled={placing || !addressId || adding}>
                {placing ? <BiValue value={strings.placingOrder} /> : <Bi id="placeOrderButton" />}
              </button>
              {!addressId && <BiValue value={strings.chooseAddressHint} as="p" className="hint" />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

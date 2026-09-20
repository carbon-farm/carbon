import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getCart, setCartItem, removeFromCart, checkout, type Cart } from '../api/marketplace';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function CartPage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!session) return;
    getCart(session.accessToken)
      .then(setCart)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCart.en} / ${strings.couldNotLoadCart.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleQuantityChange(productId: string, quantity: number) {
    if (!session || quantity < 1) return;
    setBusyProductId(productId);
    setError(null);
    try {
      setCart(await setCartItem(session.accessToken, productId, quantity));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddToCart.en} / ${strings.couldNotAddToCart.te}`);
    } finally {
      setBusyProductId(null);
    }
  }

  async function handleRemove(productId: string) {
    if (!session) return;
    setBusyProductId(productId);
    setError(null);
    try {
      setCart(await removeFromCart(session.accessToken, productId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddToCart.en} / ${strings.couldNotAddToCart.te}`);
    } finally {
      setBusyProductId(null);
    }
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !address.trim()) return;
    setPlacingOrder(true);
    setError(null);
    try {
      const order = await checkout(session.accessToken, address.trim());
      navigate(`/marketplace/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotCheckout.en} / ${strings.couldNotCheckout.te}`);
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <>
      <div>
        <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
        <Bi id="cartTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !cart || cart.items.length === 0 ? (
        <BiValue value={strings.cartEmptyNotice} as="p" className="hint" />
      ) : (
        <>
          <div className="card">
            {cart.items.map((item) => {
              const isBusy = busyProductId === item.productId;
              return (
                <div className="farm-item" key={item.id}>
                  <div className="label">{item.product.name}</div>
                  <div className="meta">
                    ₹{item.product.price.toFixed(2)} {item.product.unit}
                  </div>
                  <label>
                    <Bi id="quantityLabel" />
                    <input
                      type="number"
                      min={1}
                      max={item.product.stockQuantity}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                      disabled={isBusy}
                    />
                  </label>
                  <button type="button" className="secondary" onClick={() => handleRemove(item.productId)} disabled={isBusy}>
                    {isBusy ? <BiValue value={strings.removingItem} /> : <Bi id="removeButton" />}
                  </button>
                </div>
              );
            })}
            <div className="stat-row">
              <div className="stat-tile">
                <div className="value">₹{cart.total.toFixed(2)}</div>
                <BiValue value={strings.cartTotalLabel} as="div" className="label" />
              </div>
            </div>
          </div>

          <div className="card">
            <Bi id="checkoutTitle" as="h2" />
            <BiValue value={strings.cashOnDeliveryNotice} as="p" className="hint" />
            <form onSubmit={handleCheckout}>
              <label>
                <Bi id="deliveryAddressField" />
                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearCustomValidity(e);
                  }}
                  onInvalid={bilingualInvalidHandler}
                  minLength={10}
                  rows={3}
                  required
                />
              </label>
              <button type="submit" disabled={placingOrder || !address.trim()}>
                {placingOrder ? <BiValue value={strings.placingOrder} /> : <Bi id="placeOrderButton" />}
              </button>
            </form>
          </div>
        </>
      )}

      <Link to="/marketplace" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useMembership } from '../auth/MembershipContext';
import { ApiError } from '../api/client';
import { getCart, previewGuestCart, setCartItem, removeFromCart, type Cart } from '../api/marketplace';
import { readGuestCart, removeGuestCartItem, setGuestCartItem } from '../cart/guestCart';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// One cart screen for everyone. Signed in: the saved cart. Signed out: the cart kept in this
// browser (priced by the server), which joins the saved cart at sign-in. Checkout itself needs
// an account — and, for a member, an active membership (the checkout page explains that).
export function CartPage() {
  const { session, logout } = useAuth();
  const { applies, unlocked } = useMembership();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const isStaff = !!session && session.role !== 'MEMBER';

  const load = useCallback(async () => {
    try {
      if (session) {
        if (session.role !== 'MEMBER') {
          setCart({ items: [], total: 0 });
          return;
        }
        setCart(await getCart(session.accessToken));
      } else {
        const lines = readGuestCart();
        setCart(lines.length ? await previewGuestCart(lines) : { items: [], total: 0 });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCart.en} / ${strings.couldNotLoadCart.te}`);
    } finally {
      setLoading(false);
    }
  }, [session, logout]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleQuantityChange(productId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyProductId(productId);
    setError(null);
    try {
      if (session) setCart(await setCartItem(session.accessToken, productId, quantity));
      else {
        setGuestCartItem(productId, quantity);
        await load();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddToCart.en} / ${strings.couldNotAddToCart.te}`);
    } finally {
      setBusyProductId(null);
    }
  }

  async function handleRemove(productId: string) {
    setBusyProductId(productId);
    setError(null);
    try {
      if (session) setCart(await removeFromCart(session.accessToken, productId));
      else {
        removeGuestCartItem(productId);
        await load();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddToCart.en} / ${strings.couldNotAddToCart.te}`);
    } finally {
      setBusyProductId(null);
    }
  }

  return (
    <>
      <div>
        <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
        <Bi id="cartTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {isStaff ? (
        <BiValue value={strings.staffNoCartNotice} as="p" className="hint" />
      ) : loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !cart || cart.items.length === 0 ? (
        <BiValue value={strings.cartEmptyNotice} as="p" className="hint" />
      ) : (
        <>
          <div className="card">
            <div className="product-grid">
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
            </div>
            <div className="stat-row">
              <div className="stat-tile">
                <div className="value">₹{cart.total.toFixed(2)}</div>
                <BiValue value={strings.cartTotalLabel} as="div" className="label" />
              </div>
            </div>
          </div>

          <div className="card">
            {!session ? (
              <>
                <Bi id="checkoutTitle" as="h2" />
                <BiValue value={strings.guestCheckoutNotice} as="p" className="hint" />
                <button type="button" onClick={() => navigate('/login?next=/marketplace/cart')}>
                  <Bi id="loginToCheckoutButton" />
                </button>
                <button type="button" className="secondary" onClick={() => navigate('/register')}>
                  <Bi id="createAccountTitle" />
                </button>
              </>
            ) : (
              <>
                <Bi id="checkoutTitle" as="h2" />
                {applies && !unlocked && <BiValue value={strings.checkoutNeedsMembershipNotice} as="p" className="hint" />}
                <button type="button" onClick={() => navigate(applies && !unlocked ? '/hariharaa/subscription' : '/marketplace/checkout')}>
                  <Bi id={applies && !unlocked ? 'membershipLockedButton' : 'proceedToCheckoutButton'} />
                </button>
              </>
            )}
          </div>
        </>
      )}

      <Link to="/marketplace" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

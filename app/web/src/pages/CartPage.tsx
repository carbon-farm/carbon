import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useMembership } from '../auth/MembershipContext';
import { ApiError } from '../api/client';
import { getCart, previewGuestCart, setCartItem, removeFromCart, type Cart } from '../api/marketplace';
import { readGuestCart, removeGuestCartItem, setGuestCartItem } from '../cart/guestCart';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// Quantity with − / + buttons and a box that can be typed in freely: the number is only sent when
// the person leaves the box or presses Enter, so clearing it to type "12" never jumps to 1 and
// never fires a request per keystroke.
function QuantityStepper({
  value,
  max,
  disabled,
  onCommit,
}: {
  value: number;
  max: number;
  disabled: boolean;
  onCommit: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  function commit(raw: string) {
    const n = Math.floor(Number(raw));
    if (!raw.trim() || !Number.isFinite(n) || n < 1) {
      setText(String(value)); // nothing sensible typed — put the old number back
      return;
    }
    const clamped = Math.min(n, max);
    setText(String(clamped));
    if (clamped !== value) onCommit(clamped);
  }

  return (
    <div className="qty-stepper">
      <button type="button" className="secondary qty-btn" aria-label={biInline('quantityLess')} disabled={disabled || value <= 1} onClick={() => onCommit(value - 1)}>
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={biInline('quantityLabel')}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(text);
          }
        }}
      />
      <button type="button" className="secondary qty-btn" aria-label={biInline('quantityMore')} disabled={disabled || value >= max} onClick={() => onCommit(value + 1)}>
        +
      </button>
    </div>
  );
}

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
  // A one-time note left by "Order again" when some items could not be added.
  const [notice] = useState<string | null>(() => {
    try {
      const n = sessionStorage.getItem('agriai.cartNotice');
      if (n) sessionStorage.removeItem('agriai.cartNotice');
      return n;
    } catch {
      return null;
    }
  });

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

      {notice && <div className="hint" role="status">{notice}</div>}
      {error && <div className="error-banner">{error}</div>}

      {isStaff ? (
        <BiValue value={strings.staffNoCartNotice} as="p" className="hint" />
      ) : loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !cart || cart.items.length === 0 ? (
        <div className="card">
          <BiValue value={session ? strings.cartEmptyAfterOrder : strings.cartEmptyNotice} as="p" />
          <button type="button" onClick={() => navigate('/marketplace')}>
            <BiValue value={strings.continueShoppingButton} />
          </button>
          {session && (
            <button type="button" className="secondary" onClick={() => navigate('/marketplace/orders')}>
              <BiValue value={strings.viewMyOrdersButton} />
            </button>
          )}
        </div>
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
                    <div>
                      <Bi id="quantityLabel" />
                      <QuantityStepper
                        value={item.quantity}
                        max={Math.max(1, item.product.stockQuantity)}
                        disabled={isBusy}
                        onCommit={(n) => handleQuantityChange(item.productId, n)}
                      />
                      {item.quantity >= item.product.stockQuantity && (
                        <small className="hint">{strings.quantityMaxHint.en.replace('{n}', String(item.product.stockQuantity))} / {strings.quantityMaxHint.te.replace('{n}', String(item.product.stockQuantity))}</small>
                      )}
                    </div>
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

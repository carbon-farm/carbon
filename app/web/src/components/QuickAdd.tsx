import { useState } from 'react';
import { ApiError } from '../api/client';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { QuantityStepper } from './QuantityStepper';

// "How many?" and "Add to cart" right on a product in the shop list, so several things can be put
// in the cart without opening each one. It stays on the page afterwards and says how many of the
// product are now in the cart.
export function QuickAdd({
  stock,
  inCart,
  onAdd,
}: {
  stock: number;
  inCart: number;
  onAdd: (quantity: number) => Promise<number>;
}) {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const room = stock - inCart;

  async function add() {
    setBusy(true);
    setError(null);
    try {
      await onAdd(quantity);
      setQuantity(1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddToCart.en} / ${strings.couldNotAddToCart.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="quick-add">
      {inCart > 0 && (
        <small className="in-cart-note" role="status">
          ✓ {strings.inYourCart.en.replace('{n}', String(inCart))} / {strings.inYourCart.te.replace('{n}', String(inCart))}
        </small>
      )}
      {room > 0 ? (
        <>
          <QuantityStepper value={Math.min(quantity, room)} max={room} disabled={busy} onCommit={setQuantity} />
          <button type="button" onClick={add} disabled={busy}>
            {busy ? <BiValue value={strings.addingToCart} /> : <Bi id="addToCartButton" />}
          </button>
        </>
      ) : (
        <BiValue value={strings.allStockInCart} as="small" className="hint" />
      )}
      {error && <small className="error-text">{error}</small>}
    </div>
  );
}

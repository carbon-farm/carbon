import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getCart, setCartItem } from '../api/marketplace';
import { readGuestCart, setGuestCartItem } from './guestCart';

// What is in the cart right now, product by product — for a signed-in member the saved cart, for a
// visitor the one kept in this browser — plus a way to add more of something without leaving the
// page. Lets the shop and product screens say "2 in your cart" and keep adding.
export function useCartQuantities() {
  const { session } = useAuth();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const canShop = !session || session.role === 'MEMBER';

  useEffect(() => {
    if (!canShop) {
      setQuantities({});
      return;
    }
    if (!session) {
      setQuantities(Object.fromEntries(readGuestCart().map((l) => [l.productId, l.quantity])));
      return;
    }
    let live = true;
    getCart(session.accessToken)
      .then((cart) => live && setQuantities(Object.fromEntries(cart.items.map((i) => [i.productId, i.quantity]))))
      .catch(() => undefined); // a count that fails to load must never block shopping
    return () => {
      live = false;
    };
  }, [session, canShop]);

  // Adds `more` to what is already in the cart (never past the stock); returns the new quantity.
  const addMore = useCallback(
    async (productId: string, more: number, stock: number): Promise<number> => {
      const next = Math.min(stock, (quantities[productId] ?? 0) + more);
      if (session) await setCartItem(session.accessToken, productId, next);
      else setGuestCartItem(productId, next);
      setQuantities((q) => ({ ...q, [productId]: next }));
      return next;
    },
    [session, quantities],
  );

  const lines = Object.values(quantities).filter((n) => n > 0).length;
  return { quantities, lines, addMore, canShop };
}

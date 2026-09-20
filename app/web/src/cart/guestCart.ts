// The cart of a visitor who is not signed in, kept in this browser only. It is folded into
// their saved cart the moment they sign in or register (see AuthContext), then cleared.
export interface GuestCartLine {
  productId: string;
  quantity: number;
}

const KEY = 'agriai.guestCart';

export function readGuestCart(): GuestCartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((l) => l && typeof l.productId === 'string' && Number.isInteger(l.quantity) && l.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

function write(lines: GuestCartLine[]) {
  try {
    if (lines.length) localStorage.setItem(KEY, JSON.stringify(lines));
    else localStorage.removeItem(KEY);
  } catch {
    // storage blocked (private window) — the cart just won't persist
  }
}

export function setGuestCartItem(productId: string, quantity: number): GuestCartLine[] {
  const rest = readGuestCart().filter((l) => l.productId !== productId);
  const next = quantity > 0 ? [...rest, { productId, quantity }] : rest;
  write(next);
  return next;
}

export function removeGuestCartItem(productId: string): GuestCartLine[] {
  return setGuestCartItem(productId, 0);
}

export function clearGuestCart() {
  write([]);
}

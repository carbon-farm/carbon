// Products a visitor who is not signed in has hearted, kept in this browser only. They join the
// member's saved wishlist the moment they sign in or register (see AuthContext), then this is cleared.
const KEY = 'agriai.guestWishlist';

export function readGuestWishlist(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    if (ids.length) localStorage.setItem(KEY, JSON.stringify(ids));
    else localStorage.removeItem(KEY);
  } catch {
    // storage blocked (private window) — the hearts just won't persist
  }
}

// Returns whether the product is hearted afterwards.
export function toggleGuestWishlist(productId: string): boolean {
  const current = readGuestWishlist();
  const has = current.includes(productId);
  write(has ? current.filter((id) => id !== productId) : [...current, productId]);
  return !has;
}

export function clearGuestWishlist() {
  write([]);
}

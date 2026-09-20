import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { listHariharaaCatalog, type Product } from '../../api/marketplace';
import { Bi, BiValue, biInline } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';

type SortMode = 'newest' | 'priceAsc' | 'priceDesc' | 'title';

// HARIHARAA's own catalog — same Product/Cart/Order infrastructure as the
// general Marketplace, just a different vendor's products and a different
// gate (active CUSTOMER subscription, enforced server-side). Product detail,
// cart, and checkout all reuse the existing MarketplacePage-adjacent pages
// (ProductDetailPage, CartPage) unchanged — no HARIHARAA-specific versions
// needed there.
export function HariharaaShopPage() {
  const { session, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    listHariharaaCatalog(session.accessToken)
      .then(setProducts)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        // 403 here always means "no active subscription" — point them at where to pay.
        if (err instanceof ApiError && err.status === 403) {
          setNeedsSubscription(true);
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadProducts.en} / ${strings.couldNotLoadProducts.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const visible = useMemo(() => {
    let rows = products;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q));
    }
    rows = [...rows];
    switch (sortMode) {
      case 'priceAsc':
        rows.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        rows.sort((a, b) => b.price - a.price);
        break;
      case 'title':
        rows.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return rows;
  }, [products, search, sortMode]);

  // No active subscription: the shop is locked, so send them to where they can pay
  // instead of showing an error (this is where a newly registered customer lands first).
  if (needsSubscription) return <Navigate to="/hariharaa/subscription" replace />;

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="hariharaaShopNavTitle" as="span" className="eyebrow" />
          <Bi id="hariharaaShopTitle" as="h1" />
        </div>
        <Link to="/marketplace/cart">
          <button type="button" className="secondary">
            <Bi id="viewCartButton" />
          </button>
        </Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && products.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="priceAsc">{biInline('productPriceLabel')} ↑</option>
              <option value="priceDesc">{biInline('productPriceLabel')} ↓</option>
              <option value="title">{biInline('sortTitleAZ')}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : products.length === 0 ? (
        <BiValue value={strings.noHariharaaProductsYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((p) => (
            <Link to={`/marketplace/products/${p.id}`} key={p.id} className="case-item">
              <div className="label">{p.name}</div>
              <div className="meta">₹{p.price.toFixed(2)} {p.unit}</div>
              {p.stockQuantity === 0 && <BiValue value={strings.outOfStockNotice} as="div" className="status-line" />}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

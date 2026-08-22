import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listPublishedProducts, listCategories, listWishlist, type Product, type ProductCategory } from '../api/marketplace';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

type SortMode = 'newest' | 'priceAsc' | 'priceDesc' | 'title';

export function MarketplacePage() {
  const { session, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    listPublishedProducts(session.accessToken)
      .then(setProducts)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadProducts.en} / ${strings.couldNotLoadProducts.te}`);
      })
      .finally(() => setLoading(false));
    listCategories(session.accessToken).then(setCategories).catch(() => {});
    listWishlist(session.accessToken)
      .then((items) => setWishlistIds(new Set(items.map((p) => p.id))))
      .catch(() => {});
  }, [session, logout]);

  const visible = useMemo(() => {
    let rows = products;
    if (categoryFilter) rows = rows.filter((p) => p.categoryId === categoryFilter);
    if (wishlistOnly) rows = rows.filter((p) => wishlistIds.has(p.id));
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
  }, [products, categoryFilter, wishlistOnly, wishlistIds, search, sortMode]);

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
          <Bi id="marketplaceTitle" as="h1" />
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
          {categories.length > 0 && (
            <label>
              <Bi id="categoryLabel" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">{biInline('allOption')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="priceAsc">{biInline('productPriceLabel')} ↑</option>
              <option value="priceDesc">{biInline('productPriceLabel')} ↓</option>
              <option value="title">{biInline('sortTitleAZ')}</option>
            </select>
          </label>
          {wishlistIds.size > 0 && (
            <label className="checkbox-label">
              <input type="checkbox" checked={wishlistOnly} onChange={(e) => setWishlistOnly(e.target.checked)} />
              <Bi id="myWishlistHeading" />
            </label>
          )}
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : products.length === 0 ? (
        <BiValue value={strings.noProductsYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((p) => (
            <Link to={`/marketplace/products/${p.id}`} key={p.id} className="case-item">
              <div className="top-bar">
                <div className="label">{p.name}</div>
                {wishlistIds.has(p.id) && <span className="priority-badge">♥</span>}
              </div>
              <div className="meta">
                ₹{p.price.toFixed(2)} {p.unit} · {p.vendor?.businessName ?? biInline('platformSoldOption')}
              </div>
              {p.stockQuantity === 0 && <BiValue value={strings.outOfStockNotice} as="div" className="status-line" />}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

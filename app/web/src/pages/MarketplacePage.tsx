import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  listCatalogProducts,
  listCatalogCategories,
  listWishlist,
  type Product,
  type ProductCategory,
} from '../api/marketplace';
import { buildCategoryTree, categoryName } from '../catalog/categoryTree';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

type SortMode = 'newest' | 'priceAsc' | 'priceDesc' | 'title';

// The shop window. Open to everyone (no login): browse the combined catalog by
// Department -> Category -> Sub-category, search, sort, and fill a cart. Signing in is only
// needed to check out; a paid or free membership unlocks checkout itself.
export function MarketplacePage() {
  const { session, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    listCatalogProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadProducts.en} / ${strings.couldNotLoadProducts.te}`))
      .finally(() => setLoading(false));
    listCatalogCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session || session.role !== 'MEMBER') return;
    listWishlist(session.accessToken)
      .then((items) => setWishlistIds(new Set(items.map((p) => p.id))))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) logout();
      });
  }, [session, logout]);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const department = tree.find((d) => d.id === departmentId);
  const category = department?.children.find((c) => c.id === categoryId);

  // The deepest choice made; browsing it includes everything filed beneath it.
  const selectedIds = useMemo(() => {
    const chosen = subCategoryId || categoryId || departmentId;
    if (!chosen) return null;
    const out = new Set<string>();
    const walk = (nodes: typeof tree) => {
      for (const n of nodes) {
        if (n.id === chosen) collect(n);
        else walk(n.children);
      }
    };
    const collect = (n: (typeof tree)[number]) => {
      out.add(n.id);
      n.children.forEach(collect);
    };
    walk(tree);
    return out;
  }, [tree, departmentId, categoryId, subCategoryId]);

  const visible = useMemo(() => {
    let rows = products;
    if (selectedIds) rows = rows.filter((p) => p.categoryId !== null && selectedIds.has(p.categoryId));
    if (wishlistOnly) rows = rows.filter((p) => wishlistIds.has(p.id));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
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
  }, [products, selectedIds, wishlistOnly, wishlistIds, search, sortMode]);

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

      {!session && <BiValue value={strings.guestBrowseHint} as="p" className="hint" />}
      {error && <div className="error-banner">{error}</div>}

      {!loading && products.length > 0 && (
        <div className="list-toolbar" data-tour="filters">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          {tree.length > 0 && (
            <label>
              <Bi id="departmentLabel" />
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setCategoryId('');
                  setSubCategoryId('');
                }}
              >
                <option value="">{biInline('allOption')}</option>
                {tree.map((d) => (
                  <option key={d.id} value={d.id}>
                    {categoryName(d)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {department && department.children.length > 0 && (
            <label>
              <Bi id="categoryLabel" />
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId('');
                }}
              >
                <option value="">{biInline('allOption')}</option>
                {department.children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {categoryName(c)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {category && category.children.length > 0 && (
            <label>
              <Bi id="subCategoryLabel" />
              <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)}>
                <option value="">{biInline('allOption')}</option>
                {category.children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {categoryName(c)}
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
        <div className="product-grid" data-tour="products">
          {visible.map((p) => (
            <Link to={`/marketplace/products/${p.id}`} key={p.id} className="case-item product-tile">
              {p.imageUrls[0] && <img src={p.imageUrls[0]} alt="" className="product-tile-img" loading="lazy" />}
              <div className="top-bar">
                <div className="label">{p.name}</div>
                {wishlistIds.has(p.id) && <span className="priority-badge">♥</span>}
              </div>
              <div className="meta">
                ₹{p.price.toFixed(2)} {p.unit}
              </div>
              <div className="meta">
                {p.category ? `${p.category.name} · ` : ''}
                {p.vendor?.businessName ?? biInline('platformSoldOption')}
              </div>
              {p.stockQuantity === 0 && <BiValue value={strings.outOfStockNotice} as="div" className="status-line" />}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

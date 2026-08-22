import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listAllProductsForAdmin, type Product } from '../api/marketplace';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

type SortMode = 'newest' | 'oldest' | 'title';

export function ProductsManagePage() {
  const { session, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    listAllProductsForAdmin(session.accessToken)
      .then(setProducts)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadProducts.en} / ${strings.couldNotLoadProducts.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const vendors = useMemo(
    () => Array.from(new Map(products.filter((p) => p.vendor).map((p) => [p.vendor!.id, p.vendor!.businessName])).entries()),
    [products],
  );

  const visible = useMemo(() => {
    let rows = products;
    if (statusFilter) rows = rows.filter((p) => (statusFilter === 'active' ? p.isActive : !p.isActive));
    if (vendorFilter) rows = rows.filter((p) => (vendorFilter === 'platform' ? !p.vendorId : p.vendorId === vendorFilter));
    rows = [...rows];
    switch (sortMode) {
      case 'oldest':
        rows.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
        break;
      case 'title':
        rows.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return rows;
  }, [products, statusFilter, vendorFilter, sortMode]);

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="productsManageTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && products.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="statusFilterLabel" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              <option value="active">{biInline('activeStatusLabel')}</option>
              <option value="inactive">{biInline('inactiveStatusLabel')}</option>
            </select>
          </label>
          <label>
            <Bi id="vendorFilterLabel" />
            <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              <option value="platform">{biInline('platformSoldOption')}</option>
              {vendors.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
              <option value="title">{biInline('sortTitleAZ')}</option>
            </select>
          </label>
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
            <Link to={`/marketplace/manage/products/${p.id}`} key={p.id} className="case-item">
              <div className="top-bar">
                <div className="label">{p.name}</div>
                <BiValue value={p.isActive ? strings.activeStatusLabel : strings.inactiveStatusLabel} as="span" className="priority-badge" />
              </div>
              <div className="meta">
                ₹{p.price.toFixed(2)} {p.unit} · {p.vendor?.businessName ?? strings.platformSoldOption.en}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  getMyVendorProfile,
  submitVendorProfile,
  listMyProducts,
  listCategories,
  type VendorProfile,
  type Product,
  type ProductCategory,
} from '../api/marketplace';
import { ProductCreateForm } from '../components/ProductCreateForm';
import { ProductThumb } from '../components/ProductThumb';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function VendorDashboardPage() {
  const { session, logout } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  // filters for "my products"
  const [listSearch, setListSearch] = useState('');
  const [listStatus, setListStatus] = useState<'' | 'on' | 'off'>('');
  const [listSort, setListSort] = useState<'newest' | 'name' | 'priceAsc' | 'priceDesc' | 'stock'>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!session) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function load() {
    if (!session) return;
    setLoading(true);
    Promise.all([getMyVendorProfile(session.accessToken), listMyProducts(session.accessToken), listCategories(session.accessToken)])
      .then(([profileResult, productsResult, categoriesResult]) => {
        setProfile(profileResult);
        setProducts(productsResult);
        setCategories(categoriesResult);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleSubmitProfile() {
    const form = formRef.current;
    if (!session || !form || !form.reportValidity()) return;
    setSubmittingProfile(true);
    setError(null);
    const data = new FormData(form);
    try {
      const updated = await submitVendorProfile(session.accessToken, {
        businessName: String(data.get('businessName') ?? ''),
        description: String(data.get('description') ?? '') || undefined,
      });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitVendorProfile.en} / ${strings.couldNotSubmitVendorProfile.te}`);
    } finally {
      setSubmittingProfile(false);
    }
  }

  return (
    <>
      <div>
        <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
        <Bi id="vendorDashboardTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !profile || !profile.isApproved ? (
        <div className="card">
          <Bi id="vendorProfileHeading" as="h2" />
          {profile && <BiValue value={strings.vendorPendingNotice} as="p" className="hint" />}
          <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <label>
              <Bi id="businessNameField" />
              <input
                name="businessName"
                defaultValue={profile?.businessName ?? ''}
                onChange={clearCustomValidity}
                onInvalid={bilingualInvalidHandler}
                minLength={3}
                required
              />
            </label>
            <label>
              <Bi id="businessDescriptionField" />
              <textarea name="description" defaultValue={profile?.description ?? ''} rows={3} />
            </label>
            <button type="button" onClick={handleSubmitProfile} disabled={submittingProfile}>
              {submittingProfile ? <BiValue value={strings.submittingVendorProfile} /> : <Bi id="submitVendorProfileButton" />}
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="card">
            <BiValue value={strings.vendorApprovedNotice} as="p" className="hint" />
            <div className="label">{profile.businessName}</div>
          </div>

          <div className="top-bar">
            <Bi id="myProductsHeading" as="h2" />
            <button type="button" className="secondary" onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? <Bi id="cancelButton" /> : <Bi id="createProductButton" />}
            </button>
          </div>

          {showAddForm && (
            <ProductCreateForm
              categories={categories}
              onCreated={(created) => {
                setProducts((prev) => [created, ...prev]);
                setShowAddForm(false);
              }}
              onError={setError}
            />
          )}

          {products.length > 1 && (
            <div className="list-toolbar">
              <label>
                <Bi id="searchPlaceholder" />
                <input value={listSearch} onChange={(e) => setListSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
              </label>
              <label>
                <Bi id="statusFilterLabel" />
                <select value={listStatus} onChange={(e) => setListStatus(e.target.value as '' | 'on' | 'off')}>
                  <option value="">{biInline('allOption')}</option>
                  <option value="on">{strings.activeStatusLabel.en} / {strings.activeStatusLabel.te}</option>
                  <option value="off">{strings.inactiveStatusLabel.en} / {strings.inactiveStatusLabel.te}</option>
                </select>
              </label>
              <label>
                <Bi id="sortByLabel" />
                <select value={listSort} onChange={(e) => setListSort(e.target.value as typeof listSort)}>
                  <option value="newest">{biInline('sortNewestFirst')}</option>
                  <option value="name">{biInline('sortTitleAZ')}</option>
                  <option value="priceAsc">{biInline('productPriceLabel')} ↑</option>
                  <option value="priceDesc">{biInline('productPriceLabel')} ↓</option>
                  <option value="stock">{biInline('productStockLabel')} ↑</option>
                </select>
              </label>
            </div>
          )}

          <div className="card">
            {products.length === 0 ? (
              <BiValue value={strings.noProductsYet} as="p" className="hint" />
            ) : (
              [...products]
                .filter((p) => (!listStatus || (listStatus === 'on') === p.isActive) && (!listSearch.trim() || p.name.toLowerCase().includes(listSearch.trim().toLowerCase())))
                .sort((a, b) => {
                  switch (listSort) {
                    case 'name':
                      return a.name.localeCompare(b.name);
                    case 'priceAsc':
                      return a.price - b.price;
                    case 'priceDesc':
                      return b.price - a.price;
                    case 'stock':
                      return a.stockQuantity - b.stockQuantity;
                    default:
                      return b.updatedAt.localeCompare(a.updatedAt);
                  }
                })
                .map((p) => (
                <Link to={`/marketplace/manage/products/${p.id}`} key={p.id} className="case-item with-thumb">
                  <ProductThumb product={p} />
                  <div className="thumb-body">
                    <div className="top-bar">
                      <div className="label">{p.name}</div>
                      <BiValue value={p.isActive ? strings.activeStatusLabel : strings.inactiveStatusLabel} as="span" className="priority-badge" />
                    </div>
                    <div className="meta">
                      ₹{p.price.toFixed(2)} {p.unit} · {p.stockQuantity} {strings.productStockLabel.en}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}

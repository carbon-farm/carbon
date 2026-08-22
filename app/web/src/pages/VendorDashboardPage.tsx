import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  getMyVendorProfile,
  submitVendorProfile,
  listMyProducts,
  createProduct,
  listCategories,
  type VendorProfile,
  type Product,
  type ProductCategory,
} from '../api/marketplace';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function VendorDashboardPage() {
  const { session, logout } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const productFormRef = useRef<HTMLFormElement>(null);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

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

  async function handleCreateProduct() {
    const form = productFormRef.current;
    if (!session || !form || !form.reportValidity()) return;
    setCreatingProduct(true);
    setError(null);
    const data = new FormData(form);
    try {
      const created = await createProduct(session.accessToken, {
        name: String(data.get('name') ?? ''),
        description: String(data.get('description') ?? ''),
        price: Number(data.get('price') ?? 0),
        unit: String(data.get('unit') ?? ''),
        stockQuantity: Number(data.get('stockQuantity') ?? 0),
        categoryId: String(data.get('categoryId') ?? '') || undefined,
      });
      setProducts((prev) => [created, ...prev]);
      form.reset();
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotCreateProduct.en} / ${strings.couldNotCreateProduct.te}`);
    } finally {
      setCreatingProduct(false);
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
            <div className="card">
              <form ref={productFormRef} onSubmit={(e) => e.preventDefault()}>
                <label>
                  <Bi id="productNameField" />
                  <input name="name" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={3} required />
                </label>
                <label>
                  <Bi id="productDescriptionField" />
                  <textarea name="description" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={10} rows={3} required />
                </label>
                <label>
                  <Bi id="productPriceField" />
                  <input name="price" type="number" step="0.01" min="0" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
                </label>
                <label>
                  <Bi id="productUnitField" />
                  <input name="unit" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
                </label>
                <label>
                  <Bi id="productStockField" />
                  <input name="stockQuantity" type="number" step="1" min="0" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
                </label>
                <label>
                  <Bi id="articleCropField" />
                  <select name="categoryId" defaultValue="">
                    <option value="">{biInline('selectPlaceholder')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={handleCreateProduct} disabled={creatingProduct}>
                  {creatingProduct ? <BiValue value={strings.creatingProduct} /> : <Bi id="createProductButton" />}
                </button>
              </form>
            </div>
          )}

          <div className="card">
            {products.length === 0 ? (
              <BiValue value={strings.noProductsYet} as="p" className="hint" />
            ) : (
              products.map((p) => (
                <Link to={`/marketplace/manage/products/${p.id}`} key={p.id} className="case-item">
                  <div className="top-bar">
                    <div className="label">{p.name}</div>
                    <BiValue value={p.isActive ? strings.activeStatusLabel : strings.inactiveStatusLabel} as="span" className="priority-badge" />
                  </div>
                  <div className="meta">
                    ₹{p.price.toFixed(2)} {p.unit} · {p.stockQuantity} {strings.productStockLabel.en}
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

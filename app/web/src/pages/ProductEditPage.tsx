import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getProduct, updateProduct, uploadProductImage, type Product } from '../api/marketplace';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const backTo = session?.role === 'ADMINISTRATOR' ? '/marketplace/manage/products' : '/marketplace/vendor';

  useEffect(() => {
    if (!session || !id) return;
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  function loadProduct() {
    if (!session || !id) return;
    setLoading(true);
    getProduct(session.accessToken, id)
      .then(setProduct)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadProduct.en} / ${strings.couldNotLoadProduct.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !id) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      setProduct(
        await updateProduct(session.accessToken, id, {
          name: String(data.get('name') ?? ''),
          description: String(data.get('description') ?? ''),
          price: Number(data.get('price') ?? 0),
          unit: String(data.get('unit') ?? ''),
          stockQuantity: Number(data.get('stockQuantity') ?? 0),
        }),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUpdateProduct.en} / ${strings.couldNotUpdateProduct.te}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!session || !id || !file) return;
    setUploading(true);
    setError(null);
    try {
      setProduct(await uploadProductImage(session.accessToken, id, file));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUploadImage.en} / ${strings.couldNotUploadImage.te}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleToggleActive() {
    if (!session || !id || !product) return;
    setStatusBusy(true);
    setError(null);
    try {
      setProduct(await updateProduct(session.accessToken, id, { isActive: !product.isActive }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUpdateProduct.en} / ${strings.couldNotUpdateProduct.te}`);
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <>
      <div>
        <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
        <h1>{product?.name ?? ''}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !product ? (
        <BiValue value={strings.productNotFoundError} as="p" className="hint" />
      ) : (
        <>
          <div className="card">
            <div className="status-line">
              <BiValue value={product.isActive ? strings.activeStatusLabel : strings.inactiveStatusLabel} />
            </div>
            {product.imageUrls.length > 0 && (
              <div className="evidence-media-grid">
                {product.imageUrls.map((url) => (
                  <img src={url} alt="" className="evidence-thumb" key={url} />
                ))}
              </div>
            )}
            <label>
              <Bi id="uploadImageButton" />
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadImage} disabled={uploading} />
              {uploading && <BiValue value={strings.uploadingImage} as="p" className="hint" />}
            </label>

            <form onSubmit={handleSave}>
              <label>
                <Bi id="productNameField" />
                <input name="name" defaultValue={product.name} onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={3} required />
              </label>
              <label>
                <Bi id="productDescriptionField" />
                <textarea name="description" defaultValue={product.description} onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={10} rows={3} required />
              </label>
              <label>
                <Bi id="productPriceField" />
                <input name="price" type="number" step="0.01" min="0" defaultValue={product.price} onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
              </label>
              <label>
                <Bi id="productUnitField" />
                <input name="unit" defaultValue={product.unit} onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
              </label>
              <label>
                <Bi id="productStockField" />
                <input name="stockQuantity" type="number" step="1" min="0" defaultValue={product.stockQuantity} onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? <BiValue value={strings.saving} /> : <Bi id="saveDraftButton" />}
              </button>
            </form>

            <button type="button" className="secondary" onClick={handleToggleActive} disabled={statusBusy}>
              {statusBusy ? (
                <BiValue value={strings.updatingOrder} />
              ) : product.isActive ? (
                <Bi id="deactivateButton" />
              ) : (
                <Bi id="activateButton" />
              )}
            </button>
          </div>
        </>
      )}

      <Link to={backTo} className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

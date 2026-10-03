import { useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { createProduct, type Product, type ProductCategory } from '../api/marketplace';
import { flattenWithPaths } from '../catalog/categoryTree';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

// The "new product" form, shared by the vendor's dashboard and the administrator's Manage
// products screen. Photos are added on the product's edit screen once it exists, so the caller
// decides what happens next (the administrator is taken straight there).
export function ProductCreateForm({
  categories,
  onCreated,
  onError,
  note,
}: {
  categories: ProductCategory[];
  onCreated: (product: Product) => void;
  onError?: (message: string | null) => void;
  note?: string;
}) {
  const { session } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    const form = formRef.current;
    if (!session || !form || !form.reportValidity()) return;
    setCreating(true);
    setError(null);
    onError?.(null);
    const data = new FormData(form);
    try {
      const created = await createProduct(session.accessToken, {
        name: String(data.get('name') ?? '').trim(),
        description: String(data.get('description') ?? '').trim(),
        price: Number(data.get('price') ?? 0),
        unit: String(data.get('unit') ?? '').trim(),
        stockQuantity: Number(data.get('stockQuantity') ?? 0),
        categoryId: String(data.get('categoryId') ?? '') || undefined,
      });
      form.reset();
      onCreated(created);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : `${strings.couldNotCreateProduct.en} / ${strings.couldNotCreateProduct.te}`;
      setError(message);
      onError?.(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="card">
      {note && <p className="hint">{note}</p>}
      {error && <div className="error-banner">{error}</div>}
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="form-grid">
          <label className="span-2">
            <Bi id="productNameField" />
            <input name="name" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={3} required />
          </label>
          <label className="span-2">
            <Bi id="productDescriptionField" />
            <textarea name="description" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} minLength={10} rows={3} required />
          </label>
          <label>
            <Bi id="productPriceField" />
            <input name="price" type="number" step="0.01" min="0" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
          </label>
          <label>
            <Bi id="productUnitField" />
            <input name="unit" placeholder="per kg / per litre" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
          </label>
          <label>
            <Bi id="productStockField" />
            <input name="stockQuantity" type="number" step="1" min="0" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
          </label>
          <label>
            <Bi id="categoryLabel" />
            <select name="categoryId" defaultValue="">
              <option value="">{biInline('selectPlaceholder')}</option>
              {flattenWithPaths(categories).map(({ node: c, path }) => (
                <option key={c.id} value={c.id}>
                  {path}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button type="button" onClick={handleCreate} disabled={creating}>
            {creating ? <BiValue value={strings.creatingProduct} /> : <Bi id="createProductButton" />}
          </button>
        </div>
      </form>
    </div>
  );
}

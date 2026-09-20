import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { createCategory, listCategoriesForAdmin, updateCategory, type ProductCategory } from '../api/marketplace';
import { buildCategoryTree, type CategoryTreeNode } from '../catalog/categoryTree';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

const LEVEL_KEYS = ['departmentLabel', 'categoryLabel', 'subCategoryLabel'] as const;

// The shop's Department -> Category -> Sub-category tree. Add a department at the top, or
// add something inside any department/category (sub-categories are the deepest level).
// Switching a node off hides it from browsing without deleting it or its products.
export function ProductCategoryEditor() {
  const { session, logout } = useAuth();
  const [rows, setRows] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOff, setShowOff] = useState(true);
  const [search, setSearch] = useState('');
  // Where the add/rename form is open: 'root' for a new department, a node id to add inside it.
  const [adding, setAdding] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!session) return;
    try {
      setRows(await listCategoriesForAdmin(session.accessToken));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadTaxonomy.en} / ${strings.couldNotLoadTaxonomy.te}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const tree = useMemo(() => buildCategoryTree(rows), [rows]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setAdding(null);
      setRenaming(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSaveCategory.en} / ${strings.couldNotSaveCategory.te}`);
    } finally {
      setBusy(false);
    }
  }

  function handleAdd(event: FormEvent<HTMLFormElement>, parentId?: string) {
    event.preventDefault();
    if (!session) return;
    const f = new FormData(event.currentTarget);
    const name = String(f.get('name') ?? '').trim();
    const nameTe = String(f.get('nameTe') ?? '').trim();
    void run(() => createCategory(session.accessToken, { name, ...(nameTe ? { nameTe } : {}), ...(parentId ? { parentId } : {}) }));
  }

  function handleRename(event: FormEvent<HTMLFormElement>, node: ProductCategory) {
    event.preventDefault();
    if (!session) return;
    const f = new FormData(event.currentTarget);
    void run(() => updateCategory(session.accessToken, node.id, { name: String(f.get('name') ?? '').trim(), nameTe: String(f.get('nameTe') ?? '').trim() }));
  }

  const nameForm = (onSubmit: (e: FormEvent<HTMLFormElement>) => void, initial?: ProductCategory) => (
    <form onSubmit={onSubmit} className="inline-form">
      <label>
        <Bi id="itemNameField" />
        <input name="name" required minLength={2} maxLength={80} defaultValue={initial?.name ?? ''} />
      </label>
      <label>
        <Bi id="nameTeField" />
        <input name="nameTe" maxLength={80} defaultValue={initial?.nameTe ?? ''} />
      </label>
      <div className="form-actions">
        <button type="submit" disabled={busy}>
          {busy ? <BiValue value={strings.adding} /> : <Bi id="addrSaveButton" />}
        </button>
        <button type="button" className="secondary" onClick={() => { setAdding(null); setRenaming(null); }}>
          <Bi id="cancelButton" />
        </button>
      </div>
    </form>
  );

  const q = search.trim().toLowerCase();
  const matches = (n: CategoryTreeNode): boolean =>
    (!q || n.name.toLowerCase().includes(q) || (n.nameTe ?? '').toLowerCase().includes(q) || n.children.some(matches)) && (showOff || n.isActive);

  const renderNode = (node: CategoryTreeNode): JSX.Element | null => {
    if (!matches(node)) return null;
    const canHaveChildren = node.level < 2;
    return (
      <div key={node.id} className="tree-node" style={{ marginLeft: node.level * 20 }}>
        <div className={`farm-item${node.isActive ? '' : ' is-off'}`}>
          {renaming === node.id ? (
            nameForm((e) => handleRename(e, node), node)
          ) : (
            <>
              <div className="label">
                {node.name}
                {node.nameTe ? ` / ${node.nameTe}` : ''}
                {!node.isActive && <span className="priority-badge"> {strings.categoryOffBadge.en}</span>}
              </div>
              <div className="meta">
                {strings[LEVEL_KEYS[node.level]].en} / {strings[LEVEL_KEYS[node.level]].te} · {node.productCount} {strings.productsCountLabel.en} / {strings.productsCountLabel.te}
              </div>
              <div className="form-actions">
                <button type="button" className="secondary" onClick={() => { setRenaming(node.id); setAdding(null); }} disabled={busy}>
                  <Bi id="renameButton" />
                </button>
                {canHaveChildren && (
                  <button type="button" className="secondary" onClick={() => { setAdding(node.id); setRenaming(null); }} disabled={busy}>
                    <Bi id={node.level === 0 ? 'addCategoryInsideButton' : 'addSubCategoryInsideButton'} />
                  </button>
                )}
                <button
                  type="button"
                  className="secondary"
                  onClick={() => session && run(() => updateCategory(session.accessToken, node.id, { isActive: !node.isActive }))}
                  disabled={busy}
                >
                  <Bi id={node.isActive ? 'switchOffButton' : 'switchOnButton'} />
                </button>
              </div>
            </>
          )}
          {adding === node.id && nameForm((e) => handleAdd(e, node.id))}
        </div>
        {node.children.map(renderNode)}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="top-bar">
        <Bi id="productCategoriesHeading" as="h2" />
        <button type="button" onClick={() => { setAdding('root'); setRenaming(null); }} disabled={busy}>
          <Bi id="addDepartmentButton" />
        </button>
      </div>
      <BiValue value={strings.categoryTreeHint} as="p" className="hint" />
      {error && <div className="error-banner">{error}</div>}
      {adding === 'root' && nameForm((e) => handleAdd(e))}
      <div className="list-toolbar">
        <label>
          <Bi id="searchPlaceholder" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={showOff} onChange={(e) => setShowOff(e.target.checked)} />
          <Bi id="showSwitchedOffLabel" />
        </label>
      </div>
      {loading ? <BiValue value={strings.loading} as="p" className="hint" /> : tree.map(renderNode)}
    </div>
  );
}

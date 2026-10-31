import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { createCropCategory, updateCropCategory, type Crop, type CropCategory } from '../api/configuration';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { categoryName } from '../lib/crops';
import { useCropCategories } from '../lib/useCropCategories';

type SortKey = 'order' | 'name' | 'crops';

// The groups crops are listed under in the pickers: main groups and the sub-groups inside them.
// Administrators add, rename, reorder and switch off groups here — no code change. A group's key and
// its place in the tree never change, because crops point at the key.
export function CropGroupsAdminSection({ crops }: { crops: Crop[] }) {
  const { session } = useAuth();
  const { categories, reload } = useCropCategories();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | 'on' | 'off'>('');
  const [sortKey, setSortKey] = useState<SortKey>('order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEn, setEditEn] = useState('');
  const [editTe, setEditTe] = useState('');
  const [editOrder, setEditOrder] = useState('0');
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [parentKey, setParentKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cropCount = (g: CropCategory) => {
    const keys = [g.key, ...categories.filter((c) => c.parentKey === g.key).map((c) => c.key)];
    return crops.filter((c) => c.categories.some((k) => keys.includes(k))).length;
  };
  const parentOf = (g: CropCategory) => categories.find((c) => c.key === g.parentKey);
  const topLevel = categories.filter((c) => !c.parentKey);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    // tree order: each main group followed by its sub-groups
    const treeIndex = (g: CropCategory) => {
      const top = g.parentKey ? categories.find((c) => c.key === g.parentKey) : g;
      return [top?.sortOrder ?? 0, top?.nameEn ?? '', g.parentKey ? 1 : 0, g.sortOrder, g.nameEn] as const;
    };
    const cmpTree = (a: CropCategory, b: CropCategory) => {
      const x = treeIndex(a);
      const y = treeIndex(b);
      return x[0] - y[0] || x[1].localeCompare(y[1]) || x[2] - y[2] || x[3] - y[3] || x[4].localeCompare(y[4]);
    };
    const rows = categories.filter(
      (g) =>
        (!q || [g.nameEn, g.nameTe].some((v) => v.toLowerCase().includes(q))) &&
        (!status || (status === 'on' ? g.isActive : !g.isActive)),
    );
    const cmp = (a: CropCategory, b: CropCategory) => {
      if (sortKey === 'name') return a.nameEn.localeCompare(b.nameEn);
      if (sortKey === 'crops') return cropCount(a) - cropCount(b);
      return cmpTree(a, b);
    };
    return rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, crops, search, status, sortKey, sortDir]);

  function sortBy(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }
  const th = (key: SortKey, label: { en: string; te: string }) => (
    <th className="sortable" onClick={() => sortBy(key)}>
      {label.en} / {label.te}
      {key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );

  async function guarded(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddItem.en} / ${strings.couldNotAddItem.te}`);
      setBusy(false);
      return;
    }
    try {
      await reload(); // the change is saved; if only the refresh fails, say nothing wrong — the next load shows it
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  const handleAdd = () =>
    session && guarded(async () => {
      await createCropCategory(session.accessToken, { nameEn: nameEn.trim(), nameTe: nameTe.trim(), parentKey: parentKey || undefined });
      setNameEn('');
      setNameTe('');
      setParentKey('');
    });

  const handleSave = (g: CropCategory) =>
    session && guarded(async () => {
      await updateCropCategory(session.accessToken, g.id, { nameEn: editEn.trim(), nameTe: editTe.trim(), sortOrder: Number(editOrder) || 0 });
      setEditingId(null);
    });

  const handleToggle = (g: CropCategory) =>
    session && guarded(async () => {
      await updateCropCategory(session.accessToken, g.id, { isActive: !g.isActive });
    });

  function startEdit(g: CropCategory) {
    setEditingId(g.id);
    setEditEn(g.nameEn);
    setEditTe(g.nameTe);
    setEditOrder(String(g.sortOrder));
    setError(null);
  }

  return (
    <div className="card">
      <div className="top-bar">
        <Bi id="cropGroupsHeading" as="h2" />
      </div>
      <BiValue value={strings.cropGroupsIntro} as="p" className="hint" />
      {error && <div className="error-banner">{error}</div>}

      <div className="list-toolbar">
        <label>
          <Bi id="searchPlaceholder" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
        </label>
        <label>
          <Bi id="cropColStatus" />
          <select value={status} onChange={(e) => setStatus(e.target.value as '' | 'on' | 'off')}>
            <option value="">{biInline('allOption')}</option>
            <option value="on">{biInline('activeStatusLabel')}</option>
            <option value="off">{biInline('inactiveStatusLabel')}</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {th('name', strings.cropColGroup)}
                <th>
                  {strings.cropColParent.en} / {strings.cropColParent.te}
                </th>
                {th('crops', strings.cropColCrops)}
                {th('order', strings.cropColOrder)}
                <th>
                  {strings.cropColStatus.en} / {strings.cropColStatus.te}
                </th>
                <th>
                  {strings.memberActionsColumn.en} / {strings.memberActionsColumn.te}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((g) => {
                const parent = parentOf(g);
                return editingId === g.id ? (
                  <tr key={g.id}>
                    <td>
                      <input value={editEn} maxLength={80} onChange={(e) => setEditEn(e.target.value)} aria-label={biInline('cropGroupNameEn')} />
                      <input value={editTe} maxLength={120} onChange={(e) => setEditTe(e.target.value)} aria-label={biInline('cropGroupNameTe')} />
                    </td>
                    <td>{parent ? categoryName(parent) : ''}</td>
                    <td>{cropCount(g)}</td>
                    <td>
                      <input type="number" min={0} max={100000} value={editOrder} onChange={(e) => setEditOrder(e.target.value)} aria-label={biInline('cropColOrder')} />
                    </td>
                    <td />
                    <td>
                      <button type="button" onClick={() => handleSave(g)} disabled={busy || editEn.trim().length < 2 || !editTe.trim()}>
                        {busy ? <BiValue value={strings.saving} /> : <Bi id="saveChangesButton" />}
                      </button>{' '}
                      <button type="button" className="secondary" onClick={() => setEditingId(null)} disabled={busy}>
                        <Bi id="cancelButton" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={g.id}>
                    <td>
                      {parent ? '↳ ' : ''}
                      <strong>{g.nameEn}</strong>
                      <div className="meta">{g.nameTe}</div>
                    </td>
                    <td>{parent ? categoryName(parent) : ''}</td>
                    <td>{cropCount(g)}</td>
                    <td>{g.sortOrder}</td>
                    <td>{g.isActive ? biInline('activeStatusLabel') : biInline('inactiveStatusLabel')}</td>
                    <td>
                      <button type="button" className="secondary" onClick={() => startEdit(g)} disabled={busy}>
                        <Bi id="cropEditButton" />
                      </button>{' '}
                      <button type="button" className="secondary" onClick={() => handleToggle(g)} disabled={busy}>
                        {g.isActive ? <Bi id="switchOffButton" /> : <Bi id="switchOnButton" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <BiValue value={strings.cropGroupOtherNote} as="small" className="hint" />

      <h3>
        <Bi id="cropGroupAddHeading" />
      </h3>
      <label>
        <Bi id="cropGroupNameEn" />
        <input value={nameEn} maxLength={80} placeholder={biInline('cropGroupNameEn')} onChange={(e) => setNameEn(e.target.value)} />
      </label>
      <label>
        <Bi id="cropGroupNameTe" />
        <input value={nameTe} maxLength={120} placeholder={biInline('cropGroupNameTe')} onChange={(e) => setNameTe(e.target.value)} />
      </label>
      <label>
        <Bi id="cropParentField" />
        <select value={parentKey} onChange={(e) => setParentKey(e.target.value)}>
          <option value="">{biInline('cropTopLevelOption')}</option>
          {topLevel.map((t) => (
            <option key={t.key} value={t.key}>
              {categoryName(t)}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={handleAdd} disabled={busy || nameEn.trim().length < 2 || !nameTe.trim()}>
        {busy ? <BiValue value={strings.adding} /> : <Bi id="addButton" />}
      </button>
    </div>
  );
}

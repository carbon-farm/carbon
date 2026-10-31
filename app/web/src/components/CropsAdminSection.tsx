import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { createCrop, updateCrop, type Crop } from '../api/configuration';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { groupPath, leafGroups } from '../lib/crops';
import { useCropCategories } from '../lib/useCropCategories';

type SortKey = 'name' | 'te' | 'groups';

// The master crop list: every crop with its Telugu name and groups — sortable by column, filterable
// by search and by group — plus adding a crop and editing the Telugu name and groups of one.
// (The English name stays as it was first entered: parcels, tips and articles match crops by it.)
export function CropsAdminSection({ crops, onChange }: { crops: Crop[]; onChange: (next: Crop[]) => void }) {
  const { session } = useAuth();
  const { categories } = useCropCategories();
  const leaves = useMemo(() => leafGroups(categories), [categories]);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTe, setEditTe] = useState('');
  const [editGroups, setEditGroups] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [groups, setGroups] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupText = (c: Crop) => c.categories.map((k) => groupPath(k, categories)).join(', ');

  // the choices for the group filter: each main group (all its sub-groups), then every group on its own
  const filterOptions = useMemo(() => {
    const mains = categories.filter((c) => !c.parentKey && categories.some((x) => x.parentKey === c.key));
    return [
      ...mains.map((m) => ({ value: `all:${m.key}`, label: `${m.nameEn} / ${m.nameTe} — ${strings.allOption.en} / ${strings.allOption.te}` })),
      ...leaves.map((l) => ({ value: l.key, label: groupPath(l.key, categories) })),
    ];
  }, [categories, leaves]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const inGroup = (c: Crop) => {
      if (!group) return true;
      if (group === 'none') return !c.categories.some((k) => categories.some((g) => g.key === k && g.isActive));
      if (group.startsWith('all:')) {
        const kids = categories.filter((x) => x.parentKey === group.slice(4)).map((x) => x.key);
        return c.categories.some((k) => kids.includes(k));
      }
      return c.categories.includes(group);
    };
    const rows = crops.filter((c) => (!q || [c.name, c.nameTe ?? '', groupText(c)].some((v) => v.toLowerCase().includes(q))) && inGroup(c));
    const cmp = (a: Crop, b: Crop) => {
      if (sortKey === 'te') return (a.nameTe ?? '').localeCompare(b.nameTe ?? '');
      if (sortKey === 'groups') return groupText(a).localeCompare(groupText(b)) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    };
    return rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crops, categories, search, group, sortKey, sortDir]);

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
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    if (!session || !name.trim()) return;
    await guarded(async () => {
      const created = await createCrop(session.accessToken, { name: name.trim(), nameTe: nameTe.trim() || undefined, categories: groups });
      onChange([...crops, created]);
      setName('');
      setNameTe('');
      setGroups([]);
    });
  }

  async function handleSaveEdit(crop: Crop) {
    if (!session) return;
    await guarded(async () => {
      const saved = await updateCrop(session.accessToken, crop.id, { nameTe: editTe.trim(), categories: editGroups });
      onChange(crops.map((c) => (c.id === crop.id ? saved : c)));
      setEditingId(null);
    });
  }

  function startEdit(crop: Crop) {
    setEditingId(crop.id);
    setEditTe(crop.nameTe ?? '');
    setEditGroups(crop.categories);
    setError(null);
  }

  // Chip toggles for the groups a crop belongs to (only groups that can hold crops, plus any a crop
  // still holds that have been switched off since, so they can be removed).
  const picker = (value: string[], set: (next: string[]) => void) => (
    <div className="chip-row" role="group" aria-label={biInline('cropGroupsField')}>
      {[...leaves, ...categories.filter((c) => value.includes(c.key) && !leaves.some((l) => l.key === c.key))].map((l) => {
        const on = value.includes(l.key);
        return (
          <button key={l.key} type="button" className={on ? 'chip-on' : 'secondary'} aria-pressed={on} onClick={() => set(on ? value.filter((k) => k !== l.key) : [...value, l.key])}>
            {groupPath(l.key, categories)}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="card">
      <div className="top-bar">
        <Bi id="cropsHeading" as="h2" />
        <small className="hint">
          {strings.cropCountLine.en.replace('{n}', String(crops.length))} / {strings.cropCountLine.te.replace('{n}', String(crops.length))}
        </small>
      </div>
      {error && <div className="error-banner">{error}</div>}

      <div className="list-toolbar">
        <label>
          <Bi id="searchPlaceholder" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
        </label>
        <label>
          <Bi id="cropGroupsField" />
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">{biInline('cropAllGroups')}</option>
            <option value="none">{biInline('cropNoGroupFilter')}</option>
            {filterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div style={{ overflowX: 'auto', maxHeight: 460, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {th('name', strings.cropColName)}
                {th('te', strings.cropColTelugu)}
                {th('groups', strings.cropColGroups)}
                <th>
                  {strings.memberActionsColumn.en} / {strings.memberActionsColumn.te}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) =>
                editingId === c.id ? (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>
                      <input value={editTe} maxLength={120} onChange={(e) => setEditTe(e.target.value)} aria-label={biInline('cropNameTeField')} />
                    </td>
                    <td>{picker(editGroups, setEditGroups)}</td>
                    <td>
                      <button type="button" onClick={() => handleSaveEdit(c)} disabled={busy}>
                        {busy ? <BiValue value={strings.saving} /> : <Bi id="saveChangesButton" />}
                      </button>{' '}
                      <button type="button" className="secondary" onClick={() => setEditingId(null)} disabled={busy}>
                        <Bi id="cancelButton" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.nameTe ?? ''}</td>
                    <td>
                      {c.categories.map((k) => (
                        <div className="meta" key={k}>
                          {groupPath(k, categories)}
                        </div>
                      ))}
                    </td>
                    <td>
                      <button type="button" className="secondary" onClick={() => startEdit(c)} disabled={busy}>
                        <Bi id="cropEditButton" />
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
      <BiValue value={strings.cropEnglishNameLocked} as="small" className="hint" />

      <h3>
        <Bi id="cropAddHeading" />
      </h3>
      <label>
        <Bi id="itemNameField" />
        <input value={name} maxLength={80} placeholder={biInline('itemNameField')} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        <Bi id="cropNameTeField" />
        <input value={nameTe} maxLength={120} placeholder={biInline('cropNameTeField')} onChange={(e) => setNameTe(e.target.value)} />
      </label>
      <div>
        <Bi id="cropGroupsField" />
        <BiValue value={strings.cropGroupsHint} as="small" className="hint" />
        {picker(groups, setGroups)}
      </div>
      <button type="button" onClick={handleAdd} disabled={busy || name.trim().length < 2}>
        {busy ? <BiValue value={strings.adding} /> : <Bi id="addButton" />}
      </button>
    </div>
  );
}

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listCrops, type Crop } from '../api/configuration';
import { CropSelect } from '../components/CropSelect';
import {
  createSeasonalTip,
  currentMonthIst,
  deleteSeasonalTip,
  inSeason,
  listSeasonalTips,
  MONTHS,
  updateSeasonalTip,
  type SeasonalTip,
} from '../api/seasonal';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

type SortKey = 'title' | 'season' | 'crop' | 'status';
type SortDir = 'asc' | 'desc';

const seasonLabel = (t: SeasonalTip) =>
  t.startMonth === t.endMonth ? `${MONTHS[t.startMonth - 1].en} / ${MONTHS[t.startMonth - 1].te}` : `${MONTHS[t.startMonth - 1].en} → ${MONTHS[t.endMonth - 1].en} / ${MONTHS[t.startMonth - 1].te} → ${MONTHS[t.endMonth - 1].te}`;

// The tips members see on their Today panel, written by an Administrator or Moderator (ideally
// from what the experts know for the season): a short bilingual title and message, the months it
// applies to, and optionally one crop — then only members who grow that crop see it.
export function AdminSeasonalTipsPage() {
  const { session, logout } = useAuth();
  const [tips, setTips] = useState<SeasonalTip[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SeasonalTip | 'new' | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'on' | 'off'>('');
  const [seasonFilter, setSeasonFilter] = useState<'' | 'now'>('');
  const [cropFilter, setCropFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('season');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const now = currentMonthIst();

  async function load() {
    if (!session) return;
    try {
      const [t, c] = await Promise.all([listSeasonalTips(session.accessToken), listCrops(session.accessToken)]);
      setTips(t);
      setCrops(c);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) logout();
      else setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !editing) return;
    const d = new FormData(event.currentTarget);
    const body = {
      titleEn: String(d.get('titleEn') ?? ''),
      titleTe: String(d.get('titleTe') ?? ''),
      bodyEn: String(d.get('bodyEn') ?? ''),
      bodyTe: String(d.get('bodyTe') ?? ''),
      startMonth: Number(d.get('startMonth')),
      endMonth: Number(d.get('endMonth')),
      cropId: String(d.get('cropId') ?? '') || null,
    };
    setBusy(true);
    setError(null);
    try {
      if (editing === 'new') await createSeasonalTip(session.accessToken, { ...body, cropId: body.cropId ?? undefined });
      else await updateSeasonalTip(session.accessToken, editing.id, body);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(t: SeasonalTip) {
    if (!session) return;
    setBusy(true);
    try {
      await updateSeasonalTip(session.accessToken, t.id, { isActive: !t.isActive });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function remove(t: SeasonalTip) {
    if (!session || !window.confirm(`${strings.seasonalDeleteConfirm.en} / ${strings.seasonalDeleteConfirm.te}`)) return;
    setBusy(true);
    try {
      await deleteSeasonalTip(session.accessToken, t.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  function sortBy(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = tips.filter(
      (t) =>
        (!q || [t.titleEn, t.titleTe, t.bodyEn, t.bodyTe, t.crop?.name ?? ''].some((v) => v.toLowerCase().includes(q))) &&
        (!statusFilter || (statusFilter === 'on' ? t.isActive : !t.isActive)) &&
        (!seasonFilter || inSeason(now, t.startMonth, t.endMonth)) &&
        (!cropFilter || (cropFilter === 'none' ? !t.cropId : t.cropId === cropFilter)),
    );
    const cmp = (a: SeasonalTip, b: SeasonalTip) => {
      switch (sortKey) {
        case 'title':
          return a.titleEn.localeCompare(b.titleEn);
        case 'crop':
          return (a.crop?.name ?? '').localeCompare(b.crop?.name ?? '');
        case 'status':
          return Number(b.isActive) - Number(a.isActive);
        default:
          return a.startMonth - b.startMonth || a.endMonth - b.endMonth;
      }
    };
    return rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
  }, [tips, search, statusFilter, seasonFilter, cropFilter, sortKey, sortDir, now]);

  const arrow = (k: SortKey) => (k === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');
  const th = (k: SortKey, label: { en: string; te: string }) => (
    <th className="sortable" onClick={() => sortBy(k)}>
      {label.en} / {label.te}
      {arrow(k)}
    </th>
  );

  const monthOptions = MONTHS.map((m, i) => (
    <option key={m.en} value={i + 1}>
      {m.en} / {m.te}
    </option>
  ));

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="adminEyebrow" as="span" className="eyebrow" />
          <Bi id="seasonalTitle" as="h1" />
        </div>
        <button type="button" className={editing ? 'secondary' : ''} onClick={() => setEditing(editing ? null : 'new')}>
          {editing ? <Bi id="cancelButton" /> : <Bi id="seasonalAddButton" />}
        </button>
      </div>
      <BiValue value={strings.seasonalHint} as="p" className="hint" />
      {error && <div className="error-banner">{error}</div>}

      {editing && (
        <form className="card" onSubmit={handleSave} key={editing === 'new' ? 'new' : editing.id}>
          <div className="form-grid">
            <label>
              <Bi id="seasonalTitleEn" />
              <input name="titleEn" defaultValue={editing === 'new' ? '' : editing.titleEn} minLength={3} maxLength={120} required onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} />
            </label>
            <label>
              <Bi id="seasonalTitleTe" />
              <input name="titleTe" defaultValue={editing === 'new' ? '' : editing.titleTe} minLength={3} maxLength={160} required lang="te" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} />
            </label>
            <label className="span-2">
              <Bi id="seasonalBodyEn" />
              <textarea name="bodyEn" rows={3} defaultValue={editing === 'new' ? '' : editing.bodyEn} minLength={10} maxLength={1200} required onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} />
            </label>
            <label className="span-2">
              <Bi id="seasonalBodyTe" />
              <textarea name="bodyTe" rows={3} defaultValue={editing === 'new' ? '' : editing.bodyTe} minLength={10} maxLength={1600} required lang="te" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} />
            </label>
            <label>
              <Bi id="seasonalFrom" />
              <select name="startMonth" defaultValue={editing === 'new' ? now : editing.startMonth}>
                {monthOptions}
              </select>
            </label>
            <label>
              <Bi id="seasonalTo" />
              <select name="endMonth" defaultValue={editing === 'new' ? now : editing.endMonth}>
                {monthOptions}
              </select>
            </label>
            <label className="span-2">
              <Bi id="seasonalCrop" />
              <CropSelect crops={crops} name="cropId" defaultValue={editing === 'new' ? '' : editing.cropId ?? ''} emptyLabel={biInline('seasonalEveryone')} ariaLabel={biInline('seasonalCrop')} />
              <small className="hint">
                <Bi id="seasonalCropHint" />
              </small>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={busy}>
              <Bi id="seasonalSave" />
            </button>
          </div>
        </form>
      )}

      {!loading && tips.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          <label>
            <Bi id="seasonalFilterSeason" />
            <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value as '' | 'now')}>
              <option value="">{biInline('allOption')}</option>
              <option value="now">{biInline('seasonalInSeasonNow')}</option>
            </select>
          </label>
          <label>
            <Bi id="statusFilterLabel" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | 'on' | 'off')}>
              <option value="">{biInline('allOption')}</option>
              <option value="on">{biInline('activeStatusLabel')}</option>
              <option value="off">{biInline('inactiveStatusLabel')}</option>
            </select>
          </label>
          <label>
            <Bi id="seasonalCrop" />
            <CropSelect
              crops={crops}
              value={cropFilter}
              ariaLabel={biInline('seasonalCrop')}
              onChange={setCropFilter}
              emptyLabel={biInline('allOption')}
              extraOptions={[{ value: 'none', label: biInline('seasonalEveryone') }]}
            />
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.seasonalNone} as="p" className="hint" />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {th('title', strings.seasonalColTip)}
                {th('season', strings.seasonalColSeason)}
                {th('crop', strings.seasonalColCrop)}
                {th('status', strings.seasonalColStatus)}
                <th>
                  {strings.memberActionsColumn.en} / {strings.memberActionsColumn.te}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.titleEn}</strong>
                    <div className="meta">{t.titleTe}</div>
                  </td>
                  <td>
                    {seasonLabel(t)}
                    {inSeason(now, t.startMonth, t.endMonth) && (
                      <div>
                        <span className="priority-badge">
                          <Bi id="seasonalInSeasonNow" />
                        </span>
                      </div>
                    )}
                  </td>
                  <td>{t.crop?.name ?? `${strings.seasonalEveryone.en} / ${strings.seasonalEveryone.te}`}</td>
                  <td>{t.isActive ? `${strings.activeStatusLabel.en} / ${strings.activeStatusLabel.te}` : `${strings.inactiveStatusLabel.en} / ${strings.inactiveStatusLabel.te}`}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => setEditing(t)} disabled={busy}>
                      <Bi id="seasonalEdit" />
                    </button>{' '}
                    <button type="button" className="secondary" onClick={() => toggle(t)} disabled={busy}>
                      {t.isActive ? <Bi id="switchOffButton" /> : <Bi id="switchOnButton" />}
                    </button>{' '}
                    <button type="button" className="secondary" onClick={() => remove(t)} disabled={busy}>
                      <Bi id="seasonalDelete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

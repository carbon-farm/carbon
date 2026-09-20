import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { createPlan, listPlans, setMembershipRequired, updatePlan, getPublicSettings, type AdminPlan } from '../../api/hariharaa';
import { periodText, planTitle } from '../../membership/plans';
import { Bi, BiValue, biInline } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';

type SortKey = 'name' | 'priceInr' | 'periodDays' | 'paymentCount' | 'isActive' | 'sortOrder';
type SortDir = 'asc' | 'desc';

const QUICK_LENGTHS = [30, 90, 180, 365];

// What members can buy, and whether they need to. Any number of plans, each with its own price
// and length and each switched on or off (nothing is ever deleted — payments point at plans).
// A master switch turns the membership requirement off for everyone, e.g. while testing.
export function AdminMembershipPlansPage() {
  const { session, logout } = useAuth();
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [required, setRequired] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AdminPlan | 'new' | null>(null);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'on' | 'off'>('');
  const [sortKey, setSortKey] = useState<SortKey>('sortOrder');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  async function load() {
    if (!session) return;
    try {
      const [p, pub] = await Promise.all([listPlans(session.accessToken), getPublicSettings()]);
      setPlans(p);
      setRequired(pub.membershipRequired);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadPlans.en} / ${strings.couldNotLoadPlans.te}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSavePlan.en} / ${strings.couldNotSavePlan.te}`);
    } finally {
      setBusy(false);
    }
  }

  function handleSwitch(next: boolean) {
    if (!session) return;
    if (!next && !window.confirm(`${strings.membershipTurnOffConfirm.en}\n\n${strings.membershipTurnOffConfirm.te}`)) return;
    void run(() => setMembershipRequired(session.accessToken, next));
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !editing) return;
    const f = new FormData(event.currentTarget);
    const data = {
      name: String(f.get('name') ?? '').trim(),
      nameTe: String(f.get('nameTe') ?? '').trim(),
      description: String(f.get('description') ?? '').trim(),
      priceInr: Number(f.get('priceInr')),
      periodDays: Number(f.get('periodDays')),
      sortOrder: Number(f.get('sortOrder') || 0),
    };
    void run(() => (editing === 'new' ? createPlan(session.accessToken, { ...data, isActive: f.get('isActive') === 'on' }) : updatePlan(session.accessToken, editing.id, data)));
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = plans.filter(
      (p) =>
        (!statusFilter || (statusFilter === 'on') === p.isActive) &&
        (!q || [p.name, p.nameTe ?? '', p.description ?? ''].some((v) => v.toLowerCase().includes(q))),
    );
    const cmp = (a: AdminPlan, b: AdminPlan) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'isActive':
          return Number(a.isActive) - Number(b.isActive);
        default:
          return (a[sortKey] as number) - (b[sortKey] as number);
      }
    };
    return rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
  }, [plans, search, statusFilter, sortKey, sortDir]);

  const th = (key: SortKey, label: { en: string; te: string }) => (
    <th className="sortable" onClick={() => handleSort(key)}>
      {label.en} / {label.te}
      {key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );

  const activeCount = plans.filter((p) => p.isActive).length;

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="adminEyebrow" as="span" className="eyebrow" />
          <Bi id="plansAdminTitle" as="h1" />
        </div>
        {editing === null && (
          <button
            type="button"
            onClick={() => {
              setEditing('new');
              setDays(30);
            }}
          >
            <Bi id="addPlanButton" />
          </button>
        )}
      </div>
      <BiValue value={strings.plansAdminHint} as="p" className="hint" />

      {error && <div className="error-banner">{error}</div>}

      {required !== null && (
        <div className="card">
          <Bi id="membershipSwitchHeading" as="h2" />
          <p>
            <span className={`switch-pill ${required ? 'on' : 'off'}`}>
              {required ? `${strings.planOn.en} / ${strings.planOn.te}` : `${strings.planOff.en} / ${strings.planOff.te}`}
            </span>{' '}
            <BiValue value={required ? strings.membershipSwitchOn : strings.membershipSwitchOff} />
          </p>
          <div className="form-actions">
            {required ? (
              <button type="button" className="secondary" onClick={() => handleSwitch(false)} disabled={busy}>
                <Bi id="membershipTurnOffButton" />
              </button>
            ) : (
              <button type="button" onClick={() => handleSwitch(true)} disabled={busy || activeCount === 0}>
                <Bi id="membershipTurnOnButton" />
              </button>
            )}
          </div>
        </div>
      )}

      {editing !== null && (
        <div className="card">
          <Bi id={editing === 'new' ? 'addPlanButton' : 'editPlanHeading'} as="h2" />
          <form onSubmit={handleSave} key={editing === 'new' ? 'new' : editing.id}>
            <div className="form-grid">
              <label>
                <Bi id="planNameField" />
                <input name="name" required minLength={2} maxLength={60} defaultValue={editing === 'new' ? '' : editing.name} />
              </label>
              <label>
                <Bi id="planNameTeField" />
                <input name="nameTe" maxLength={60} defaultValue={editing === 'new' ? '' : editing.nameTe ?? ''} />
              </label>
              <label>
                <Bi id="planPriceField" />
                <input name="priceInr" type="number" step="0.01" min="1" max="100000" required defaultValue={editing === 'new' ? '' : editing.priceInr} />
              </label>
              <label>
                <Bi id="planDaysField" />
                <input
                  name="periodDays"
                  type="number"
                  step="1"
                  min="1"
                  max="3660"
                  required
                  value={editing === 'new' ? days : undefined}
                  defaultValue={editing === 'new' ? undefined : editing.periodDays}
                  onChange={(e) => editing === 'new' && setDays(Number(e.target.value))}
                />
              </label>
              <label className="span-2">
                <Bi id="planDescriptionField" />
                <input name="description" maxLength={200} defaultValue={editing === 'new' ? '' : editing.description ?? ''} />
              </label>
              <label>
                <Bi id="planOrderField" />
                <input name="sortOrder" type="number" step="1" defaultValue={editing === 'new' ? plans.length + 1 : editing.sortOrder} />
              </label>
            </div>
            {editing === 'new' && (
              <>
                <div className="form-actions" aria-label={strings.planQuickLengths.en}>
                  {QUICK_LENGTHS.map((d) => (
                    <button type="button" key={d} className={days === d ? '' : 'secondary'} onClick={() => setDays(d)}>
                      {periodText(d)}
                    </button>
                  ))}
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" name="isActive" defaultChecked />
                  <Bi id="planSwitchedOnField" />
                </label>
              </>
            )}
            <BiValue value={strings.planPriceNote} as="p" className="hint" />
            <div className="form-actions">
              <button type="submit" disabled={busy}>
                {busy ? <BiValue value={strings.saving} /> : <Bi id="addrSaveButton" />}
              </button>
              <button type="button" className="secondary" onClick={() => setEditing(null)}>
                <Bi id="cancelButton" />
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && plans.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          <label>
            <Bi id="statusFilterLabel" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | 'on' | 'off')}>
              <option value="">{biInline('allOption')}</option>
              <option value="on">{strings.planOn.en} / {strings.planOn.te}</option>
              <option value="off">{strings.planOff.en} / {strings.planOff.te}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : plans.length === 0 ? (
        <BiValue value={strings.noPlansYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {th('name', strings.planColumn)}
                {th('priceInr', strings.planPriceColumn)}
                {th('periodDays', strings.planLengthColumn)}
                {th('paymentCount', strings.planPaymentsColumn)}
                {th('isActive', strings.statusFilterLabel)}
                {th('sortOrder', strings.planOrderColumn)}
                <th>
                  {strings.memberActionsColumn.en} / {strings.memberActionsColumn.te}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className={p.isActive ? '' : 'is-off'}>
                  <td>
                    <strong>{planTitle(p)}</strong>
                    {p.description && <div className="meta">{p.description}</div>}
                  </td>
                  <td>₹{p.priceInr.toFixed(2)}</td>
                  <td>{periodText(p.periodDays)}</td>
                  <td>{p.paymentCount}</td>
                  <td>
                    <span className={`switch-pill ${p.isActive ? 'on' : 'off'}`}>
                      {p.isActive ? `${strings.planOn.en} / ${strings.planOn.te}` : `${strings.planOff.en} / ${strings.planOff.te}`}
                    </span>
                  </td>
                  <td>{p.sortOrder}</td>
                  <td>
                    <div className="form-actions">
                      <button type="button" className="secondary" onClick={() => setEditing(p)} disabled={busy}>
                        <Bi id="addrEditButton" />
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => session && run(() => updatePlan(session.accessToken, p.id, { isActive: !p.isActive }))}
                        disabled={busy}
                      >
                        <Bi id={p.isActive ? 'planSwitchOff' : 'planSwitchOn'} />
                      </button>
                    </div>
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

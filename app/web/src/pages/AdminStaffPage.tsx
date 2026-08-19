import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listUsers, createStaffUser, type AdminUser } from '../api/admin';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

const ROLES = [
  { value: 'MODERATOR', key: 'roleModerator' as const },
  { value: 'EXPERT', key: 'roleExpert' as const },
  { value: 'VENDOR', key: 'roleVendor' as const },
  { value: 'SUPPORT_AGENT', key: 'roleSupportAgent' as const },
  { value: 'ADMINISTRATOR', key: 'roleAdministrator' as const },
];

const ROLE_KEYS: Record<string, StringKey> = {
  FARMER: 'roleFarmer',
  MODERATOR: 'roleModerator',
  EXPERT: 'roleExpert',
  VENDOR: 'roleVendor',
  SUPPORT_AGENT: 'roleSupportAgent',
  ADMINISTRATOR: 'roleAdministrator',
};

type SortMode = 'newest' | 'name';

export function AdminStaffPage() {
  const { session, logout } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    if (!session) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function load() {
    if (!session) return;
    setLoading(true);
    listUsers(session.accessToken)
      .then(setUsers)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadUsers.en} / ${strings.couldNotLoadUsers.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleCreate() {
    const form = formRef.current;
    if (!session || !form || !form.reportValidity()) return;
    setCreating(true);
    setError(null);
    const data = new FormData(form);
    try {
      await createStaffUser(session.accessToken, {
        mobileNumber: String(data.get('mobileNumber') ?? ''),
        temporaryPassword: String(data.get('temporaryPassword') ?? ''),
        name: String(data.get('name') ?? ''),
        role: String(data.get('role') ?? ''),
      });
      form.reset();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotCreateStaff.en} / ${strings.couldNotCreateStaff.te}`);
    } finally {
      setCreating(false);
    }
  }

  const roles = useMemo(() => Array.from(new Set(users.map((u) => u.role))), [users]);

  const visible = useMemo(() => {
    let rows = users;
    if (roleFilter) rows = rows.filter((u) => u.role === roleFilter);
    if (activeFilter) rows = rows.filter((u) => (activeFilter === 'active' ? u.isActive : !u.isActive));
    rows = [...rows];
    if (sortMode === 'name') {
      rows.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return rows;
  }, [users, roleFilter, activeFilter, sortMode]);

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="staffPageTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <Bi id="createStaffHeading" as="h2" />
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <label>
            <Bi id="nameLabel" />
            <input name="name" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
          </label>
          <label>
            <Bi id="mobileNumberLabel" />
            <input
              name="mobileNumber"
              type="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              onChange={clearCustomValidity}
              onInvalid={bilingualInvalidHandler}
              required
            />
          </label>
          <label>
            <Bi id="temporaryPasswordField" />
            <input
              name="temporaryPassword"
              type="password"
              minLength={8}
              onChange={clearCustomValidity}
              onInvalid={bilingualInvalidHandler}
              required
            />
          </label>
          <label>
            <Bi id="roleFieldLabel" />
            <select name="role" required defaultValue="" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler}>
              <option value="" disabled>
                {biInline('selectPlaceholder')}
              </option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {strings[r.key].en} / {strings[r.key].te}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={handleCreate} disabled={creating}>
            {creating ? <BiValue value={strings.creatingStaff} /> : <Bi id="createStaffButton" />}
          </button>
        </form>
      </div>

      <div className="card">
        <Bi id="existingStaffHeading" as="h2" />

        {!loading && users.length > 0 && (
          <div className="list-toolbar">
            <label>
              <Bi id="roleFieldLabel" />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">{biInline('allOption')}</option>
                {roles.map((r) => {
                  const key = ROLE_KEYS[r];
                  const label = key ? strings[key] : { en: r, te: r };
                  return (
                    <option key={r} value={r}>
                      {label.en} / {label.te}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              <Bi id="accountStatusFilterLabel" />
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                <option value="">{biInline('allOption')}</option>
                <option value="active">{biInline('statusActiveOption')}</option>
                <option value="inactive">{biInline('statusInactiveOption')}</option>
              </select>
            </label>
            <label>
              <Bi id="sortByLabel" />
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
                <option value="newest">{biInline('sortNewestFirst')}</option>
                <option value="name">{biInline('sortNameAZ')}</option>
              </select>
            </label>
          </div>
        )}

        {loading ? (
          <BiValue value={strings.loading} as="p" className="hint" />
        ) : users.length === 0 ? (
          <BiValue value={strings.noStaffYet} as="p" className="hint" />
        ) : visible.length === 0 ? (
          <BiValue value={strings.reportNoData} as="p" className="hint" />
        ) : (
          visible.map((u) => (
            <div className="farm-item" key={u.id}>
              <div className="label">
                {u.name} {!u.isActive && <BiValue value={strings.inactiveBadge} as="span" className="priority-badge" />}
              </div>
              <div className="meta">
                {u.mobileNumber} · {u.role}
              </div>
            </div>
          ))
        )}
      </div>

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

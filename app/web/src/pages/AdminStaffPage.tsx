import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listUsers, createStaffUser, type AdminUser } from '../api/admin';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

const ROLES = [
  { value: 'MODERATOR', key: 'roleModerator' as const },
  { value: 'EXPERT', key: 'roleExpert' as const },
  { value: 'VENDOR', key: 'roleVendor' as const },
  { value: 'SUPPORT_AGENT', key: 'roleSupportAgent' as const },
  { value: 'ADMINISTRATOR', key: 'roleAdministrator' as const },
];

export function AdminStaffPage() {
  const { session, logout } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
        {loading ? (
          <BiValue value={strings.loading} as="p" className="hint" />
        ) : users.length === 0 ? (
          <BiValue value={strings.noStaffYet} as="p" className="hint" />
        ) : (
          users.map((u) => (
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

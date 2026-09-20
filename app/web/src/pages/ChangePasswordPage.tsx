import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { changeMyPassword, getMe, type AdminUser } from '../api/admin';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { PasswordInput } from '../components/PasswordInput';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

// Open to every role. Changing the password revokes all refresh tokens on
// the server, so the user is logged out afterwards and signs in with the new one.
export function ChangePasswordPage() {
  const { session, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [me, setMe] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!session) return;
    getMe(session.accessToken).then(setMe).catch(() => {});
  }, [session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await changeMyPassword(session.accessToken, String(data.get('currentPassword') ?? ''), String(data.get('newPassword') ?? ''));
      setDone(true);
      setTimeout(logout, 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotChangePassword.en} / ${strings.couldNotChangePassword.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div>
        <Bi id="accountNavTitle" as="span" className="eyebrow" />
        <Bi id="changePasswordTitle" as="h1" />
      </div>

      {me && (
        <div className="card">
          {me.userCode && (
            <div>
              <div className="field-label">
                <Bi id="accountIdLabel" />
              </div>
              <div>
                <strong>{me.userCode}</strong>
              </div>
            </div>
          )}
          <div className="field-label">
            <Bi id="nameLabel" />
          </div>
          <div>{me.name}</div>
          <div className="field-label">
            <Bi id="mobileNumberLabel" />
          </div>
          <div>{me.mobileNumber}</div>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {done ? (
        <BiValue value={strings.passwordChangedNotice} as="p" className="hint" />
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <label>
            <Bi id="currentPasswordField" />
            <PasswordInput name="currentPassword" autoComplete="current-password" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
          </label>
          <label>
            <Bi id="newPasswordField" />
            <PasswordInput name="newPassword" autoComplete="new-password" minLength={8} onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler} required />
          </label>
          <button type="submit" disabled={busy}>
            <Bi id="changePasswordButton" />
          </button>
        </form>
      )}
    </>
  );
}

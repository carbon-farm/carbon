import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { updatePostalAddress } from '../api/admin';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// A member's full postal address, kept on their profile (optional). Only they and the account
// store Administrators see it; Aadhaar is deliberately not collected.
export function PostalAddressCard({ initial }: { initial: string }) {
  const { session } = useAuth();
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updatePostalAddress(session.accessToken, value);
      setValue(updated.postalAddress ?? '');
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={save}>
      <Bi id="postalAddressTitle" as="h2" />
      <label>
        <Bi id="postalAddressField" />
        <textarea
          name="postalAddress"
          rows={3}
          maxLength={500}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder={biInline('postalAddressField')}
          autoComplete="street-address"
        />
      </label>
      <BiValue value={strings.postalAddressHint} as="p" className="hint" />
      <button type="submit" disabled={busy}>
        {busy ? <BiValue value={strings.saving} /> : <Bi id="postalAddressSave" />}
      </button>
      {saved && <div className="success-banner">{strings.settingsSavedNotice.en} / {strings.settingsSavedNotice.te}</div>}
      {error && <div className="error-banner">{error}</div>}
    </form>
  );
}

import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { updatePreferences } from '../api/admin';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// A member's own choice to also receive their order, payment and membership notices on WhatsApp
// (on the mobile number they signed up with). Off unless they tick it; shown only when the store
// has WhatsApp switched on.
export function WhatsAppOptIn({ initial, mobileNumber }: { initial: boolean; mobileNumber: string }) {
  const { session } = useAuth();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(value: boolean) {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await updatePreferences(session.accessToken, value);
      setOn(!!updated.whatsappOptIn);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <Bi id="whatsappOptInTitle" as="h2" />
      <label className="checkbox-label">
        <input type="checkbox" checked={on} disabled={busy} onChange={(e) => change(e.target.checked)} />
        <span>
          <Bi id="whatsappOptInLabel" />
          <small className="hint">{mobileNumber}</small>
        </span>
      </label>
      <BiValue value={strings.whatsappOptInHint} as="p" className="hint" />
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}

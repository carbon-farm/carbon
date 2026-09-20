import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { getAdminSettings, updateSettings, type AdminSettings } from '../../api/hariharaa';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../../i18n/validation';

export function AdminHariharaaSettingsPage() {
  const { session, logout } = useAuth();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getAdminSettings(session.accessToken)
      .then(setSettings)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadHariharaaSettings.en} / ${strings.couldNotLoadHariharaaSettings.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const subscriptionPriceInr = Number(formData.get('subscriptionPriceInr') ?? 0);
    const payeeName = String(formData.get('payeeName') ?? '').trim();
    const primaryUpiId = String(formData.get('primaryUpiId') ?? '').trim();
    const secondaryUpiId = String(formData.get('secondaryUpiId') ?? '').trim();
    const vendorProfileId = String(formData.get('vendorProfileId') ?? '').trim();
    const upiAid = String(formData.get('upiAid') ?? '').trim();

    setSaving(true);
    setError(null);
    try {
      const updated = await updateSettings(session.accessToken, {
        subscriptionPriceInr,
        primaryUpiId,
        ...(payeeName ? { payeeName } : {}),
        ...(secondaryUpiId ? { secondaryUpiId } : {}),
        ...(vendorProfileId ? { vendorProfileId } : {}),
        ...(upiAid ? { upiAid } : {}),
      });
      setSettings(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSaveHariharaaSettings.en} / ${strings.couldNotSaveHariharaaSettings.te}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="hariharaaSettingsAdminTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <label>
            <Bi id="hariharaaPriceField" />
            <input
              name="subscriptionPriceInr"
              type="number"
              step="0.01"
              min="1"
              defaultValue={settings?.subscriptionPriceInr ?? ''}
              onInvalid={bilingualInvalidHandler}
              onChange={clearCustomValidity}
              required
            />
          </label>
          <label>
            <Bi id="hariharaaPayeeNameField" />
            <input name="payeeName" defaultValue={settings?.payeeName ?? ''} />
          </label>
          <label>
            <Bi id="hariharaaPrimaryUpiField" />
            <input
              name="primaryUpiId"
              defaultValue={settings?.primaryUpiId ?? ''}
              minLength={3}
              onInvalid={bilingualInvalidHandler}
              onChange={clearCustomValidity}
              required
            />
          </label>
          <label>
            <Bi id="hariharaaSecondaryUpiField" />
            <input name="secondaryUpiId" defaultValue={settings?.secondaryUpiId ?? ''} />
          </label>
          <label>
            <Bi id="hariharaaUpiAidField" />
            <div className="hint">
              <Bi id="hariharaaUpiAidHint" />
            </div>
            <input name="upiAid" defaultValue={settings?.upiAid ?? ''} />
          </label>
          <label>
            <Bi id="hariharaaVendorIdField" />
            <div className="hint">
              <Bi id="hariharaaVendorIdHint" />
            </div>
            <input name="vendorProfileId" defaultValue={settings?.vendorProfileId ?? ''} />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? <BiValue value={strings.saving} /> : <Bi id="hariharaaSaveSettingsButton" />}
          </button>
        </form>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

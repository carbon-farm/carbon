import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { getAdminSettings, updateSettings, type AdminSettings } from '../../api/hariharaa';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../../i18n/validation';

// Same rule the server enforces: name@bank.
const UPI_PATTERN = '[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z0-9]{2,64}';

// Where payments go: the UPI ID customers pay to (and a spare kept on file), the merchant id that
// goes with it, and who the payee is. Prices are not here any more — they live on the
// Membership plans page.
export function AdminHariharaaSettingsPage() {
  const { session, logout } = useAuth();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // the two UPI boxes are controlled so "Swap" can exchange them
  const [primary, setPrimary] = useState('');
  const [spare, setSpare] = useState('');

  useEffect(() => {
    if (!session) return;
    getAdminSettings(session.accessToken)
      .then((s) => {
        setSettings(s);
        setPrimary(s?.primaryUpiId ?? '');
        setSpare(s?.secondaryUpiId ?? '');
      })
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
    const formData = new FormData(event.currentTarget);
    const payeeName = String(formData.get('payeeName') ?? '').trim();
    const upiAid = String(formData.get('upiAid') ?? '').trim();
    const vendorProfileId = String(formData.get('vendorProfileId') ?? '').trim();
    const newPrimary = primary.trim();

    // Changing where the money goes deserves a second look.
    if (settings && newPrimary !== settings.primaryUpiId) {
      const ok = window.confirm(
        `${strings.upiChangeConfirm.en.replace('{from}', settings.primaryUpiId).replace('{to}', newPrimary)}\n\n${strings.upiChangeConfirm.te.replace('{from}', settings.primaryUpiId).replace('{to}', newPrimary)}`,
      );
      if (!ok) return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updateSettings(session.accessToken, {
        primaryUpiId: newPrimary,
        secondaryUpiId: spare.trim(), // empty removes it
        upiAid, // empty removes it
        vendorProfileId, // empty removes it
        ...(payeeName ? { payeeName } : {}),
      });
      setSettings(updated);
      setPrimary(updated.primaryUpiId);
      setSpare(updated.secondaryUpiId ?? '');
      setSaved(true);
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
      {saved && <div className="success-banner">{strings.settingsSavedNotice.en} / {strings.settingsSavedNotice.te}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <Bi id="settingsPaymentsHeading" as="h2" />
          <BiValue value={strings.settingsPaymentsHint} as="p" className="hint" />
          {settings && (
            <p>
              <Bi id="settingsPayingToLabel" /> <strong>{settings.primaryUpiId}</strong>
            </p>
          )}
          <div className="form-grid">
            <label>
              <Bi id="hariharaaPrimaryUpiField" />
              <input
                name="primaryUpiId"
                value={primary}
                onChange={(e) => {
                  setPrimary(e.target.value);
                  clearCustomValidity(e);
                }}
                pattern={UPI_PATTERN}
                placeholder="name@bank"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onInvalid={bilingualInvalidHandler}
                required
              />
            </label>
            <label>
              <Bi id="hariharaaSecondaryUpiField" />
              <input
                name="secondaryUpiId"
                value={spare}
                onChange={(e) => {
                  setSpare(e.target.value);
                  clearCustomValidity(e);
                }}
                pattern={UPI_PATTERN}
                placeholder="name@bank"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onInvalid={bilingualInvalidHandler}
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="secondary"
              disabled={!spare.trim()}
              onClick={() => {
                setPrimary(spare);
                setSpare(primary);
              }}
            >
              <Bi id="upiSwapButton" />
            </button>
          </div>
          <BiValue value={strings.upiFormatHint} as="p" className="hint" />

          <label>
            <Bi id="hariharaaUpiAidField" />
            <div className="hint">
              <Bi id="hariharaaUpiAidHint" />
            </div>
            <input name="upiAid" defaultValue={settings?.upiAid ?? ''} />
          </label>
          <BiValue value={strings.upiAidWarning} as="p" className="hint" />
          <label>
            <Bi id="hariharaaPayeeNameField" />
            <input name="payeeName" defaultValue={settings?.payeeName ?? ''} />
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
          <p className="hint">
            <BiValue value={strings.settingsPricesMovedNotice} />{' '}
            <Link to="/admin/membership-plans" className="link-button">
              <Bi id="plansAdminNavTitle" />
            </Link>
          </p>
        </form>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { getPublicSettings, type PublicSettings } from '../../api/hariharaa';
import { ApiError } from '../../api/client';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';

// The one place the payment QR is rendered — used on the public landing page and
// on the logged-in subscription page, so a customer can pay from wherever they
// are. The link itself is built by the backend (see upi-link.ts), never here.
export function UpiPaymentCard() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicSettings()
      .then(setSettings)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : `${strings.hariharaaSettingsUnavailable.en} / ${strings.hariharaaSettingsUnavailable.te}`);
      });
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!settings) return <BiValue value={strings.loading} as="p" className="hint" />;

  return (
    <div>
      <div className="field-label">
        <Bi id="hariharaaPriceLabel" />
      </div>
      <div>₹{settings.subscriptionPriceInr.toFixed(2)}</div>

      <div style={{ background: '#fff', padding: 16, width: 'fit-content', margin: '16px 0' }}>
        {/* level="Q" (~25% damage tolerance) — usually scanned off a phone or
            laptop screen rather than paper, where the library's default "L" is thin. */}
        <QRCode value={settings.upiLink} size={200} level="Q" />
      </div>
      <BiValue value={strings.hariharaaScanToPayHint} as="p" className="hint" />
      <BiValue value={strings.hariharaaPayThenSubmitHint} as="p" className="hint" />
    </div>
  );
}

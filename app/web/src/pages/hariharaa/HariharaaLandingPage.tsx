import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { getPublicSettings, type PublicSettings } from '../../api/hariharaa';
import { ApiError } from '../../api/client';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';
import { TESTIMONIALS } from './testimonials';

// Public, unauthenticated — mirrors LandingPage.tsx's bare rendering (no
// AppShell, no ProtectedRoute). Deliberately shows nothing about the
// business beyond testimonials and how to subscribe, per the product
// owner's own instruction: "nothing else till they pay and subscribe."
export function HariharaaLandingPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicSettings()
      .then(setSettings)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : `${strings.hariharaaSettingsUnavailable.en} / ${strings.hariharaaSettingsUnavailable.te}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const upiLink = settings
    ? `upi://pay?pa=${encodeURIComponent(settings.primaryUpiId)}&pn=${encodeURIComponent(settings.payeeName)}&am=${settings.subscriptionPriceInr}&cu=INR&tn=${encodeURIComponent('HARIHARAA subscription')}`
    : null;

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-mark" aria-hidden="true">🥗</div>
          <h1 className="bi-en">HARIHARAA Natural Food Stores</h1>
          <h1 className="bi-te">HARIHARAA నేచురల్ ఫుడ్ స్టోర్స్</h1>
          <BiValue value={strings.hariharaaBrandTagline} as="p" className="hero-tagline" />
        </div>
      </section>

      <div className="landing-body">
        <div className="card">
          <Bi id="hariharaaTestimonialsHeading" as="h2" />
          <div className="feature-grid">
            {TESTIMONIALS.map((t) => (
              <div className="feature-card" key={t.youtubeId}>
                <Bi id={t.titleKey} as="h3" />
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${t.youtubeId}`}
                  title={t.youtubeId}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <Bi id="hariharaaSubscribeHeading" as="h2" />
          <BiValue value={strings.hariharaaSubscribeDescription} as="p" className="hint" />

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <BiValue value={strings.loading} as="p" className="hint" />
          ) : settings && upiLink ? (
            <>
              <div className="field-label">
                <Bi id="hariharaaPriceLabel" />
              </div>
              <div>₹{settings.subscriptionPriceInr.toFixed(2)}</div>

              <div style={{ background: '#fff', padding: 16, width: 'fit-content', margin: '16px 0' }}>
                <QRCode value={upiLink} size={200} />
              </div>
              <BiValue value={strings.hariharaaScanToPayHint} as="p" className="hint" />

              <Link to="/hariharaa/register">
                <button type="button">
                  <Bi id="hariharaaRegisterCta" />
                </button>
              </Link>
            </>
          ) : null}

          <p className="hint">
            <BiValue value={strings.alreadyRegistered} />{' '}
            <Link to="/login" className="link-button">
              <Bi id="loginLink" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

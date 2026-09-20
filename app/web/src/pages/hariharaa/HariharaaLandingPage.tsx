import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSettings, type PublicSettings } from '../../api/hariharaa';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';
import { TestimonialsGrid } from './TestimonialsGrid';

// Public, unauthenticated — mirrors LandingPage.tsx's bare rendering (no AppShell, no
// ProtectedRoute). Shows only the testimonials and how to join, per the product owner's
// instruction: "nothing else till they pay and subscribe". There is deliberately NO
// payment QR here: only a registered customer can pay, so every payment is tied to an
// account (see UpiPaymentCard, shown on the logged-in Pay page).
export function HariharaaLandingPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    getPublicSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

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
        <TestimonialsGrid />

        <div className="card">
          <Bi id="hariharaaSubscribeHeading" as="h2" />
          <BiValue value={strings.hariharaaSubscribeDescription} as="p" className="hint" />

          {settings && (
            <p>
              ₹{settings.subscriptionPriceInr.toFixed(2)} <Bi id="hariharaaMonthlyPrice" />
            </p>
          )}

          <Link to="/hariharaa/register">
            <button type="button">
              <Bi id="hariharaaRegisterCta" />
            </button>
          </Link>

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

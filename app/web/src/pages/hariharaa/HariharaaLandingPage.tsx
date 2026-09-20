import { Link } from 'react-router-dom';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';
import { TESTIMONIALS } from './testimonials';
import { UpiPaymentCard } from './UpiPaymentCard';

// Public, unauthenticated — mirrors LandingPage.tsx's bare rendering (no
// AppShell, no ProtectedRoute). Deliberately shows nothing about the
// business beyond testimonials and how to subscribe, per the product
// owner's own instruction: "nothing else till they pay and subscribe."
export function HariharaaLandingPage() {
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

          <UpiPaymentCard />

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

import { Link } from 'react-router-dom';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

export function LandingPage() {
  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-mark" aria-hidden="true">🌱</div>
          <Bi id="brand" as="h1" />
          <BiValue value={strings.landingTagline} as="p" className="hero-tagline" />
          <div className="hero-actions">
            <Link to="/login">
              <button type="button">
                <Bi id="loginButton" />
              </button>
            </Link>
            <Link to="/register">
              <button type="button" className="secondary">
                <Bi id="createAccountLink" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div className="landing-body">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">🩺</div>
            <Bi id="landingFeature1Title" as="h2" />
            <BiValue value={strings.landingFeature1Desc} as="p" />
          </div>
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">📚</div>
            <Bi id="landingFeature2Title" as="h2" />
            <BiValue value={strings.landingFeature2Desc} as="p" />
          </div>
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">📍</div>
            <Bi id="landingFeature3Title" as="h2" />
            <BiValue value={strings.landingFeature3Desc} as="p" />
          </div>
        </div>
      </div>

      <div className="landing-footer">
        <BiValue value={strings.landingFooterNote} />
      </div>
    </div>
  );
}

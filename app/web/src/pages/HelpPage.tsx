import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { audienceFor } from '../tour/steps';
import { roleHomePath } from '../auth/roleHome';
import { startTour } from '../tour/Tour';
import { sectionsFor } from '../help/content';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// Plain-language help for whoever is looking at it — a visitor, a member, or a staff role — in
// English then Telugu, with a search box and a button to replay the guided tour.
export function HelpPage() {
  const { session } = useAuth();
  const audience = audienceFor(session?.role);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // The tour points at things on the home screen, so replay it from there.
  function replay() {
    navigate(session ? roleHomePath(session.role) : '/marketplace');
    setTimeout(startTour, 1200);
  }

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sectionsFor(audience).filter(
      (s) =>
        !q ||
        [s.title.en, s.title.te, ...s.body.flatMap((b) => [b.en, b.te])].some((t) => t.toLowerCase().includes(q)),
    );
  }, [audience, search]);

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="helpNavTitle" as="span" className="eyebrow" />
          <Bi id="helpPageTitle" as="h1" />
        </div>
        <button type="button" onClick={replay}>
          <Bi id="tourReplayButton" />
        </button>
      </div>
      <BiValue value={strings.helpIntro} as="p" className="hint" />

      <div className="list-toolbar">
        <label>
          <Bi id="searchPlaceholder" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
        </label>
      </div>

      {sections.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="help-grid">
          {sections.map((s) => (
            <section className="card help-section" key={s.id} id={s.id}>
              <h2>
                <span className="bi-en">{s.title.en}</span>
                <span className="bi-te">{s.title.te}</span>
              </h2>
              {s.body.map((p, i) => (
                <p key={i}>
                  <span className="bi-en">{p.en}</span>
                  <span className="bi-te">{p.te}</span>
                </p>
              ))}
            </section>
          ))}
        </div>
      )}
    </>
  );
}

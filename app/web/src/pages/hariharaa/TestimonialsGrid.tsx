import { Bi } from '../../i18n/Bi';
import { TESTIMONIALS } from './testimonials';

// The only content an unpaid visitor or customer is allowed to see — shared by the
// public landing page and the logged-in Pay page.
export function TestimonialsGrid() {
  return (
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
  );
}

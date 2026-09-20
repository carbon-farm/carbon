import { Link } from 'react-router-dom';
import { Bi } from '../../i18n/Bi';
import { TESTIMONIALS } from './testimonials';

const PREVIEW_COUNT = 3;

// A small taste of the customer testimonials for the log-in page: a few video thumbnails
// (plain pictures — no video is loaded until the full page is opened) that all lead to the
// real testimonials page at /hariharaa.
export function TestimonialsPreview() {
  return (
    <section className="card testimonials-preview">
      <Bi id="hariharaaTestimonialsHeading" as="h2" />
      <div className="preview-grid">
        {TESTIMONIALS.slice(0, PREVIEW_COUNT).map((t) => (
          <Link to="/hariharaa" className="preview-tile" key={t.youtubeId}>
            <span className="preview-thumb">
              <img
                src={`https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'; // keep the play button on its plain tile
                }}
              />
              <span className="preview-play" aria-hidden="true">
                ▶
              </span>
            </span>
            <Bi id={t.titleKey} as="span" className="preview-title" />
          </Link>
        ))}
      </div>
      <Link to="/hariharaa">
        <button type="button" className="secondary">
          <Bi id="testimonialsSeeAllButton" />
        </button>
      </Link>
    </section>
  );
}

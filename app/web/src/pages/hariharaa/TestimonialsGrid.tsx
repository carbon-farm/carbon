import { useState } from 'react';
import { Bi, biInline } from '../../i18n/Bi';
import { TESTIMONIALS } from './testimonials';

// The only content an unpaid visitor or customer is allowed to see — shared by the
// public landing page and the logged-in Pay page.
//
// Each video shows as a picture with a play button. Only the one that was tapped is loaded, so
// two can never play at the same time: tapping another video replaces the first.
export function TestimonialsGrid() {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <div className="card">
      <Bi id="hariharaaTestimonialsHeading" as="h2" />
      <div className="feature-grid">
        {TESTIMONIALS.map((t) => (
          <div className="feature-card" key={t.youtubeId}>
            <Bi id={t.titleKey} as="h3" />
            {playing === t.youtubeId ? (
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${t.youtubeId}?autoplay=1&rel=0`}
                title={biInline(t.titleKey)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button type="button" className="video-tile" onClick={() => setPlaying(t.youtubeId)} aria-label={`${biInline('testimonialPlay')}: ${biInline(t.titleKey)}`}>
                <img src={`https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <span className="preview-play" aria-hidden="true">
                  ▶
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import type { StringKey } from '../../i18n/strings';

export interface Testimonial {
  titleKey: StringKey;
  youtubeId: string;
}

// Fixed set supplied directly by the business owner — not expected to
// change often, so no admin-editable backend for this (unlike price/UPI IDs,
// which genuinely do need to change without a deploy).
export const TESTIMONIALS: Testimonial[] = [
  { titleKey: 'hariharaaTestimonial1', youtubeId: 'qbFP50cl8IA' },
  { titleKey: 'hariharaaTestimonial2', youtubeId: 'xZv2Zud9z1Q' },
  { titleKey: 'hariharaaTestimonial3', youtubeId: 'CpKteszboW4' },
  { titleKey: 'hariharaaTestimonial4', youtubeId: 'N9p-GY821i4' },
  { titleKey: 'hariharaaTestimonial5', youtubeId: 'jtr50FPxmXA' },
  { titleKey: 'hariharaaTestimonial6', youtubeId: 'uWvwRHwHiiA' },
];

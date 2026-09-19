import { kindFromUrl } from './media.service';

describe('kindFromUrl', () => {
  it('classifies by extension, ignoring query strings and case', () => {
    expect(kindFromUrl('https://x.supabase.co/a/photo.JPG?t=1')).toBe('IMAGE');
    expect(kindFromUrl('https://x/v.mp4')).toBe('VIDEO');
    expect(kindFromUrl('https://x/report.pdf')).toBe('PDF');
    expect(kindFromUrl('https://x/l.m4a')).toBe('AUDIO');
  });
  it('falls back to OTHER for unknown or missing extensions', () => {
    expect(kindFromUrl('https://x/blob')).toBe('OTHER');
    expect(kindFromUrl('https://x/file.xyz')).toBe('OTHER');
  });
});

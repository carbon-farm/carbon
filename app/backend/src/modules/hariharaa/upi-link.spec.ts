import { buildUpiLink } from './upi-link';

describe('buildUpiLink', () => {
  const base = { vpa: 'hariharaanaturalfoodstores@okaxis', payeeName: 'HARIHARAA Natural Food Stores', amountInr: 499 };

  it('matches the shape of the merchant\'s own QR, with the amount added', () => {
    expect(buildUpiLink({ ...base, merchantAid: 'uGICAgJCWs8nDFg', note: 'HARIHARAA subscription' })).toBe(
      'upi://pay?pa=hariharaanaturalfoodstores@okaxis&pn=HARIHARAA%20Natural%20Food%20Stores&aid=uGICAgJCWs8nDFg&am=499.00&cu=INR&tn=HARIHARAA%20subscription',
    );
  });

  it('keeps the @ in the VPA literal (never %40)', () => {
    expect(buildUpiLink(base)).toContain('pa=hariharaanaturalfoodstores@okaxis&');
    expect(buildUpiLink(base)).not.toContain('%40');
  });

  it('always writes the amount with two decimals', () => {
    expect(buildUpiLink({ ...base, amountInr: 499 })).toContain('am=499.00');
    expect(buildUpiLink({ ...base, amountInr: 99.5 })).toContain('am=99.50');
  });

  it('omits aid and tn when not configured', () => {
    const link = buildUpiLink(base);
    expect(link).not.toContain('aid=');
    expect(link).not.toContain('tn=');
  });

  it('is a valid URL whose parameters round-trip', () => {
    const u = new URL(buildUpiLink({ ...base, merchantAid: 'uGICAgJCWs8nDFg', note: 'a & b' }).replace('upi://', 'http://x/'));
    expect(u.searchParams.get('pa')).toBe(base.vpa);
    expect(u.searchParams.get('pn')).toBe(base.payeeName);
    expect(u.searchParams.get('tn')).toBe('a & b');
  });
});

import { normalizeRole } from './role-compat';

describe('normalizeRole', () => {
  it('reads the legacy FARMER and CUSTOMER roles as MEMBER', () => {
    expect(normalizeRole('FARMER')).toBe('MEMBER');
    expect(normalizeRole('CUSTOMER')).toBe('MEMBER');
  });
  it('leaves MEMBER and every staff role untouched', () => {
    for (const r of ['MEMBER', 'EXPERT', 'MODERATOR', 'ADMINISTRATOR', 'VENDOR', 'SUPPORT_AGENT']) {
      expect(normalizeRole(r)).toBe(r);
    }
  });
});

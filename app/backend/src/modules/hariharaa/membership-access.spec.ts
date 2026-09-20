import { computeAccess, memberLabel, parseGrantUntil, renewalStart } from './membership-access';

const DAY = 864e5;
const at = (n: number) => new Date(Date.now() + n * DAY);
const dates = (paid: number | null, free: number | null) => ({
  activeUntil: paid === null ? null : at(paid),
  complimentaryUntil: free === null ? null : at(free),
});

describe('computeAccess', () => {
  it('no access for a member who has neither', () => {
    expect(computeAccess(null)).toMatchObject({ hasAccess: false, kind: 'NONE', until: null });
    expect(computeAccess(dates(null, null))).toMatchObject({ hasAccess: false, kind: 'NONE' });
  });
  it('paid access', () => expect(computeAccess(dates(10, null))).toMatchObject({ hasAccess: true, kind: 'PAID' }));
  it('free access', () => expect(computeAccess(dates(null, 30))).toMatchObject({ hasAccess: true, kind: 'FREE' }));
  it('paid wins the label when both are valid, and until is the later date', () => {
    const d = dates(10, 30);
    const a = computeAccess(d);
    expect(a.kind).toBe('PAID');
    expect(a.until!.getTime()).toBe(d.complimentaryUntil!.getTime());
  });
  it('a lapsed paid month with valid free access still has access', () => {
    expect(computeAccess(dates(-5, 20))).toMatchObject({ hasAccess: true, kind: 'FREE' });
  });
  it('both lapsed: no access, and until remembers when the last one ended (for "expired")', () => {
    const d = dates(-5, -2);
    const a = computeAccess(d);
    expect(a.hasAccess).toBe(false);
    expect(a.kind).toBe('NONE');
    expect(a.until!.getTime()).toBe(d.complimentaryUntil!.getTime());
  });
});

describe('renewalStart', () => {
  const start = (d: ReturnType<typeof dates> | null) => Math.round((renewalStart(d).getTime() - Date.now()) / DAY);
  it('starts today for a first payment', () => expect(start(null)).toBe(0));
  it('starts today when everything already lapsed', () => expect(start(dates(-20, -3))).toBe(0));
  it('adds on top of remaining paid days', () => expect(start(dates(10, null))).toBe(10));
  it('adds AFTER a free period still running, so paying during a free grant is not wasted', () => {
    expect(start(dates(null, 25))).toBe(25);
    expect(start(dates(10, 25))).toBe(25);
  });
});

describe('memberLabel', () => {
  const label = (d: ReturnType<typeof dates> | null, claimed = false) => memberLabel(computeAccess(d), claimed);
  it('UNPAID for a brand-new member', () => expect(label(null)).toBe('UNPAID'));
  it('PAID / FREE while access is running', () => {
    expect(label(dates(10, null))).toBe('PAID');
    expect(label(dates(null, 10))).toBe('FREE');
  });
  it('EXPIRED once they had access and it ended', () => expect(label(dates(-5, null))).toBe('EXPIRED'));
  it('AWAITING wins whenever a payment is waiting for verification', () => {
    expect(label(null, true)).toBe('AWAITING');
    expect(label(dates(10, null), true)).toBe('AWAITING');
  });
});

describe('parseGrantUntil', () => {
  it('a plain date means the END of that day in India', () => {
    expect(parseGrantUntil('2026-12-31')!.toISOString()).toBe('2026-12-31T18:29:59.000Z');
  });
  it('accepts a full timestamp as given', () => {
    expect(parseGrantUntil('2026-12-31T10:00:00.000Z')!.toISOString()).toBe('2026-12-31T10:00:00.000Z');
  });
  it('returns null for junk', () => expect(parseGrantUntil('not a date')).toBeNull());
});

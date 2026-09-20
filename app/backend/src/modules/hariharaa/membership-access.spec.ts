import { accessEnd, computeAccess, daysLeft, memberLabel, parseGrantUntil, reminderDue, renewalStart } from './membership-access';

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

describe('expiry reminders', () => {
  const none = { expiryReminderFor: null, expiredNoticeFor: null };
  const state = (paid: number | null, free: number | null, extra: { expiryReminderFor?: Date; expiredNoticeFor?: Date } = {}) => ({ ...dates(paid, free), ...none, ...extra });

  it('access ends when the LATER of paid and free ends', () => {
    expect(accessEnd(dates(10, 30))!.source).toBe('FREE');
    expect(accessEnd(dates(40, 30))!.source).toBe('PAID');
    expect(accessEnd(dates(null, null))).toBeNull();
  });
  it('nothing due for a member with no dates, or with plenty of time left', () => {
    expect(reminderDue(null)).toBeNull();
    expect(reminderDue(state(null, null))).toBeNull();
    expect(reminderDue(state(10, null))).toBeNull();
    expect(reminderDue(state(3.5, null))).toBeNull();
  });
  it('EXPIRING once 3 days or fewer are left, with the days rounded up', () => {
    expect(reminderDue(state(2.4, null))).toMatchObject({ kind: 'EXPIRING', daysLeft: 3, source: 'PAID' });
    expect(reminderDue(state(0.2, null))).toMatchObject({ kind: 'EXPIRING', daysLeft: 1 });
    expect(reminderDue(state(null, 1.5))).toMatchObject({ kind: 'EXPIRING', source: 'FREE' });
  });
  it('is announced once per end date, and a renewal makes the next expiry due again', () => {
    const s = state(2, null);
    const sent = reminderDue(s)!;
    expect(reminderDue({ ...s, expiryReminderFor: sent.until })).toBeNull();
    const renewed = { ...s, activeUntil: at(32), expiryReminderFor: sent.until };
    expect(reminderDue(renewed)).toBeNull(); // far away again
    const nextCycle = { ...renewed, activeUntil: at(1) };
    expect(reminderDue(nextCycle)).toMatchObject({ kind: 'EXPIRING' }); // a different end date
  });
  it('EXPIRED once it has ended, announced once, and not for old expiries', () => {
    expect(reminderDue(state(-0.5, null))).toMatchObject({ kind: 'EXPIRED', daysLeft: 0 });
    const ended = reminderDue(state(-0.5, null))!;
    expect(reminderDue({ ...state(-0.5, null), expiredNoticeFor: ended.until })).toBeNull();
    expect(reminderDue(state(-20, null))).toBeNull(); // long lapsed: no back-filling
  });
  it('a member still covered by free access is not told the paid month ended', () => {
    expect(reminderDue(state(-1, 30))).toBeNull();
  });
  it('daysLeft counts whole days of access, or null without access', () => {
    expect(daysLeft(dates(2.2, null))).toBe(3);
    expect(daysLeft(dates(-1, null))).toBeNull();
    expect(daysLeft(null)).toBeNull();
  });
});

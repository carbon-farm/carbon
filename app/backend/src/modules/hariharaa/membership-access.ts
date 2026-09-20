export type AccessKind = 'PAID' | 'FREE' | 'NONE';

export interface AccessDates {
  activeUntil: Date | null; // paid-through, set by a verified payment
  complimentaryUntil: Date | null; // free access granted by an Administrator
}

export interface Access {
  hasAccess: boolean;
  kind: AccessKind; // what is currently providing access; PAID wins if both are valid
  until: Date | null; // when current access ends — or, with no access, when the last one ended
  paidUntil: Date | null;
  freeUntil: Date | null;
}

// Membership is "either date is still in the future". Paid and free access are held
// separately so revoking free access never touches paid days, and paying never
// overwrites a free grant. Both simply lapse with time — no sweep job.
export function computeAccess(dates: AccessDates | null, now: Date = new Date()): Access {
  const paidUntil = dates?.activeUntil ?? null;
  const freeUntil = dates?.complimentaryUntil ?? null;
  const paidValid = paidUntil !== null && paidUntil > now;
  const freeValid = freeUntil !== null && freeUntil > now;

  const latest = (...ds: (Date | null)[]) => ds.filter((d): d is Date => d !== null).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  return {
    hasAccess: paidValid || freeValid,
    kind: paidValid ? 'PAID' : freeValid ? 'FREE' : 'NONE',
    until: paidValid || freeValid ? latest(paidValid ? paidUntil : null, freeValid ? freeUntil : null) : latest(paidUntil, freeUntil),
    paidUntil,
    freeUntil,
  };
}

// A payment buys time AFTER whatever the member already has — the paid days left, and
// any free-access period still running — so paying during a free grant is never wasted.
export function renewalStart(dates: AccessDates | null, now: Date = new Date()): Date {
  return new Date(Math.max(now.getTime(), dates?.activeUntil?.getTime() ?? 0, dates?.complimentaryUntil?.getTime() ?? 0));
}

// The label an Administrator sees for a member on the Members list.
export type MemberLabel = 'PAID' | 'FREE' | 'AWAITING' | 'EXPIRED' | 'UNPAID';

export function memberLabel(access: Access, hasClaimedPayment: boolean): MemberLabel {
  if (hasClaimedPayment) return 'AWAITING';
  if (access.hasAccess) return access.kind === 'FREE' ? 'FREE' : 'PAID';
  return access.until !== null ? 'EXPIRED' : 'UNPAID';
}

// "2026-12-31" (what a date picker gives) means the END of that day in India, so a grant
// "until 31 Dec" really lasts through 31 Dec. A full timestamp is used as given.
export function parseGrantUntil(input: string): Date | null {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(input);
  const d = new Date(dateOnly ? `${input}T23:59:59+05:30` : input);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------- Expiry reminders ----------

// A member is told 3 days before their access ends, and again once it has ended. Each end date is
// announced once: the dates the notices were last sent for are remembered on the subscription,
// so a renewal (which moves the end date) makes the next expiry due afresh.
export const REMINDER_DAYS = 3;
const GRACE_DAYS = 7; // stop announcing an expiry that is more than a week old (no back-filling)

export type ReminderKind = 'EXPIRING' | 'EXPIRED';

export interface ReminderState extends AccessDates {
  expiryReminderFor: Date | null;
  expiredNoticeFor: Date | null;
}

export interface ReminderDue {
  kind: ReminderKind;
  until: Date; // the end date being announced
  daysLeft: number; // whole days, rounded up; 0 once ended
  source: 'PAID' | 'FREE'; // which kind of access is the one ending
}

// Access ends when the LATER of the paid and free dates ends.
export function accessEnd(dates: AccessDates | null): { until: Date; source: 'PAID' | 'FREE' } | null {
  const paid = dates?.activeUntil ?? null;
  const free = dates?.complimentaryUntil ?? null;
  if (!paid && !free) return null;
  if (paid && (!free || paid >= free)) return { until: paid, source: 'PAID' };
  return { until: free as Date, source: 'FREE' };
}

export function reminderDue(state: ReminderState | null, now: Date = new Date()): ReminderDue | null {
  if (!state) return null;
  const end = accessEnd(state);
  if (!end) return null;
  const msLeft = end.until.getTime() - now.getTime();
  const sameAs = (d: Date | null) => d !== null && d.getTime() === end.until.getTime();

  if (msLeft > 0) {
    if (msLeft <= REMINDER_DAYS * 864e5 && !sameAs(state.expiryReminderFor)) {
      return { kind: 'EXPIRING', until: end.until, daysLeft: Math.ceil(msLeft / 864e5), source: end.source };
    }
    return null;
  }
  if (-msLeft <= GRACE_DAYS * 864e5 && !sameAs(state.expiredNoticeFor)) {
    return { kind: 'EXPIRED', until: end.until, daysLeft: 0, source: end.source };
  }
  return null;
}

// Whole days of access left (rounded up), or null when there is no access to run out.
export function daysLeft(dates: AccessDates | null, now: Date = new Date()): number | null {
  const access = computeAccess(dates, now);
  return access.hasAccess && access.until ? Math.ceil((access.until.getTime() - now.getTime()) / 864e5) : null;
}

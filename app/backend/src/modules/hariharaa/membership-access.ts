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

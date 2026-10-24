// Numbers a person can read out over the phone and recognise as theirs:
//
//   CASE-HHC0003-20261024-001   the member (HHC-0003), the day (24 Oct 2026, India time), and
//   ORD-HHC0003-20261024-001    which one of that day — "their 1st case/order today".
//   SOIL-HHC0003-20261024-001
//
// The sequence is counted per member per day and a unique constraint backs it up; callers retry
// with the next number if two requests from the same member race for the same one.

// The date in India as YYYYMMDD, whatever the server's own clock says.
export function istStamp(now: Date = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10).replace(/-/g, '');
}

// "HHC-0003" -> "HHC0003"
export function compactCode(userCode: string | null | undefined): string {
  const c = (userCode ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return c || 'HHX0000';
}

// Everything but the sequence — also what existing numbers are matched against when counting.
export function numberPrefix(kind: 'CASE' | 'ORD' | 'SOIL', userCode: string | null | undefined, now: Date = new Date()): string {
  return `${kind}-${compactCode(userCode)}-${istStamp(now)}-`;
}

export const withSequence = (prefix: string, n: number): string => `${prefix}${String(n).padStart(3, '0')}`;

// Prisma's "unique constraint failed".
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002';
}

export const MAX_NUMBER_ATTEMPTS = 6;

import { currentMonthIst, inSeason } from './season';

describe('inSeason', () => {
  it('handles an ordinary season', () => {
    expect(inSeason(6, 6, 9)).toBe(true);
    expect(inSeason(9, 6, 9)).toBe(true);
    expect(inSeason(5, 6, 9)).toBe(false);
    expect(inSeason(10, 6, 9)).toBe(false);
  });

  it('handles a season that wraps over the new year', () => {
    for (const m of [11, 12, 1, 2]) expect(inSeason(m, 11, 2)).toBe(true);
    for (const m of [3, 6, 10]) expect(inSeason(m, 11, 2)).toBe(false);
  });

  it('a one-month season and a whole-year season', () => {
    expect(inSeason(4, 4, 4)).toBe(true);
    expect(inSeason(5, 4, 4)).toBe(false);
    for (let m = 1; m <= 12; m++) expect(inSeason(m, 1, 12)).toBe(true);
  });
});

describe('currentMonthIst', () => {
  it('uses India time, so just after midnight on the 1st in India is already the new month', () => {
    expect(currentMonthIst(new Date('2026-10-31T19:00:00Z'))).toBe(11); // 00:30 IST on 1 November
    expect(currentMonthIst(new Date('2026-10-31T17:00:00Z'))).toBe(10); // 22:30 IST on 31 October
    expect(currentMonthIst(new Date('2026-12-31T19:00:00Z'))).toBe(1);
  });
});

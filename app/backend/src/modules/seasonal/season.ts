// Is `month` (1–12) inside the season that runs from `start` to `end`? A season may wrap over the
// new year: start 11, end 2 means November, December, January, February.
export function inSeason(month: number, start: number, end: number): boolean {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}

// The month number (1–12) it is right now in India, whatever the server's own clock says.
export function currentMonthIst(now: Date = new Date()): number {
  return new Date(now.getTime() + 5.5 * 3_600_000).getUTCMonth() + 1;
}

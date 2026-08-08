// Every message an API response sends back to a screen — errors and success
// messages alike — carries English then Telugu, per product decision. Kept
// as "English / తెలుగు" on one line (not two) because these travel as plain
// JSON string values into a compact error banner on the frontend; contrast
// with app/web/src/i18n/Bi.tsx, which stacks the two languages for on-screen
// labels where there's room to.
export function bi(en: string, te: string): string {
  return `${en} / ${te}`;
}

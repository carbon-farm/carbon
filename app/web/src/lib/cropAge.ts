import { strings } from '../i18n/strings';

// How long a crop has been on a parcel, in whole days, for the farmer, moderator and expert.
// Parcels made before crop dates were kept have none: they count from the parcel's own creation.
// A crop that is not on the parcel has no age (a case can name any crop).
const DAY_MS = 86_400_000;

// "12 days on this parcel / ఈ స్థలంలో 12 రోజులు"; atReport: counted on the day the problem was reported.
export function cropAgeText(days: number, atReport = false): { en: string; te: string } {
  if (atReport) {
    if (days === 0) return strings.cropAgeSameDay;
    if (days === 1) return strings.cropAgeOneDayAtReport;
    return { en: strings.cropAgeDaysAtReport.en.replace('{n}', String(days)), te: strings.cropAgeDaysAtReport.te.replace('{n}', String(days)) };
  }
  if (days === 0) return strings.cropAgeToday;
  if (days === 1) return strings.cropAgeOneDay;
  return { en: strings.cropAgeDays.en.replace('{n}', String(days)), te: strings.cropAgeDays.te.replace('{n}', String(days)) };
}

export function cropAgeDays(
  parcel: { cropAddedAt?: Record<string, string> | null; createdAt?: string; primaryCrops?: string[] } | null | undefined,
  cropName: string | null | undefined,
  asOf: number = Date.now(),
): number | null {
  if (!parcel || !cropName) return null;
  const key = cropName.trim().toLowerCase();
  const dated = parcel.cropAddedAt?.[key];
  const listed = !!parcel.primaryCrops?.some((c) => c.trim().toLowerCase() === key);
  const iso = dated ?? (listed ? parcel.createdAt : undefined);
  const added = iso ? new Date(iso).getTime() : NaN;
  if (Number.isNaN(added)) return null;
  return Math.max(0, Math.floor((asOf - added) / DAY_MS));
}

// The moment to count a case's crop age to: when the problem was reported (or now, for a draft).
export function reportedAt(c: { submittedAt: string | null }): number {
  return c.submittedAt ? new Date(c.submittedAt).getTime() : Date.now();
}

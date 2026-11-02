import { strings } from '../i18n/strings';

// How long a crop has been on a parcel, in whole days, for the farmer, moderator and expert.
// Parcels made before crop dates were kept have none: they count from the parcel's own creation.
const DAY_MS = 86_400_000;

// "12 days on this parcel / ఈ స్థలంలో 12 రోజులు", singular and "today" handled.
export function cropAgeText(days: number): { en: string; te: string } {
  if (days === 0) return strings.cropAgeToday;
  if (days === 1) return strings.cropAgeOneDay;
  return { en: strings.cropAgeDays.en.replace('{n}', String(days)), te: strings.cropAgeDays.te.replace('{n}', String(days)) };
}

export function cropAgeDays(
  parcel: { cropAddedAt?: Record<string, string> | null; createdAt?: string } | null | undefined,
  cropName: string | null | undefined,
  now: number = Date.now(),
): number | null {
  if (!parcel || !cropName) return null;
  const iso = parcel.cropAddedAt?.[cropName.trim().toLowerCase()] ?? parcel.createdAt;
  const added = iso ? new Date(iso).getTime() : NaN;
  if (Number.isNaN(added)) return null;
  return Math.max(0, Math.floor((now - added) / DAY_MS));
}

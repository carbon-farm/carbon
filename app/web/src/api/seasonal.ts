import { apiRequest } from './client';

export interface SeasonalTip {
  id: string;
  titleEn: string;
  titleTe: string;
  bodyEn: string;
  bodyTe: string;
  startMonth: number;
  endMonth: number;
  cropId: string | null;
  crop: { id: string; name: string } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentTip {
  id: string;
  titleEn: string;
  titleTe: string;
  bodyEn: string;
  bodyTe: string;
  cropName: string | null;
}

export type TipInput = {
  titleEn: string;
  titleTe: string;
  bodyEn: string;
  bodyTe: string;
  startMonth: number;
  endMonth: number;
  cropId?: string | null;
};

// For a member's Today panel: what is in season now, for the crops they grow.
export function getCurrentTips(token: string) {
  return apiRequest<CurrentTip[]>('/seasonal-tips/current', { token });
}

export function listSeasonalTips(token: string) {
  return apiRequest<SeasonalTip[]>('/seasonal-tips', { token });
}

export function createSeasonalTip(token: string, data: TipInput) {
  return apiRequest<SeasonalTip>('/seasonal-tips', { method: 'POST', body: data, token });
}

export function updateSeasonalTip(token: string, id: string, data: Partial<TipInput> & { isActive?: boolean }) {
  return apiRequest<SeasonalTip>(`/seasonal-tips/${id}`, { method: 'PATCH', body: data, token });
}

export function deleteSeasonalTip(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(`/seasonal-tips/${id}`, { method: 'DELETE', token });
}

export const MONTHS: { en: string; te: string }[] = [
  { en: 'January', te: 'జనవరి' },
  { en: 'February', te: 'ఫిబ్రవరి' },
  { en: 'March', te: 'మార్చి' },
  { en: 'April', te: 'ఏప్రిల్' },
  { en: 'May', te: 'మే' },
  { en: 'June', te: 'జూన్' },
  { en: 'July', te: 'జూలై' },
  { en: 'August', te: 'ఆగస్టు' },
  { en: 'September', te: 'సెప్టెంబర్' },
  { en: 'October', te: 'అక్టోబర్' },
  { en: 'November', te: 'నవంబర్' },
  { en: 'December', te: 'డిసెంబర్' },
];

// The same rule the server uses (a season may wrap over the new year).
export function inSeason(month: number, start: number, end: number): boolean {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}

// The month number (1–12) in India right now.
export function currentMonthIst(now = new Date()): number {
  return new Date(now.getTime() + 5.5 * 3_600_000).getUTCMonth() + 1;
}

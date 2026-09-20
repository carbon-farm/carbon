import type { PublicPlan } from '../api/hariharaa';

// "Monthly / నెలవారీ"
export const planTitle = (p: Pick<PublicPlan, 'name' | 'nameTe'>) => (p.nameTe ? `${p.name} / ${p.nameTe}` : p.name);

// 30 -> "1 month / 1 నెల", 365 -> "1 year / 1 సంవత్సరం", 45 -> "45 days / 45 రోజులు"
export function periodLabel(days: number): { en: string; te: string } {
  if (days % 365 === 0) {
    const n = days / 365;
    return { en: `${n} year${n > 1 ? 's' : ''}`, te: `${n} సంవత్సరం${n > 1 ? 'లు' : ''}` };
  }
  if (days % 30 === 0) {
    const n = days / 30;
    return { en: `${n} month${n > 1 ? 's' : ''}`, te: `${n} నెల${n > 1 ? 'లు' : ''}` };
  }
  return { en: `${days} days`, te: `${days} రోజులు` };
}

export const periodText = (days: number) => {
  const l = periodLabel(days);
  return `${l.en} / ${l.te}`;
};

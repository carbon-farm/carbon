export interface UpiLinkInput {
  vpa: string;
  payeeName: string;
  amountInr: number;
  merchantAid?: string | null;
  note?: string;
}

// VPA characters are safe to leave raw; NPCI's linking spec and the merchant's
// own QR both carry the "@" literally. Percent-encoding it ("%40") is what
// some UPI apps fail to decode, so only encode if something unusual is present.
const SAFE_VPA = /^[A-Za-z0-9._\-@]+$/;

// Builds the same shape as the merchant's own Google Pay QR
// (pa, pn, aid) plus the per-payment fields (am, cu, tn). `aid` is what marks
// it as a payment to the registered business rather than a person-to-person one.
export function buildUpiLink({ vpa, payeeName, amountInr, merchantAid, note }: UpiLinkInput): string {
  const pa = SAFE_VPA.test(vpa) ? vpa : encodeURIComponent(vpa).replace(/%40/g, '@');
  const parts = [`pa=${pa}`, `pn=${encodeURIComponent(payeeName)}`];
  if (merchantAid) parts.push(`aid=${encodeURIComponent(merchantAid)}`);
  parts.push(`am=${amountInr.toFixed(2)}`, 'cu=INR');
  if (note) parts.push(`tn=${encodeURIComponent(note)}`);
  return `upi://pay?${parts.join('&')}`;
}

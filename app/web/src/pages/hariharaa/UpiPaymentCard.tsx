import QRCode from 'react-qr-code';
import type { StartedPayment } from '../../api/hariharaa';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';
import { periodText } from '../../membership/plans';

// The payment QR — shown only to a logged-in customer, after they tap Pay, so every
// payment is tied to an account. The link is built by the backend (see upi-link.ts).
export function UpiPaymentCard({ payment }: { payment: Pick<StartedPayment, 'amountInr' | 'upiLink'> & { planName?: string | null; periodDays?: number } }) {
  return (
    <div>
      <div className="field-label">{payment.planName ? payment.planName : <Bi id="hariharaaPriceLabel" />}</div>
      <div>
        ₹{payment.amountInr.toFixed(2)}
        {payment.periodDays ? ` · ${periodText(payment.periodDays)}` : ''}
      </div>

      <div style={{ background: '#fff', padding: 16, width: 'fit-content', margin: '16px 0' }}>
        {/* level="Q" (~25% damage tolerance) — usually scanned off a phone or laptop
            screen rather than paper, where the library's default "L" is thin. */}
        <QRCode value={payment.upiLink} size={200} level="Q" />
      </div>
      <BiValue value={strings.hariharaaScanToPayHint} as="p" className="hint" />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMembership } from '../auth/MembershipContext';
import { getPublicSettings } from '../api/hariharaa';
import { Bi } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';

const TEXT: Record<string, StringKey> = {
  NOT_PAID: 'paymentStripNotPaid',
  AWAITING_VERIFICATION: 'paymentStripAwaiting',
  REJECTED: 'paymentStripRejected',
  EXPIRED: 'paymentStripExpired',
};

// A reminder strip directly under the title bar for members who don't have access yet
// (no paid month and no free access). It stays on every screen until the payment is
// verified or free access is granted, then removes itself — no action needed; the
// membership check behind it refreshes on every page change and once a minute.
// (Hidden on the Pay page itself, which already shows the same status.)
export function PaymentStrip() {
  const { applies, status } = useMembership();
  const { pathname } = useLocation();
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!applies) return;
    getPublicSettings()
      .then((s) => setPrice(s.subscriptionPriceInr))
      .catch(() => {});
  }, [applies]);

  if (!applies || !status || status.hasAccess) return null;
  if (pathname === '/hariharaa/subscription') return null;

  const state = status.state;
  const textKey = TEXT[state] ?? TEXT.NOT_PAID;
  const needsAction = state !== 'AWAITING_VERIFICATION';

  return (
    <div data-tour="payment-strip" className={`payment-strip${state === 'REJECTED' || state === 'EXPIRED' ? ' alert' : ''}`} role="status">
      {/* English / Telugu on ONE line (not stacked) so the strip stays slim on a phone. */}
      <span className="strip-text">
        {strings[textKey].en} / {strings[textKey].te}
        {state === 'NOT_PAID' && price !== null && <strong> · ₹{price.toFixed(0)}</strong>}
      </span>
      <Link to="/hariharaa/subscription" className="strip-action">
        <Bi id={needsAction ? 'paymentStripPay' : 'paymentStripView'} />
      </Link>
    </div>
  );
}

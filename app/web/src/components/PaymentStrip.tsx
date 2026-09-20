import { Link, useLocation } from 'react-router-dom';
import { useMembership } from '../auth/MembershipContext';
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

  if (!applies || !status) return null;
  if (pathname === '/hariharaa/subscription') return null;

  // Access is running but about to end: a gentle "renew" reminder (3 days or fewer), unless a
  // renewal is already waiting for verification.
  if (status.hasAccess) {
    const left = status.daysLeft;
    if (!status.membershipRequired || left === null || left > 3 || status.state === 'AWAITING_VERIFICATION') return null;
    const key = status.accessKind === 'FREE' ? 'paymentStripFreeEndsSoon' : 'paymentStripEndsSoon';
    const text = (lang: 'en' | 'te') =>
      strings[key][lang].replace('{n}', String(left)).replace('{days}', lang === 'en' ? (left === 1 ? 'day' : 'days') : left === 1 ? 'రోజులో' : 'రోజుల్లో');
    return (
      <div data-tour="payment-strip" className="payment-strip" role="status">
        <span className="strip-text">
          {text('en')} / {text('te')}
        </span>
        <Link to="/hariharaa/subscription" className="strip-action">
          <Bi id="paymentStripRenew" />
        </Link>
      </div>
    );
  }

  // "from ₹499" when there is a choice of plans, plain "₹499" when there is one.
  const prices = status.plans.map((p) => p.priceInr);
  const price = prices.length ? Math.min(...prices) : null;
  const state = status.state;
  const textKey = TEXT[state] ?? TEXT.NOT_PAID;
  const needsAction = state !== 'AWAITING_VERIFICATION';

  return (
    <div data-tour="payment-strip" className={`payment-strip${state === 'REJECTED' || state === 'EXPIRED' ? ' alert' : ''}`} role="status">
      {/* English / Telugu on ONE line (not stacked) so the strip stays slim on a phone. */}
      <span className="strip-text">
        {strings[textKey].en} / {strings[textKey].te}
        {state === 'NOT_PAID' && price !== null && (
          <strong>
            {' '}
            · {prices.length > 1 ? `${strings.planPriceFrom.en} / ${strings.planPriceFrom.te} ` : ''}₹{price.toFixed(0)}
          </strong>
        )}
      </span>
      <Link to="/hariharaa/subscription" className="strip-action">
        <Bi id={needsAction ? 'paymentStripPay' : 'paymentStripView'} />
      </Link>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMySubscription, getPublicSettings, type MySubscription } from '../api/hariharaa';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';

const POLL_MS = 60_000;

const TEXT: Record<string, StringKey> = {
  NOT_PAID: 'paymentStripNotPaid',
  AWAITING_VERIFICATION: 'paymentStripAwaiting',
  REJECTED: 'paymentStripRejected',
  EXPIRED: 'paymentStripExpired',
};

// A reminder strip directly under the title bar for HARIHARAA customers who don't have
// access yet. It stays on every screen until the payment is verified, then removes
// itself — no action needed. It re-checks on every page change and once a minute, so it
// clears soon after an Administrator verifies the payment. (Hidden on the Pay page
// itself, which already shows the same status.)
export function PaymentStrip() {
  const { session } = useAuth();
  const { pathname } = useLocation();
  const [status, setStatus] = useState<MySubscription | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  const isCustomer = session?.role === 'CUSTOMER';

  useEffect(() => {
    if (!isCustomer) return;
    getPublicSettings()
      .then((s) => setPrice(s.subscriptionPriceInr))
      .catch(() => {});
  }, [isCustomer]);

  useEffect(() => {
    if (!session || !isCustomer) return;
    let cancelled = false;
    const load = () =>
      getMySubscription(session.accessToken)
        .then((s) => {
          if (!cancelled) setStatus(s);
        })
        .catch(() => {});
    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // pathname: re-check on every page change, so it clears right after the customer's
    // own actions and on the first navigation after an Administrator verifies them.
  }, [session, isCustomer, pathname]);

  if (!isCustomer || !status || status.hasAccess) return null;
  if (pathname === '/hariharaa/subscription') return null;

  const state = status.state;
  const textKey = TEXT[state] ?? TEXT.NOT_PAID;
  const needsAction = state !== 'AWAITING_VERIFICATION';

  return (
    <div className={`payment-strip${state === 'REJECTED' || state === 'EXPIRED' ? ' alert' : ''}`} role="status">
      <span>
        <BiValue value={strings[textKey]} as="span" />
        {state === 'NOT_PAID' && price !== null && <strong> ₹{price.toFixed(2)}</strong>}
      </span>
      <Link to="/hariharaa/subscription" className="strip-action">
        <Bi id={needsAction ? 'hariharaaPayNowButton' : 'paymentStripView'} />
      </Link>
    </div>
  );
}

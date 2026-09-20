import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getMySubscription, type MySubscription } from '../api/hariharaa';

const POLL_MS = 60_000;

interface MembershipValue {
  // Only a Member has a membership to check; for staff this is always "not applicable".
  applies: boolean;
  status: MySubscription | null; // null until the first answer arrives
  // True for staff (no gate) and for members with paid or free access. False only while
  // a member is known to be locked out — never guessed while still loading.
  unlocked: boolean;
  loaded: boolean;
}

const MembershipContext = createContext<MembershipValue>({ applies: false, status: null, unlocked: true, loaded: true });

// One shared answer to "does this member have access?" for the payment strip, the nav
// and the locked-page screen. It re-checks on every page change and once a minute, so
// it clears soon after an Administrator verifies a payment or grants free access. The
// server is the real gate (MembershipGuard) — this only decides what to show.
export function MembershipProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { pathname } = useLocation();
  const [status, setStatus] = useState<MySubscription | null>(null);
  const [loaded, setLoaded] = useState(false);
  const applies = session?.role === 'MEMBER';

  useEffect(() => {
    setStatus(null);
    setLoaded(false);
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session || !applies) return;
    let cancelled = false;
    const load = () =>
      getMySubscription(session.accessToken)
        .then((s) => {
          if (!cancelled) setStatus(s);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoaded(true);
        });
    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session, applies, pathname]);

  const value = useMemo<MembershipValue>(
    () => ({ applies, status, loaded, unlocked: !applies || !loaded || (status?.hasAccess ?? false) }),
    [applies, status, loaded],
  );
  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership(): MembershipValue {
  return useContext(MembershipContext);
}

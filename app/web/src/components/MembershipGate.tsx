import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMembership } from '../auth/MembershipContext';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// Wraps a farm-advice screen (cases, knowledge, courses, soil testing). A member without
// an active membership sees this friendly lock instead of a page whose API calls would
// all fail with 403; staff and paid/free members see the page. The API enforces the same
// rule, so this is convenience, not security.
export function MembershipGate({ children }: { children: ReactNode }) {
  const { applies, loaded, unlocked } = useMembership();
  const navigate = useNavigate();
  if (applies && !loaded) return <BiValue value={strings.loading} as="p" className="hint" />;
  if (unlocked) return <>{children}</>;
  return (
    <div className="card">
      <Bi id="membershipLockedTitle" as="h2" />
      <Bi id="membershipLockedBody" as="p" />
      <button type="button" onClick={() => navigate('/hariharaa/subscription')}>
        <Bi id="membershipLockedButton" />
      </button>
    </div>
  );
}

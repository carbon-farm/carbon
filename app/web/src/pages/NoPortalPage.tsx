import { useAuth } from '../auth/AuthContext';
import { Bi } from '../i18n/Bi';

export function NoPortalPage() {
  const { logout } = useAuth();
  return (
    <div className="screen">
      <div>
        <Bi id="brand" as="span" className="eyebrow" />
        <Bi id="noPortalTitle" as="h1" />
      </div>
      <Bi id="noPortalNotice" as="p" className="hint" />
      <button type="button" className="secondary" onClick={logout}>
        <Bi id="logoutButton" />
      </button>
    </div>
  );
}

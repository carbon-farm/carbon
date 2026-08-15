import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

export function AdminHomePage() {
  const { logout } = useAuth();

  return (
    <div className="screen">
      <div className="top-bar">
        <div>
          <Bi id="adminEyebrow" as="span" className="eyebrow" />
          <Bi id="adminHubTitle" as="h1" />
        </div>
        <button type="button" className="secondary" onClick={logout}>
          <Bi id="logoutButton" />
        </button>
      </div>

      <Link to="/admin/staff" className="case-item">
        <BiValue value={strings.staffLinkTitle} as="div" className="label" />
        <BiValue value={strings.staffLinkDesc} as="div" className="meta" />
      </Link>

      <Link to="/admin/credentials" className="case-item">
        <BiValue value={strings.credentialsLinkTitle} as="div" className="label" />
        <BiValue value={strings.credentialsLinkDesc} as="div" className="meta" />
      </Link>

      <Link to="/admin/taxonomy" className="case-item">
        <BiValue value={strings.taxonomyLinkTitle} as="div" className="label" />
        <BiValue value={strings.taxonomyLinkDesc} as="div" className="meta" />
      </Link>

      <Link to="/admin/audit" className="case-item">
        <BiValue value={strings.auditLogLinkTitle} as="div" className="label" />
        <BiValue value={strings.auditLogLinkDesc} as="div" className="meta" />
      </Link>
    </div>
  );
}

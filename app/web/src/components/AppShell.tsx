import type { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../auth/roleHome';
import { Bi } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';

interface NavItem {
  to: string;
  labelKey: StringKey;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  FARMER: [
    { to: '/dashboard', labelKey: 'dashboardEyebrow' },
    { to: '/cases', labelKey: 'myCasesTitle' },
    { to: '/knowledge', labelKey: 'knowledgeEyebrow' },
  ],
  MODERATOR: [
    { to: '/moderator/queue', labelKey: 'moderatorQueueTitle' },
    { to: '/moderator/articles', labelKey: 'articleQueueTitle' },
  ],
  EXPERT: [
    { to: '/expert/cases', labelKey: 'expertCasesTitle' },
    { to: '/expert/articles', labelKey: 'myArticlesTitle' },
  ],
  ADMINISTRATOR: [
    { to: '/admin', labelKey: 'adminHubTitle' },
    { to: '/admin/staff', labelKey: 'staffLinkTitle' },
    { to: '/admin/credentials', labelKey: 'credentialsLinkTitle' },
    { to: '/admin/taxonomy', labelKey: 'taxonomyLinkTitle' },
    { to: '/admin/audit', labelKey: 'auditLogLinkTitle' },
  ],
};

// Persistent header + role-aware nav — every authenticated page renders
// inside this instead of building its own ad-hoc top-bar, so the product
// reads as one continuous application rather than a stack of disconnected
// forms (direct user feedback: it didn't).
export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { session, logout } = useAuth();
  const navItems = session ? (NAV_BY_ROLE[session.role] ?? []) : [];

  return (
    <div>
      <header className="app-header">
        <Link to={session ? roleHomePath(session.role) : '/'} className="brand-wordmark">
          <span className="bi-en">Organic Carbon Farming</span>
          <span className="bi-te">ఆర్గానిక్ కార్బన్ ఫార్మింగ్</span>
        </Link>
        {session && (
          <div className="header-actions">
            <span className="header-role-badge">{session.role}</span>
            <button type="button" className="logout-icon-btn" onClick={logout}>
              <Bi id="logoutButton" />
            </button>
          </div>
        )}
      </header>

      {navItems.length > 0 && (
        <nav className="app-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `nav-pill${isActive ? ' active' : ''}`}
            >
              {strings[item.labelKey].en} / {strings[item.labelKey].te}
            </NavLink>
          ))}
        </nav>
      )}

      <main className="app-main">
        <div className={wide ? 'screen wide' : 'screen'}>{children}</div>
      </main>
    </div>
  );
}

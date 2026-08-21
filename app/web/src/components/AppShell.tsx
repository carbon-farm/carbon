import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../auth/roleHome';
import { getUnreadCount } from '../api/notifications';
import { Bi } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';

const UNREAD_POLL_MS = 60_000;

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
    { to: '/knowledge', labelKey: 'knowledgeEyebrow' },
  ],
  EXPERT: [
    { to: '/expert/cases', labelKey: 'expertCasesTitle' },
    { to: '/expert/articles', labelKey: 'myArticlesTitle' },
    { to: '/knowledge', labelKey: 'knowledgeEyebrow' },
  ],
  ADMINISTRATOR: [
    { to: '/admin', labelKey: 'adminHubTitle' },
    { to: '/admin/staff', labelKey: 'staffLinkTitle' },
    { to: '/admin/credentials', labelKey: 'credentialsLinkTitle' },
    { to: '/admin/taxonomy', labelKey: 'taxonomyLinkTitle' },
    { to: '/admin/audit', labelKey: 'auditLogLinkTitle' },
    { to: '/admin/reports', labelKey: 'reportsLinkTitle' },
    { to: '/knowledge', labelKey: 'knowledgeEyebrow' },
  ],
};

// Persistent header + role-aware nav — every authenticated page renders
// inside this instead of building its own ad-hoc top-bar, so the product
// reads as one continuous application rather than a stack of disconnected
// forms (direct user feedback: it didn't).
export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { session, logout } = useAuth();
  const navItems = session ? (NAV_BY_ROLE[session.role] ?? []) : [];
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    const token = session.accessToken;
    let cancelled = false;
    function poll() {
      getUnreadCount(token)
        .then((count) => {
          if (!cancelled) setUnreadCount(count);
        })
        .catch(() => {});
    }
    poll();
    const interval = setInterval(poll, UNREAD_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session]);

  return (
    <div>
      <header className="app-header">
        <Link to={session ? roleHomePath(session.role) : '/'} className="brand-wordmark">
          <span className="bi-en">Organic Carbon Farming</span>
          <span className="bi-te">ఆర్గానిక్ కార్బన్ ఫార్మింగ్</span>
        </Link>
        {session && (
          <div className="header-actions">
            <Link to="/notifications" className="notif-bell-btn" title={strings.notificationBellLabel.en}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </Link>
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

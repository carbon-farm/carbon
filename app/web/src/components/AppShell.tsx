import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../auth/roleHome';
import { getUnreadCount } from '../api/notifications';
import { getMe, type AdminUser } from '../api/admin';
import { PaymentStrip } from './PaymentStrip';
import { MainNav } from './MainNav';
import { Tour } from '../tour/Tour';
import { audienceFor } from '../tour/steps';
import { Bi } from '../i18n/Bi';
import { strings } from '../i18n/strings';

const UNREAD_POLL_MS = 60_000;

// Persistent header + role-aware nav — every authenticated page renders
// inside this instead of building its own ad-hoc top-bar, so the product
// reads as one continuous application rather than a stack of disconnected
// forms (direct user feedback: it didn't).
export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { session, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [me, setMe] = useState<AdminUser | null>(null);

  // Who is logged in, shown in the header on every screen. Failure just hides it.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setMe(null); // never show the previous user's name while the new one loads
    getMe(session.accessToken)
      .then((u) => {
        if (!cancelled) setMe(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session]);

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
          <span className="bi-en">
            {strings.brand.en} <small className="brand-group">· {strings.brandGroup.en}</small>
          </span>
          <span className="bi-te">
            {strings.brand.te} <small className="brand-group">· {strings.brandGroup.te}</small>
          </span>
        </Link>
        {!session && (
          <div className="header-actions" data-tour="auth">
            <Link to="/help" className="link-button" data-tour="help">
              <Bi id="helpNavTitle" />
            </Link>
            <Link to="/login" className="link-button">
              <Bi id="loginLink" />
            </Link>
            <Link to="/register" className="link-button">
              <Bi id="registerLink" />
            </Link>
          </div>
        )}
        {session && (
          <div className="header-actions">
            <Link to="/help" className="link-button" data-tour="help">
              <Bi id="helpNavTitle" />
            </Link>
            <Link to="/notifications" className="notif-bell-btn" data-tour="bell" title={strings.notificationBellLabel.en}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </Link>
            <Link to="/account/password" className="link-button">
              <Bi id="accountNavTitle" />
            </Link>
            {me && (
              <div className="header-user" data-tour="user" title={`${me.name} · ${me.userCode ?? ''}`}>
                <span className="header-user-name">{me.name}</span>
                {me.userCode && <span className="header-user-code">{me.userCode}</span>}
              </div>
            )}
            <span className="header-role-badge">{session.role}</span>
            <button type="button" className="logout-icon-btn" onClick={logout}>
              <Bi id="logoutButton" />
            </button>
          </div>
        )}
      </header>

      <PaymentStrip />
      <Tour audience={audienceFor(session?.role)} userId={session ? me?.id : null} ready={!session || !!me} />

      <MainNav role={session ? session.role : 'GUEST'} />

      <main className="app-main">
        <div className={wide ? 'screen wide' : 'screen'}>{children}</div>
      </main>
    </div>
  );
}

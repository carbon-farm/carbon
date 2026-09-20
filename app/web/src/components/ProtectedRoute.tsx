import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../auth/roleHome';
import { AppShell } from './AppShell';
import { MembershipGate } from './MembershipGate';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  wide?: boolean;
  // Farm-advice screens: a member needs an active (paid or free) membership to see them.
  membership?: boolean;
}

export function ProtectedRoute({ children, roles, wide, membership }: ProtectedRouteProps) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  // Wrong-role access (e.g. an Expert hitting a Member-only route) redirects
  // to that user's own home rather than rendering a page whose API calls
  // are role-gated on the backend and would just 403.
  if (roles && !roles.includes(session.role)) {
    return <Navigate to={roleHomePath(session.role)} replace />;
  }
  return <AppShell wide={wide}>{membership ? <MembershipGate>{children}</MembershipGate> : children}</AppShell>;
}

// A screen anyone can open, signed in or not (the shop window, product pages, the cart).
// Signed-in users get their usual header/nav; visitors get a Log in / Register header.
export function OpenRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { session } = useAuth();
  // Staff have their own homes; the customer-facing shop screens stay open to them too.
  if (session && roles && !roles.includes(session.role)) {
    return <Navigate to={roleHomePath(session.role)} replace />;
  }
  return <AppShell>{children}</AppShell>;
}

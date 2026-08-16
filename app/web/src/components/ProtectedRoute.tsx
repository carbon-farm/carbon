import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../auth/roleHome';
import { AppShell } from './AppShell';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  wide?: boolean;
}

export function ProtectedRoute({ children, roles, wide }: ProtectedRouteProps) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  // Wrong-role access (e.g. an Expert hitting a Farmer-only route) redirects
  // to that farmer's own home rather than rendering a page whose API calls
  // are role-gated on the backend and would just 403.
  if (roles && !roles.includes(session.role)) {
    return <Navigate to={roleHomePath(session.role)} replace />;
  }
  return <AppShell wide={wide}>{children}</AppShell>;
}

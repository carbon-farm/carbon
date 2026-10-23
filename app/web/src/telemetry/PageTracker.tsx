import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { normalizePath, track } from './track';

// Counts which screens are opened (ids removed), so the Administrator's Usage screen can show
// what people actually use.
export function PageTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    track('page', normalizePath(pathname));
  }, [pathname]);
  return null;
}

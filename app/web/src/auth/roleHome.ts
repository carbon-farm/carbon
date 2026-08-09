// Where each role lands after login. FARMER/MODERATOR/EXPERT/ADMINISTRATOR
// have real screens; VENDOR/SUPPORT_AGENT don't yet — they fall through to
// the not-built notice rather than hitting a role-gated endpoint and
// crashing.
export function roleHomePath(role: string): string {
  switch (role) {
    case 'FARMER':
      return '/dashboard';
    case 'MODERATOR':
      return '/moderator/queue';
    case 'EXPERT':
      return '/expert/cases';
    case 'ADMINISTRATOR':
      return '/admin';
    default:
      return '/no-portal';
  }
}

// Where each role lands after login. FARMER/MODERATOR/EXPERT/ADMINISTRATOR/
// VENDOR have real screens; SUPPORT_AGENT doesn't yet — it falls through to
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
    case 'VENDOR':
      return '/marketplace/vendor';
    default:
      return '/no-portal';
  }
}

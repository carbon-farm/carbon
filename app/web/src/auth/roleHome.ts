// Where each role lands after login. Every role now has a real screen.
export function roleHomePath(role: string): string {
  switch (role) {
    case 'MEMBER':
      return '/marketplace'; // open to everyone; advice features unlock with a membership
    case 'MODERATOR':
      return '/moderator/queue';
    case 'EXPERT':
      return '/expert/cases';
    case 'ADMINISTRATOR':
      return '/admin';
    case 'VENDOR':
      return '/marketplace/vendor';
    case 'SUPPORT_AGENT':
      return '/support/dispatch-queue';
    default:
      return '/no-portal';
  }
}

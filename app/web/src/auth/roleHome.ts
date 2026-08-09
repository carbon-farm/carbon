// Where each role lands after login. FARMER/MODERATOR/EXPERT have real
// screens; ADMINISTRATOR/VENDOR/SUPPORT_AGENT don't have a web UI yet (Stage
// 1/2 only built the farmer, moderator triage, and expert case-work
// surfaces) — they fall through to the not-built notice rather than hitting
// a farmer-only endpoint like /farms and crashing.
export function roleHomePath(role: string): string {
  switch (role) {
    case 'FARMER':
      return '/dashboard';
    case 'MODERATOR':
      return '/moderator/queue';
    case 'EXPERT':
      return '/expert/cases';
    default:
      return '/no-portal';
  }
}

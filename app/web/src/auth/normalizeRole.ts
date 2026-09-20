// FARMER and CUSTOMER were merged into a single MEMBER account type. The server already
// reports MEMBER; this also covers a session saved in this browser before the merge.
export function normalizeRole(role: string): string {
  return role === 'FARMER' || role === 'CUSTOMER' ? 'MEMBER' : role;
}

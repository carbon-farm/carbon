// FARMER and CUSTOMER were merged into MEMBER (one account type for the whole app).
// Until every existing row and every still-valid login token has moved over, both old
// values are read as MEMBER at the two doors a role enters through — the JWT strategy
// (every request) and the login/verify responses — so no other code needs to know the
// legacy values exist.
const LEGACY_MEMBER_ROLES = new Set(['FARMER', 'CUSTOMER']);

export function normalizeRole<T extends string>(role: T): T | 'MEMBER' {
  return LEGACY_MEMBER_ROLES.has(role) ? 'MEMBER' : role;
}

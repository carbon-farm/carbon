import { apiRequest } from './client';

export interface AdminUser {
  id: string;
  mobileNumber: string;
  role: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export function listUsers(token: string, role?: string) {
  return apiRequest<AdminUser[]>(`/users${role ? `?role=${role}` : ''}`, { token });
}

export function createStaffUser(
  token: string,
  data: { mobileNumber: string; temporaryPassword: string; name: string; role: string },
) {
  return apiRequest<AdminUser>('/users/staff', { method: 'POST', body: data, token });
}

export interface PendingCredential {
  id: string;
  userId: string;
  qualification: string;
  licenseNumber: string | null;
  credentialStatus: string;
  submittedAt: string;
  user: { id: string; name: string; mobileNumber: string };
}

export function listPendingCredentials(token: string) {
  return apiRequest<PendingCredential[]>('/experts/credentials/pending', { token });
}

export function verifyCredential(token: string, expertProfileId: string, approve: boolean, reason?: string) {
  return apiRequest(`/experts/credentials/${expertProfileId}/verify`, {
    method: 'PATCH',
    body: { approve, reason },
    token,
  });
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actor: { id: string; name: string; role: string } | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: string;
}

export function listAuditLog(token: string, filters: { entityType?: string; from?: string; to?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.entityType) params.set('entityType', filters.entityType);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const qs = params.toString();
  return apiRequest<AuditLogEntry[]>(`/audit${qs ? `?${qs}` : ''}`, { token });
}

export function listAuditEntityTypes(token: string) {
  return apiRequest<string[]>('/audit/entity-types', { token });
}

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

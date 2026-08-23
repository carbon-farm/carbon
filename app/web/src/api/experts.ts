import { apiRequest } from './client';

export interface VerifiedExpert {
  id: string;
  userId: string;
  user: { id: string; name: string; mobileNumber: string };
}

export type CredentialStatus = 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface MyExpertProfile {
  id: string;
  qualification: string | null;
  licenseNumber: string | null;
  credentialStatus: CredentialStatus;
  submittedAt: string | null;
  verifiedAt: string | null;
}

export function listVerifiedExperts(token: string) {
  return apiRequest<VerifiedExpert[]>('/experts/verified', { token });
}

export function getMyExpertProfile(token: string) {
  return apiRequest<MyExpertProfile>('/experts/me', { token });
}

export function submitMyCredentials(token: string, data: { qualification: string; licenseNumber?: string }) {
  return apiRequest<MyExpertProfile>('/experts/me/credentials', { method: 'PATCH', body: data, token });
}

import { apiRequest } from './client';

export interface VerifiedExpert {
  id: string;
  userId: string;
  user: { id: string; name: string; mobileNumber: string };
}

export function listVerifiedExperts(token: string) {
  return apiRequest<VerifiedExpert[]>('/experts/verified', { token });
}

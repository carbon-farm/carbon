import { apiRequest } from './client';

export type HariharaaSubscriptionStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';

export interface PublicSettings {
  subscriptionPriceInr: number;
  payeeName: string;
  primaryUpiId: string;
  secondaryUpiId: string | null;
}

export interface AdminSettings extends PublicSettings {
  id: string;
  vendorProfileId: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  status: HariharaaSubscriptionStatus;
  paymentReference: string | null;
  note: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  activeUntil: string | null;
}

export interface PendingSubscriptionClaim extends Subscription {
  user: { id: string; name: string; mobileNumber: string };
}

export function getPublicSettings() {
  return apiRequest<PublicSettings>('/hariharaa/settings/public');
}

export function getAdminSettings(token: string) {
  return apiRequest<AdminSettings | null>('/hariharaa/settings', { token });
}

export function updateSettings(
  token: string,
  data: { subscriptionPriceInr: number; payeeName?: string; primaryUpiId: string; secondaryUpiId?: string },
) {
  return apiRequest<AdminSettings>('/hariharaa/settings', { method: 'PATCH', body: data, token });
}

export function submitClaim(token: string, data: { paymentReference: string; note?: string }) {
  return apiRequest<Subscription>('/hariharaa/subscription/claim', { method: 'POST', body: data, token });
}

export function getMySubscription(token: string) {
  return apiRequest<Subscription | null>('/hariharaa/subscription/me', { token });
}

export function listPendingClaims(token: string) {
  return apiRequest<PendingSubscriptionClaim[]>('/hariharaa/subscription/pending', { token });
}

export function reviewClaim(token: string, id: string, approve: boolean, reason?: string) {
  return apiRequest<Subscription>(`/hariharaa/subscription/${id}/review`, { method: 'POST', body: { approve, reason }, token });
}

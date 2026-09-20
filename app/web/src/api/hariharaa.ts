import { apiRequest } from './client';

export type PaymentStatus = 'CREATED' | 'CLAIMED' | 'VERIFIED' | 'REJECTED';
// Derived on the server (see HariharaaService.getMyStatus) — the UI never works it out itself.
export type SubscriptionState = 'NOT_PAID' | 'AWAITING_VERIFICATION' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';

// What the public (logged-out) landing page may know — no UPI ID, no payment link.
export interface PublicSettings {
  subscriptionPriceInr: number;
  payeeName: string;
}

export interface AdminSettings {
  id: string;
  subscriptionPriceInr: number;
  payeeName: string;
  primaryUpiId: string;
  secondaryUpiId: string | null;
  upiAid: string | null;
  vendorProfileId: string | null;
}

export interface MySubscription {
  userCode: string | null;
  hasAccess: boolean;
  activeUntil: string | null;
  state: SubscriptionState;
  latestPayment: {
    id: string;
    status: PaymentStatus;
    amountInr: number;
    utr: string | null;
    rejectionReason: string | null;
    createdAt: string;
    claimedAt: string | null;
  } | null;
}

export interface StartedPayment {
  paymentId: string;
  amountInr: number;
  userCode: string | null;
  payeeName: string;
  upiLink: string;
}

export interface PendingPayment {
  id: string;
  amountInr: number;
  utr: string | null;
  note: string | null;
  claimedAt: string | null;
  user: { id: string; name: string; mobileNumber: string; userCode: string | null };
}

export function getPublicSettings() {
  return apiRequest<PublicSettings>('/hariharaa/settings/public');
}

export function getAdminSettings(token: string) {
  return apiRequest<AdminSettings | null>('/hariharaa/settings', { token });
}

export function updateSettings(
  token: string,
  data: {
    subscriptionPriceInr: number;
    payeeName?: string;
    primaryUpiId: string;
    secondaryUpiId?: string;
    vendorProfileId?: string;
    upiAid?: string;
  },
) {
  return apiRequest<AdminSettings>('/hariharaa/settings', { method: 'PATCH', body: data, token });
}

export function getMySubscription(token: string) {
  return apiRequest<MySubscription | null>('/hariharaa/subscription/me', { token });
}

// Step 1: the customer taps Pay — returns the QR link for this payment.
export function startPayment(token: string) {
  return apiRequest<StartedPayment>('/hariharaa/payments/start', { method: 'POST', token });
}

// Step 2: after paying, the customer types the UTR from their UPI app.
export function claimPayment(token: string, paymentId: string, data: { utr: string; note?: string }) {
  return apiRequest<{ id: string }>(`/hariharaa/payments/${paymentId}/claim`, { method: 'POST', body: data, token });
}

export function listPendingPayments(token: string) {
  return apiRequest<PendingPayment[]>('/hariharaa/payments/pending', { token });
}

export function reviewPayment(token: string, id: string, approve: boolean, reason?: string) {
  return apiRequest(`/hariharaa/payments/${id}/review`, { method: 'POST', body: { approve, reason }, token });
}

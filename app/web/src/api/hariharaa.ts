import { apiRequest } from './client';

export type PaymentStatus = 'CREATED' | 'CLAIMED' | 'VERIFIED' | 'REJECTED';
// Derived on the server (see HariharaaService.getMyStatus) — the UI never works it out itself.
export type SubscriptionState = 'NOT_PAID' | 'AWAITING_VERIFICATION' | 'ACTIVE' | 'FREE' | 'EXPIRED' | 'REJECTED' | 'OPEN';

// What the public (logged-out) landing page may know — no UPI ID, no payment link.
// One thing a member can buy: a price for a length of access.
export interface PublicPlan {
  id: string;
  name: string;
  nameTe: string | null;
  description: string | null;
  priceInr: number;
  periodDays: number;
}

export interface PublicSettings {
  subscriptionPriceInr: number; // the cheapest plan (kept for older screens)
  payeeName: string;
  membershipRequired: boolean;
  plans: PublicPlan[];
}

export interface AdminPlan extends PublicPlan {
  isActive: boolean;
  sortOrder: number;
  paymentCount: number;
  createdAt: string;
}

export interface AdminSettings {
  id: string;
  subscriptionPriceInr: number; // legacy — prices live on the plans
  payeeName: string;
  membershipRequired: boolean;
  primaryUpiId: string;
  secondaryUpiId: string | null;
  upiAid: string | null;
  vendorProfileId: string | null;
}

export interface MySubscription {
  userCode: string | null;
  hasAccess: boolean;
  accessKind: 'PAID' | 'FREE' | 'NONE' | 'OPEN';
  membershipRequired: boolean;
  daysLeft: number | null; // whole days of access left, when there is access
  plans: PublicPlan[];
  freeNote: string | null;
  activeUntil: string | null;
  state: SubscriptionState;
  latestPayment: {
    id: string;
    status: PaymentStatus;
    amountInr: number;
    planName: string | null;
    periodDays: number;
    utr: string | null;
    rejectionReason: string | null;
    createdAt: string;
    claimedAt: string | null;
  } | null;
}

export interface StartedPayment {
  paymentId: string;
  amountInr: number;
  planName: string | null;
  periodDays: number;
  userCode: string | null;
  payeeName: string;
  upiLink: string;
}

export interface PendingPayment {
  id: string;
  amountInr: number;
  planName: string | null;
  periodDays: number;
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
  // An empty string for the spare UPI ID, merchant id or vendor link removes it.
  data: {
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
export function startPayment(token: string, planId?: string) {
  return apiRequest<StartedPayment>('/hariharaa/payments/start', { method: 'POST', body: planId ? { planId } : {}, token });
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

export type MemberLabel = 'PAID' | 'FREE' | 'AWAITING' | 'EXPIRED' | 'UNPAID';

export interface Member {
  id: string;
  userCode: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
  createdAt: string;
  label: MemberLabel;
  paidUntil: string | null;
  freeUntil: string | null;
  freeNote: string | null;
}

export function listMembers(token: string) {
  return apiRequest<Member[]>('/hariharaa/members', { token });
}

// until: "YYYY-MM-DD" from a date picker (the server treats it as the end of that day in India).
export function grantFreeAccess(token: string, userId: string, data: { until: string; note?: string }) {
  return apiRequest(`/hariharaa/members/${userId}/free`, { method: 'POST', body: data, token });
}

export function revokeFreeAccess(token: string, userId: string) {
  return apiRequest(`/hariharaa/members/${userId}/free`, { method: 'DELETE', token });
}

// ---------- Membership plans (Administrator) ----------

export function listPlans(token: string) {
  return apiRequest<AdminPlan[]>('/hariharaa/plans/manage', { token });
}

export type PlanInput = { name: string; nameTe?: string; description?: string; priceInr: number; periodDays: number; sortOrder?: number; isActive?: boolean };

export function createPlan(token: string, data: PlanInput) {
  return apiRequest<AdminPlan>('/hariharaa/plans', { method: 'POST', body: data, token });
}

export function updatePlan(token: string, id: string, data: Partial<PlanInput>) {
  return apiRequest<AdminPlan>(`/hariharaa/plans/${id}`, { method: 'PATCH', body: data, token });
}

// The master switch: when off, nobody needs a membership.
export function setMembershipRequired(token: string, required: boolean) {
  return apiRequest<{ membershipRequired: boolean }>('/hariharaa/membership-required', { method: 'PATCH', body: { required }, token });
}

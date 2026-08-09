import { apiRequest } from './client';

export type CaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'EXPERT_WORKING'
  | 'WAITING_FARMER'
  | 'ANSWERED'
  | 'FARMER_CONFIRMED'
  | 'REOPENED'
  | 'CLOSED';

export type ClosureReason = 'RESOLVED' | 'ABANDONED';

export interface Case {
  id: string;
  caseNumber: string | null;
  farmerId: string;
  farmLandId: string;
  farmLand: { id: string; label: string };
  categoryId: string;
  category: { id: string; name: string };
  problemDescription: string;
  evidenceNotes: string | null;
  status: CaseStatus;
  closureReason: ClosureReason | null;
  assignedExpertId: string | null;
  priorityRequested: boolean;
  isPriority: boolean;
  followUpQuestion: string | null;
  followUpResponse: string | null;
  resolutionNotes: string | null;
  submittedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function listMyCases(token: string) {
  return apiRequest<Case[]>('/cases/mine', { token });
}

export function getCase(token: string, id: string) {
  return apiRequest<Case>(`/cases/${id}`, { token });
}

export function createCaseDraft(
  token: string,
  data: { farmLandId: string; categoryId: string; problemDescription: string; evidenceNotes?: string; requestPriority?: boolean },
) {
  return apiRequest<Case>('/cases', { method: 'POST', body: data, token });
}

export function updateCaseDraft(
  token: string,
  id: string,
  data: { farmLandId?: string; categoryId?: string; problemDescription?: string; evidenceNotes?: string },
) {
  return apiRequest<Case>(`/cases/${id}`, { method: 'PATCH', body: data, token });
}

export function submitCase(token: string, id: string) {
  return apiRequest<Case>(`/cases/${id}/submit`, { method: 'POST', token });
}

export function respondToFollowUp(token: string, id: string, answer: string) {
  return apiRequest<Case>(`/cases/${id}/respond-followup`, { method: 'POST', body: { answer }, token });
}

export function confirmCase(token: string, id: string) {
  return apiRequest<Case>(`/cases/${id}/confirm`, { method: 'POST', token });
}

export function disputeCase(token: string, id: string) {
  return apiRequest<Case>(`/cases/${id}/dispute`, { method: 'POST', token });
}

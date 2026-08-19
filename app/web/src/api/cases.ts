import { apiRequest, apiUpload } from './client';

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
  cropId: string | null;
  crop: { id: string; name: string } | null;
  problemDescription: string;
  evidenceNotes: string | null;
  evidenceMediaUrls: string[];
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
  knowledgeArticle: { id: string; title: string; status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' } | null;
}

export function listMyCases(token: string) {
  return apiRequest<Case[]>('/cases/mine', { token });
}

export function listAssignedCases(token: string) {
  return apiRequest<Case[]>('/cases/assigned', { token });
}

export function listQueueCases(token: string) {
  return apiRequest<Case[]>('/cases/queue', { token });
}

export function getCase(token: string, id: string) {
  return apiRequest<Case>(`/cases/${id}`, { token });
}

export function createCaseDraft(
  token: string,
  data: {
    farmLandId: string;
    categoryId: string;
    cropId?: string;
    problemDescription: string;
    evidenceNotes?: string;
    requestPriority?: boolean;
  },
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

export function startReviewCase(token: string, id: string) {
  return apiRequest<Case>(`/cases/${id}/review`, { method: 'POST', token });
}

export function assignCase(token: string, id: string, expertId: string) {
  return apiRequest<Case>(`/cases/${id}/assign`, { method: 'POST', body: { expertId }, token });
}

export function startWorkCase(token: string, id: string) {
  return apiRequest<Case>(`/cases/${id}/start-work`, { method: 'POST', token });
}

export function requestFollowUpOnCase(token: string, id: string, question: string) {
  return apiRequest<Case>(`/cases/${id}/request-followup`, { method: 'POST', body: { question }, token });
}

export function answerCase(token: string, id: string, resolutionNotes: string) {
  return apiRequest<Case>(`/cases/${id}/answer`, { method: 'POST', body: { resolutionNotes }, token });
}

export function uploadCaseEvidence(token: string, id: string, file: File) {
  return apiUpload<Case>(`/cases/${id}/evidence`, file, token);
}

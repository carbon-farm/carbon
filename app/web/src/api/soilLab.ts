import { apiRequest, apiUpload } from './client';

export type SoilSampleStatus = 'CREATED' | 'DISPATCHED' | 'RECEIVED' | 'TESTED' | 'REPORT_AVAILABLE';

export interface SoilSample {
  id: string;
  sampleCode: string;
  farmerId: string;
  farmer?: { id: string; name: string; mobileNumber: string };
  farmLandId: string;
  farmLand: { id: string; label: string };
  caseId: string | null;
  case: { id: string; caseNumber: string | null } | null;
  collectionVideoWatched: boolean;
  status: SoilSampleStatus;
  dispatchedAt: string | null;
  receivedAt: string | null;
  testedAt: string | null;
  reportUrl: string | null;
  reportAvailableAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createSample(token: string, data: { farmLandId: string; caseId?: string; collectionVideoWatched: boolean }) {
  return apiRequest<SoilSample>('/soil-samples', { method: 'POST', body: data, token });
}

export function listMySamples(token: string) {
  return apiRequest<SoilSample[]>('/soil-samples/mine', { token });
}

export function listQueueSamples(token: string) {
  return apiRequest<SoilSample[]>('/soil-samples/queue', { token });
}

export function getSample(token: string, id: string) {
  return apiRequest<SoilSample>(`/soil-samples/${id}`, { token });
}

export function dispatchSample(token: string, id: string) {
  return apiRequest<SoilSample>(`/soil-samples/${id}/dispatch`, { method: 'POST', token });
}

export function markSampleReceived(token: string, id: string) {
  return apiRequest<SoilSample>(`/soil-samples/${id}/receive`, { method: 'POST', token });
}

export function markSampleTested(token: string, id: string) {
  return apiRequest<SoilSample>(`/soil-samples/${id}/test`, { method: 'POST', token });
}

export function uploadSampleReport(token: string, id: string, file: File) {
  return apiUpload<SoilSample>(`/soil-samples/${id}/report`, file, token);
}

import { apiRequest } from './client';

export interface CaseCategory {
  id: string;
  name: string;
}

export function listCaseCategories(token: string) {
  return apiRequest<CaseCategory[]>('/configuration/case-categories', { token });
}

import { apiRequest } from './client';

export interface ReportsSummary {
  totalCases: number;
  openCases: number;
  resolvedCases: number;
  abandonedCases: number;
  avgResolutionDays: number | null;
  casesByStatus: { status: string; count: number }[];
  casesByCategory: { category: string; count: number }[];
  casesByCrop: { crop: string; count: number }[];
  articlesByStatus: { status: string; count: number }[];
  usersByRole: { role: string; count: number }[];
  expertWorkload: { expertId: string; name: string; assignedCount: number; resolvedCount: number }[];
}

export function getReportsSummary(token: string) {
  return apiRequest<ReportsSummary>('/reports/summary', { token });
}

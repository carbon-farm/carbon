import { apiRequest } from './client';

export type ArticleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';

export interface Article {
  id: string;
  sourceCaseId: string;
  authorId: string;
  author?: { id: string; name: string };
  title: string;
  cropId: string | null;
  crop: { id: string; name: string } | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  symptoms: string | null;
  problemDescription: string;
  expertSolution: string;
  evidenceMediaUrls: string[];
  tags: { id: string; name: string }[];
  status: ArticleStatus;
  rejectionReason: string | null;
  version: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// No createArticleDraft() — articles are never created directly by a
// client, only auto-generated when a case closes (see CasesService.confirm).

export function listMyArticles(token: string) {
  return apiRequest<Article[]>('/knowledge/mine', { token });
}

export function listPendingArticles(token: string) {
  return apiRequest<Article[]>('/knowledge/pending', { token });
}

export function listPublishedArticles(token: string, categoryId?: string) {
  return apiRequest<Article[]>(`/knowledge/published${categoryId ? `?categoryId=${categoryId}` : ''}`, { token });
}

export function getArticle(token: string, id: string) {
  return apiRequest<Article>(`/knowledge/${id}`, { token });
}

export function updateArticleDraft(
  token: string,
  id: string,
  data: { title?: string; cropId?: string; categoryId?: string; symptoms?: string; expertSolution?: string; tagIds?: string[] },
) {
  return apiRequest<Article>(`/knowledge/${id}`, { method: 'PATCH', body: data, token });
}

export function submitArticle(token: string, id: string) {
  return apiRequest<Article>(`/knowledge/${id}/submit`, { method: 'POST', token });
}

export function approveArticle(token: string, id: string) {
  return apiRequest<Article>(`/knowledge/${id}/approve`, { method: 'POST', token });
}

export function rejectArticle(token: string, id: string, reason: string) {
  return apiRequest<Article>(`/knowledge/${id}/reject`, { method: 'POST', body: { reason }, token });
}

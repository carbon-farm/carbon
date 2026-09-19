import { apiRequest } from './client';

export type MediaKind = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'OTHER';
export type MediaSource = 'CASE_EVIDENCE' | 'ARTICLE_EVIDENCE' | 'LESSON' | 'SOIL_REPORT' | 'PRODUCT_IMAGE';

export interface MediaItem {
  url: string;
  kind: MediaKind;
  source: MediaSource;
  ownerId: string;
  ownerLabel: string;
  createdAt: string;
}

export function listMedia(token: string) {
  return apiRequest<MediaItem[]>('/media', { token });
}

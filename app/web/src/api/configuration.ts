import { apiRequest } from './client';

export interface CaseCategory {
  id: string;
  name: string;
}

export interface Crop {
  id: string;
  name: string;
  // Telugu name, shown beside the English one; missing for crops that have none yet
  nameTe?: string | null;
  // keys of the picker groups the crop is filed under (always groups with no sub-groups)
  categories: string[];
}

// A group crops are filed under: a main group, or (parentKey) a sub-group of one.
export interface CropCategory {
  id: string;
  key: string;
  parentKey: string | null;
  nameEn: string;
  nameTe: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
  state: string;
}

export function listCaseCategories(token: string) {
  return apiRequest<CaseCategory[]>('/configuration/case-categories', { token });
}

export function createCaseCategory(token: string, name: string) {
  return apiRequest<CaseCategory>('/configuration/case-categories', { method: 'POST', body: { name }, token });
}

export function listCrops(token: string) {
  return apiRequest<Crop[]>('/configuration/crops', { token });
}

export function createCrop(token: string, body: { name: string; nameTe?: string; categories?: string[] }) {
  return apiRequest<Crop>('/configuration/crops', { method: 'POST', body, token });
}

export function listCropCategories(token: string) {
  return apiRequest<CropCategory[]>('/configuration/crop-categories', { token });
}

export function createCropCategory(token: string, body: { nameEn: string; nameTe: string; parentKey?: string }) {
  return apiRequest<CropCategory>('/configuration/crop-categories', { method: 'POST', body, token });
}

export function updateCropCategory(
  token: string,
  id: string,
  body: { nameEn?: string; nameTe?: string; sortOrder?: number; isActive?: boolean },
) {
  return apiRequest<CropCategory>(`/configuration/crop-categories/${id}`, { method: 'PATCH', body, token });
}

// Telugu name and groups only — the English name cannot be changed.
export function updateCrop(token: string, id: string, body: { nameTe?: string; categories?: string[] }) {
  return apiRequest<Crop>(`/configuration/crops/${id}`, { method: 'PATCH', body, token });
}

export function listTags(token: string) {
  return apiRequest<Tag[]>('/configuration/tags', { token });
}

export function createTag(token: string, name: string) {
  return apiRequest<Tag>('/configuration/tags', { method: 'POST', body: { name }, token });
}

export function listRegions(token: string) {
  return apiRequest<Region[]>('/configuration/regions', { token });
}

export function createRegion(token: string, name: string, state: string) {
  return apiRequest<Region>('/configuration/regions', { method: 'POST', body: { name, state }, token });
}

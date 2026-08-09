import { apiRequest } from './client';

export interface CaseCategory {
  id: string;
  name: string;
}

export interface Crop {
  id: string;
  name: string;
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

export function createCrop(token: string, name: string) {
  return apiRequest<Crop>('/configuration/crops', { method: 'POST', body: { name }, token });
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

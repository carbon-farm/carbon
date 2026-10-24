import { apiRequest } from './client';

export interface FarmLand {
  id: string;
  label: string;
  address: string;
  landSizeAcres: number;
  primaryCrops: string[];
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

// A parcel nobody has used is deleted; one with cases or soil tests is hidden (archived) so they stay safe.
export function deleteFarm(token: string, id: string) {
  return apiRequest<{ archived: boolean; message: string }>(`/farms/${id}`, { method: 'DELETE', token });
}

export function listFarms(token: string) {
  return apiRequest<FarmLand[]>('/farms', { token });
}

export function createFarm(
  token: string,
  data: {
    label: string;
    address: string;
    landSizeAcres: number;
    primaryCrops: string[];
    latitude?: number;
    longitude?: number;
  },
) {
  return apiRequest<FarmLand>('/farms', { method: 'POST', body: data, token });
}

export function updateFarm(
  token: string,
  id: string,
  data: { label?: string; address?: string; landSizeAcres?: number; primaryCrops?: string[]; latitude?: number; longitude?: number },
) {
  return apiRequest<FarmLand>(`/farms/${id}`, { method: 'PATCH', body: data, token });
}

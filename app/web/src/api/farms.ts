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

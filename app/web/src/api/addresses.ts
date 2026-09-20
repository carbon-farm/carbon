import { apiRequest } from './client';

export interface Address {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type AddressInput = {
  label?: string;
  recipientName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export function listAddresses(token: string) {
  return apiRequest<Address[]>('/addresses', { token });
}

export function createAddress(token: string, data: AddressInput) {
  return apiRequest<Address>('/addresses', { method: 'POST', body: data, token });
}

export function updateAddress(token: string, id: string, data: Partial<AddressInput>) {
  return apiRequest<Address>(`/addresses/${id}`, { method: 'PATCH', body: data, token });
}

export function setDefaultAddress(token: string, id: string) {
  return apiRequest<Address>(`/addresses/${id}/default`, { method: 'POST', token });
}

export function deleteAddress(token: string, id: string) {
  return apiRequest<{ deleted: boolean }>(`/addresses/${id}`, { method: 'DELETE', token });
}

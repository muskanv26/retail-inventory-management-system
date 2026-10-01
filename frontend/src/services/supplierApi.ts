import { apiClient } from './apiClient';
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../types/supplier';

export const supplierApi = {
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<Supplier[]>('/suppliers');
    return response.data;
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  getSupplierByCode: async (code: string): Promise<Supplier> => {
    const response = await apiClient.get<Supplier>(`/suppliers/code/${code}`);
    return response.data;
  },

  createSupplier: async (request: CreateSupplierRequest): Promise<Supplier> => {
    const response = await apiClient.post<Supplier>('/suppliers', request);
    return response.data;
  },

  updateSupplier: async (id: string, request: UpdateSupplierRequest): Promise<Supplier> => {
    const response = await apiClient.put<Supplier>(`/suppliers/${id}`, request);
    return response.data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};

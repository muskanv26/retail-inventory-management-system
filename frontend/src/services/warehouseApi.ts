import { apiClient } from './apiClient';
import type { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from '../types/warehouse';

export const warehouseApi = {
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get<Warehouse[]>('/warehouses');
    return response.data;
  },

  getWarehouseById: async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },

  getWarehouseByCode: async (code: string): Promise<Warehouse> => {
    const response = await apiClient.get<Warehouse>(`/warehouses/code/${code}`);
    return response.data;
  },

  createWarehouse: async (request: CreateWarehouseRequest): Promise<Warehouse> => {
    const response = await apiClient.post<Warehouse>('/warehouses', request);
    return response.data;
  },

  updateWarehouse: async (id: string, request: UpdateWarehouseRequest): Promise<Warehouse> => {
    const response = await apiClient.put<Warehouse>(`/warehouses/${id}`, request);
    return response.data;
  },

  deleteWarehouse: async (id: string): Promise<void> => {
    await apiClient.delete(`/warehouses/${id}`);
  },
};

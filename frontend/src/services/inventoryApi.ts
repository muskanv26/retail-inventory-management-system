import { apiClient } from './apiClient';
import type { Inventory, CreateInventoryRequest, UpdateInventoryRequest } from '../types/inventory';

export const inventoryApi = {
  getAllInventory: async (productId?: string, warehouseCode?: string): Promise<Inventory[]> => {
    const params: Record<string, string> = {};
    if (productId) params.productId = productId;
    if (warehouseCode) params.warehouseCode = warehouseCode;

    const response = await apiClient.get<Inventory[]>('/inventory', { params });
    return response.data;
  },

  getInventoryById: async (id: string): Promise<Inventory> => {
    const response = await apiClient.get<Inventory>(`/inventory/${id}`);
    return response.data;
  },

  createInventory: async (request: CreateInventoryRequest): Promise<Inventory> => {
    const response = await apiClient.post<Inventory>('/inventory', request);
    return response.data;
  },

  updateInventory: async (id: string, request: UpdateInventoryRequest): Promise<Inventory> => {
    const response = await apiClient.put<Inventory>(`/inventory/${id}`, request);
    return response.data;
  },

  deleteInventory: async (id: string): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`);
  },
};

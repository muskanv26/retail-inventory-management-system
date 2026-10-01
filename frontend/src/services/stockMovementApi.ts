import { apiClient } from './apiClient';
import type { StockMovementResponse, StockAdjustmentRequest } from '../types/stockMovement';

export const stockMovementApi = {
  getStockMovements: async (
    inventoryId?: string,
    productId?: string,
    warehouseCode?: string
  ): Promise<StockMovementResponse[]> => {
    const params: Record<string, string> = {};
    if (inventoryId) params.inventoryId = inventoryId;
    if (productId) params.productId = productId;
    if (warehouseCode) params.warehouseCode = warehouseCode;

    const response = await apiClient.get<StockMovementResponse[]>('/stock-movements', { params });
    return response.data;
  },

  adjustStock: async (request: StockAdjustmentRequest): Promise<StockMovementResponse> => {
    const response = await apiClient.post<StockMovementResponse>('/stock-movements/adjust', request);
    return response.data;
  },
};

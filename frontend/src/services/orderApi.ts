import { apiClient } from './apiClient';
import type {
  OrderResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderStatus,
  OrderType,
} from '../types/order';

export const orderApi = {
  getAllOrders: async (status?: OrderStatus, type?: OrderType): Promise<OrderResponse[]> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (type) params.type = type;

    const response = await apiClient.get<OrderResponse[]>('/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  getOrderByNumber: async (orderNumber: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/orders/number/${orderNumber}`);
    return response.data;
  },

  createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>('/orders', request);
    return response.data;
  },

  updateOrderStatus: async (id: string, request: UpdateOrderStatusRequest): Promise<OrderResponse> => {
    const response = await apiClient.patch<OrderResponse>(`/orders/${id}/status`, request);
    return response.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },
};

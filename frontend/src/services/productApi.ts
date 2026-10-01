import { apiClient } from './apiClient';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/product';

export const productApi = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (request: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', request);
    return response.data;
  },

  updateProduct: async (id: string, request: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, request);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('rim_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const customError: ApiErrorResponse = {
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
      status: error.response?.status || 500,
      error: error.response?.data?.error || 'Network Error',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      path: error.response?.data?.path || error.config?.url || '',
      validationErrors: error.response?.data?.validationErrors,
    };
    return Promise.reject(customError);
  }
);

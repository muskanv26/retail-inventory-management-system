import { apiClient } from './apiClient';
import type { User, Role } from '../types/auth';

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('rim_token', response.data.token);
      localStorage.setItem('rim_user', JSON.stringify(response.data.user));
      localStorage.setItem('rim_active_role', response.data.user.role);
    }
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('rim_token', response.data.token);
      localStorage.setItem('rim_user', JSON.stringify(response.data.user));
      localStorage.setItem('rim_active_role', response.data.user.role);
    }
    return response.data;
  },

  getCurrentUserFromBackend: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    localStorage.setItem('rim_user', JSON.stringify(response.data));
    return response.data;
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('rim_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem('rim_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rim_user');
      localStorage.removeItem('rim_token');
    }
  },

  getActiveRole: (): Role => {
    const role = localStorage.getItem('rim_active_role');
    return (role as Role) || 'CUSTOMER';
  },

  setActiveRole: (role: Role): void => {
    localStorage.setItem('rim_active_role', role);
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('rim_user');
      localStorage.removeItem('rim_token');
      localStorage.setItem('rim_active_role', 'CUSTOMER');
    }
  }
};

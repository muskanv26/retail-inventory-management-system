import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types/auth';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  activeRole: Role;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [activeRole, setActiveRole] = useState<Role>(() => authApi.getActiveRole());

  useEffect(() => {
    if (!user) {
      // Default demo user session if none exists
      const defaultUser: User = {
        id: 'usr-customer-001',
        name: 'Alex Retail',
        email: 'alex@example.com',
        role: activeRole,
      };
      setUser(defaultUser);
      authApi.setCurrentUser(defaultUser);
    }
  }, [user, activeRole]);

  const login = (newUser: User) => {
    setUser(newUser);
    setActiveRole(newUser.role);
    authApi.setCurrentUser(newUser);
    authApi.setActiveRole(newUser.role);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setActiveRole('CUSTOMER');
  };

  const switchRole = (newRole: Role) => {
    setActiveRole(newRole);
    authApi.setActiveRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      authApi.setCurrentUser(updatedUser);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = activeRole === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        login,
        logout,
        switchRole,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

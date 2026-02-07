'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (username: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleAuth = async (token: string) => {
    localStorage.setItem('jwt_token', token);
    setToken(token);

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const user: User = { id: decoded.id, email: decoded.email, username: decoded.username || '' };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (e) {
      console.error("Failed to decode token", e);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...', { email });
      const response = await api<{ token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      console.log('Login successful:', response);
      await handleAuth(response.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('Attempting registration...', { username, email });
      const response = await api<{ token: string }>('/auth/register', {
        method: 'POST',
        body: { username, email, password },
      });
      console.log('Registration successful:', response);
      await handleAuth(response.token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
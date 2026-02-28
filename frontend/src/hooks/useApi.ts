
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any> | FormData;
};

type UseApiReturn<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  exec: (endpoint: string, options?: ApiOptions) => Promise<T | undefined>;
};

export const useApi = <T>(): UseApiReturn<T> => {
  const { token, logout } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const exec = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api<T>(endpoint, { ...options, token });
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      if (err.status === 401) {
        logout();
      }
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  return { data, error, isLoading, exec };
};

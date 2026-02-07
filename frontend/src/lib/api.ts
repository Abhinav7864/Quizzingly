import { User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  token?: string | null;
};

const api = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const { method = 'GET', body, token } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('API Request:', { method, url, body, hasToken: !!token });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    console.log('API Response:', { status: response.status, ok: response.ok });
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    throw new Error(`Network error: ${fetchError.message}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      console.error('Authentication error: Token is invalid or expired.');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'An API error occurred');
  }

  const data = await response.json();
  console.log('API Response data:', data);
  return data;
};

export default api;
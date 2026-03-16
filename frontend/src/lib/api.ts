import { User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4002";

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any> | FormData;
  token?: string | null;
};

const api = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const { method = 'GET', body, token } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('API Request:', { method, url, hasBody: !!body, isFormData: body instanceof FormData, hasToken: !!token });

  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : null),
    });
    console.log('API Response:', { status: response.status, ok: response.ok });
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'An unknown error occurred' };
    }

    const errorMessage = errorData.message || `API Error ${response.status}`;
    
    // Create a custom error property for status
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    
    throw error;
  }

  const data = await response.json();
  console.log('API Response data:', data);
  return data;
};

export default api;
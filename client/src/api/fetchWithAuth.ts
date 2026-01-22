import { useAuth } from '../contexts/AuthContext';
import { AuthResponse } from './authApi';

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  authContext?: ReturnType<typeof useAuth>,
): Promise<T> {
  const token = window.sessionStorage.getItem('access_token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(url, { ...options, headers, credentials: 'include' });

  if (response.status === 401 && authContext) {
    const refreshed = await authContext.refresh();
    if (refreshed) {
      const newToken = window.sessionStorage.getItem('access_token');
      const newHeaders = {
        ...(options.headers || {}),
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
      };
      response = await fetch(url, { ...options, headers: newHeaders, credentials: 'include' });
    }
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

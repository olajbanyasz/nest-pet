const AUTH_BASE_URL = '/api/auth';

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

interface BackendUser {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string;
}

interface LoginResponse {
  access_token: string;
  user?: BackendUser;
  message?: string;
}

async function fetchJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function mapBackendUser(user: BackendUser): User {
  return {
    id: user.userId,
    email: user.email,
    role: user.role.toLowerCase() as Role,
    name: user.name,
  };
}

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await fetchJson<LoginResponse>(response);

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? 'Login failed',
      };
    }

    return {
      success: true,
      message: data?.message,
    };
  } catch {
    return { success: false, message: 'Network error' };
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const data = await fetchJson<LoginResponse>(response);

    if (!response.ok || !data.access_token || !data.user) {
      return { success: false, message: 'Registration failed' };
    }

    window.sessionStorage.setItem('access_token', data.access_token);

    return { success: true, user: mapBackendUser(data.user) };
  } catch {
    return { success: false, message: 'Network error' };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch(`${AUTH_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    window.sessionStorage.removeItem('access_token');
  }
};

export const checkAuth = async (): Promise<User | null> => {
  try {
    return await fetchWithAuth<User>(`${AUTH_BASE_URL}/me`);
  } catch {
    return null;
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = await fetchJson<{ access_token: string }>(response);

    window.sessionStorage.setItem('access_token', data.access_token);

    return true;
  } catch {
    return false;
  }
};

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = window.sessionStorage.getItem('access_token');

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(url, { ...options, headers, credentials: 'include' });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = window.sessionStorage.getItem('access_token');
      const newHeaders = {
        ...(options.headers || {}),
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
      };
      response = await fetch(url, { ...options, headers: newHeaders, credentials: 'include' });
    }
  }

  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

  return fetchJson<T>(response);
}

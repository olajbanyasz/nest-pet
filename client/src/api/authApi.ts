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
}

async function fetchJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function mapBackendUser(user: BackendUser): User {
  return {
    id: user.userId,
    email: user.email,
    role: user.role.toLowerCase() as Role
  };
}

export const checkAuth = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/me`, {
      credentials: 'include',
    });

    if (!response.ok) return null;

    const backendUser = await fetchJson<BackendUser>(response);
    return mapBackendUser(backendUser);
  } catch {
    return null;
  }
};

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

    const backendUser = await fetchJson<BackendUser>(response);

    return {
      success: response.ok,
      user: mapBackendUser(backendUser),
    };
  } catch {
    return { success: false, message: 'Network error' };
  }
};

export const register = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const backendUser = await fetchJson<BackendUser>(response);

    return {
      success: response.ok,
      user: mapBackendUser(backendUser),
      message: response.ok ? 'Registration successful' : 'Registration failed',
    };
  } catch {
    return { success: false, message: 'Network error' };
  }
};

export const logout = async (): Promise<void> => {
  await fetch(`${AUTH_BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};
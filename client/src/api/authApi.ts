const AUTH_BASE_URL = '/auth';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

async function fetchJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

// Ellenőrzi, hogy be van-e jelentkezve
export const checkAuth = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/me`, {
      credentials: 'include',
    });

    if (!response.ok) return null;

    const user = await fetchJson<User>(response);
    return user;
  } catch (error) {
    console.error('Error checking auth:', error);
    return null;
  }
};

// Login
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

    if (!response.ok) {
      const data = await fetchJson<{ message?: string }>(response);
      return { success: false, message: data.message || 'Login failed' };
    }

    const user = await fetchJson<User>(response);
    return { success: true, user };
  } catch (error) {
    console.error('Error during login:', error);
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

    if (!response.ok) {
      const data = await fetchJson<{ message?: string }>(response);
      return { success: false, message: data.message || 'Registration failed' };
    }

    const user = await fetchJson<User>(response);
    return { success: true, user };
  } catch (error) {
    console.error('Error during registration:', error);
    return { success: false, message: 'Network error' };
  }
};

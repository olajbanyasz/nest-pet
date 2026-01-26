import api from './axios';

const AUTH_BASE_URL = '/auth';

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

function mapBackendUser(user: BackendUser): User {
  return {
    id: user.userId,
    email: user.email,
    role: user.role.toLowerCase() as Role,
    name: user.name,
  };
}

function isAxiosError(
  err: unknown,
): err is { response?: { data?: { message?: string } } } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const res = await api.post<LoginResponse>(`${AUTH_BASE_URL}/login`, {
      email,
      password,
    });

    if (res.data.access_token) {
      sessionStorage.setItem('access_token', res.data.access_token);
    }

    return {
      success: true,
      message: res.data.message,
      user: res.data.user ? mapBackendUser(res.data.user) : undefined,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: isAxiosError(err)
        ? (err.response?.data?.message ?? 'Login failed')
        : 'Login failed',
    };
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const res = await api.post<LoginResponse>(`${AUTH_BASE_URL}/register`, {
      name,
      email,
      password,
    });

    if (!res.data.access_token || !res.data.user) {
      return { success: false, message: 'Registration failed' };
    }

    sessionStorage.setItem('access_token', res.data.access_token);

    return {
      success: true,
      user: mapBackendUser(res.data.user),
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: isAxiosError(err)
        ? (err.response?.data?.message ?? 'Registration failed')
        : 'Registration failed',
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post(
      `${AUTH_BASE_URL}/logout`,
      {},
      { headers: { 'X-Skip-Interceptor': 'true' } },
    );
  } catch (err: unknown) {
    console.log('[authApi] Logout API error', err);
  } finally {
    sessionStorage.removeItem('access_token');
  }
};

export const checkAuth = async (): Promise<User | null> => {
  try {
    const res = await api.get<BackendUser>(`${AUTH_BASE_URL}/me`);
    return mapBackendUser(res.data);
  } catch {
    return null;
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const res = await api.post<{ access_token: string }>(
      `${AUTH_BASE_URL}/refresh`,
    );
    sessionStorage.setItem('access_token', res.data.access_token);
    return true;
  } catch {
    return false;
  }
};

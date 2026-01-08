const AUTH_BASE_URL = '/auth';

export interface AuthResponse {
  success: boolean;
  message?: string;
}

export const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/me`, {
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || (response.ok ? 'Login successful!' : 'Error occurred'),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error',
    };
  }
};

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || (response.ok ? 'Registration successful!' : 'Error occurred'),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network error',
    };
  }
};
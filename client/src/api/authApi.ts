const AUTH_BASE_URL = '/auth';

export interface AuthResponse {
  success: boolean;
  message?: string;
}

async function fetchJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/me`, {
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response: Response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await fetchJson<AuthResponse>(response);
    return {
      success: response.ok,
      message:
        data.message || (response.ok ? 'Login successful!' : 'Error occurred'),
    };
  } catch (error) {
    console.error('Error during login:', error);
    return {
      success: false,
      message: 'Network error',
    };
  }
};

export const register = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await fetchJson<AuthResponse>(response);
    return {
      success: response.ok,
      message:
        data.message ||
        (response.ok ? 'Registration successful!' : 'Error occurred'),
    };
  } catch (error) {
    console.error('Error during registration:', error);
    return {
      success: false,
      message: 'Network error',
    };
  }
};

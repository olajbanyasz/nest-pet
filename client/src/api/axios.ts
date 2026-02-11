import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken, logout } from './authApi';

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

let isRefreshing = false;
let authLogoutCallback: (() => void) | null = null;
let isLogoutInProgress = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

export const setAuthLogoutCallback = (callback: () => void): void => {
  authLogoutCallback = callback;
};

export const setLogoutInProgress = (value: boolean): void => {
  isLogoutInProgress = value;
};
const processQueue = (error: Error | null, token: string | null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
};
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as RetryAxiosRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(new Error('Axios error without config'));
    }
    if (isLogoutInProgress) {
      return Promise.reject(new Error('Logout in progress'));
    }
    if (originalRequest.headers?.['X-Skip-Interceptor']) {
      const errorMessage = error.message || 'Request failed';
      return Promise.reject(new Error(errorMessage));
    }
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(new Error(error.message || 'Request failed'));
    }
    originalRequest._retry = true;
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${String(token)}`;
          return api(originalRequest);
        })
        .catch((err) => {
          const errorObj =
            err instanceof Error ? err : new Error('Queue error');
          return Promise.reject(errorObj);
        });
    }
    isRefreshing = true;
    try {
      const currentToken = sessionStorage.getItem('access_token');
      if (!currentToken) {
        if (authLogoutCallback) {
          authLogoutCallback();
        } else {
          void logout();
        }
        throw new Error('No access token');
      }
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        if (authLogoutCallback) {
          authLogoutCallback();
        } else {
          void logout();
        }
        throw new Error('Token refresh failed');
      }
      const newToken = sessionStorage.getItem('access_token');
      if (!newToken) {
        if (authLogoutCallback) {
          authLogoutCallback();
        } else {
          void logout();
        }
        throw new Error('No new token after refresh');
      }
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error('Unknown refresh error');
      processQueue(errorObj, null);
      if (authLogoutCallback) {
        authLogoutCallback();
      } else {
        void logout();
      }

      return Promise.reject(errorObj);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  checkAuth as apiCheckAuth,
  login as apiLogin,
  logout as apiLogout,
  refreshAccessToken,
  AuthResponse,
} from '../api/authApi';
import { setAuthLogoutCallback } from '../api/axios';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const setUserWithStorage = (user: User | null) => {
    setUser(user);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  };

  const loadUser = async (options?: { skipTokenCheck?: boolean }) => {
    const token = sessionStorage.getItem('access_token');

    if (!token && !options?.skipTokenCheck) {
      setUserWithStorage(null);
      return;
    }

    try {
      const backendUser = await apiCheckAuth();
      if (!isMounted.current) return;
      if (backendUser) {
        setUserWithStorage({
          id: backendUser.id,
          email: backendUser.email,
          role: backendUser.role.toLowerCase() === 'admin' ? 'admin' : 'user',
          name: backendUser.name,
        });
      } else {
        setUserWithStorage(null);
      }
    } catch (err) {}
  };

  useEffect(() => {
    isMounted.current = true;
    const handleLogout = () => {
      apiLogout().catch((err) => console.log('[Auth] Logout API error', err));
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
      if (isMounted.current) {
        setUser(null);
        setInitialized(true);
        setLoading(false);
      }
    };

    setAuthLogoutCallback(handleLogout);

    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
      } catch (err) {}
    }
    if (isMounted.current) {
      setInitialized(true);
      setLoading(false);
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    loadUser().catch((err) => {
      console.log('[Auth] Failed to refresh user from API:', err);
    });
  }, [initialized]);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const result = await apiLogin(email, password);
    if (result.success && result.user) {
      setUserWithStorage({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
      });
    }
    return result;
  };

  const logout = () => {
    apiLogout().catch((err) => console.log('[Auth] Logout API error', err));
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const refresh = async (): Promise<boolean> => {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      logout();
      return false;
    }
    await loadUser();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

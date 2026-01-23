import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { checkAuth as apiCheckAuth, login as apiLogin, logout as apiLogout, refreshAccessToken, AuthResponse } from '../api/authApi';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const isMounted = useRef(true);

  const loadUser = async () => {
    try {
      console.log('[Auth] Loading user...');
      const backendUser = await apiCheckAuth();
      if (!isMounted.current) return;

      if (backendUser) {
        console.log('[Auth] User loaded:', backendUser);
        setUser({
          id: backendUser.id,
          email: backendUser.email,
          role: backendUser.role.toLowerCase() === 'admin' ? 'admin' : 'user',
          name: backendUser.name,
        });
      } else {
        console.log('[Auth] No user, set null');
        setUser(null);
      }
    } catch (err) {
      console.log('[Auth] loadUser error:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    loadUser().finally(() => {
      setInitialized(true);
      setLoading(false);
      console.log('[Auth] Initialized');
    });
    return () => {
      isMounted.current = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    console.log('[Auth] Login attempt:', email);
    const result = await apiLogin(email, password);
    if (result.success) {
      await loadUser();
    }
    return result;
  };

  const logout = () => {
    console.log('[Auth] Logout called');
    apiLogout().catch(err => console.log('[Auth] Logout API error', err));
    setUser(null);
    sessionStorage.removeItem('access_token');
  };

  const refresh = async (): Promise<boolean> => {
    console.log('[Auth] Refresh token...');
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.log('[Auth] No token, cannot refresh');
      setUser(null);
      return false;
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      console.log('[Auth] Refresh failed, logging out');
      logout();
      return false;
    }
    await loadUser();
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

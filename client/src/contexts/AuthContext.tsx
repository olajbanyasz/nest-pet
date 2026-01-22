import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  checkAuth as apiCheckAuth,
  login as apiLogin,
  logout as apiLogout,
  refreshAccessToken,
  AuthResponse,
} from '../api/authApi';

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

  const loadUser = async () => {
    try {
      const backendUser = await apiCheckAuth();
      if (backendUser) {
        setUser({
          id: backendUser.id,
          email: backendUser.email,
          role:
            backendUser.role.toLowerCase() === 'admin' ? 'admin' : 'user',
          name: backendUser.name,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser().finally(() => {
      setInitialized(true);
      setLoading(false);
    });
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const result = await apiLogin(email, password);
    if (result.success) {
      await loadUser();
    }
    return result;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    window.sessionStorage.removeItem('access_token');
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

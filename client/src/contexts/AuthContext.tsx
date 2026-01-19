import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuth, User as ApiUser } from '../api/authApi';

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
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // auth check loading

  useEffect(() => {
    const initAuth = async () => {
      const backendUser: ApiUser | null = await checkAuth();
      if (backendUser) {
        const normalizedUser: User = {
          id: backendUser.id,
          email: backendUser.email,
          role: backendUser.role.toLowerCase() === 'admin' ? 'admin' : 'user',
          name: backendUser.name,
        };
        setUser(normalizedUser);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

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
  initialized: boolean; // jelzi, hogy megtörtént a checkAuth
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
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
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true); // itt jelzi, hogy az auth check befejeződött
      }
    };
    initAuth();
  }, []);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  checkAuth as apiCheckAuth,
  login as apiLogin,
  logout as apiLogout,
  refreshAccessToken,
  AuthResponse,
} from '../api/authApi';
import {
  connectAuthSocket,
  disconnectAuthSocket,
  onTokenExpiring,
  onOnlineUsersUpdate,
} from '../socket/authSocket';
import { setAuthLogoutCallback, setLogoutInProgress } from '../api/axios';

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
  showRefreshModal: boolean;
  setShowRefreshModal: (value: boolean) => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  refresh: () => Promise<boolean>;
  onlineUsers: string[];
  onlineCount: number;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const isMounted = useRef(true);
  const isLoggingOut = useRef(false);
  const socketInitialized = useRef(false);

  const setUserWithStorage = useCallback((user: User | null) => {
    setUser(user);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, []);

  const performLogout = useCallback(
    (options?: { skipApi?: boolean }) => {
      if (isLoggingOut.current) return;
      isLoggingOut.current = true;
      setLogoutInProgress(true);

      const token = sessionStorage.getItem('access_token');
      if (!options?.skipApi && token) {
        apiLogout().catch(() => {});
      }

      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');

      disconnectAuthSocket();
      socketInitialized.current = false;

      setOnlineUsers([]);
      setOnlineCount(0);
      setShowRefreshModal(false);

      if (isMounted.current) {
        setUser(null);
      }
    },
    [],
  );

  const logout = () => performLogout();

  useEffect(() => {
    isMounted.current = true;
    setAuthLogoutCallback(() => performLogout({ skipApi: true }));

    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

    setInitialized(true);
    setLoading(false);

    return () => {
      isMounted.current = false;
    };
  }, [performLogout]);

  useEffect(() => {
    if (!initialized || !user) return;
    if (socketInitialized.current) return;

    socketInitialized.current = true;

    connectAuthSocket();

    onOnlineUsersUpdate((data) => {
      setOnlineUsers(data.users);
      setOnlineCount(data.count);
    });

    onTokenExpiring(() => {
      setShowRefreshModal(true);
    });

    return () => {
      disconnectAuthSocket();
      socketInitialized.current = false;
    };
  }, [initialized, user]);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const result = await apiLogin(email, password);

    if (result.success && result.user) {
      isLoggingOut.current = false;
      setLogoutInProgress(false);

      setUserWithStorage({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
      });
    }

    return result;
  };

  const refresh = async (): Promise<boolean> => {
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      logout();
      return false;
    }

    setShowRefreshModal(false);
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
        showRefreshModal,
        setShowRefreshModal,
        onlineUsers,
        onlineCount,
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

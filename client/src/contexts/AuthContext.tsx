import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AuthResponse,
  checkAuth as apiCheckAuth,
  getCsrfToken,
  login as apiLogin,
  logout as apiLogout,
  refreshAccessToken,
} from '../api/authApi';
import { setAuthLogoutCallback, setCsrfToken } from '../api/axios';
import {
  connectAuthSocket,
  disconnectAuthSocket,
  onOnlineUsersUpdate,
  onTokenExpiring,
} from '../socket/authSocket';

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
  const socketInitialized = useRef(false);

  useEffect(() => {
    const fetchCsrf = async () => {
      const token = await getCsrfToken();
      if (token) {
        setCsrfToken(token);
      }
    };
    void fetchCsrf();
  }, []);

  const performLogout = useCallback((options?: { skipApi?: boolean }) => {
    // isLoggingOut ref might not be needed anymore if we simplified axios
    // but keeping a local guard is fine

    // const token = api.defaults.headers.common['Authorization']; // Check if we have token?
    // Actually we use setAccessToken, so we can't check api.defaults easily if we use interceptors.
    // irrelevant, just call logout.

    if (!options?.skipApi) {
      apiLogout().catch(() => {});
    }

    disconnectAuthSocket();
    socketInitialized.current = false;

    setOnlineUsers([]);
    setOnlineCount(0);
    setShowRefreshModal(false);

    if (isMounted.current) {
      setUser(null);
    }
  }, []);

  const logout = () => performLogout();

  // Initialize auth state
  useEffect(() => {
    isMounted.current = true;
    setAuthLogoutCallback(() => performLogout({ skipApi: true }));

    const initAuth = async () => {
      try {
        const hasToken = await refreshAccessToken();
        if (hasToken) {
          const userData = await apiCheckAuth();
          if (userData && isMounted.current) {
            setUser(userData);
          }
        }
      } catch {
        // Silent fail, user is just not logged in
      } finally {
        if (isMounted.current) {
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    void initAuth();

    return () => {
      isMounted.current = false;
    };
  }, []);

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
      setUser({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
      });

      const newCsrf = await getCsrfToken();
      if (newCsrf) {
        setCsrfToken(newCsrf);
      }
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

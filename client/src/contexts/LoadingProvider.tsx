import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

type LoadingCtx = { show: () => void; hide: () => void; loading: boolean };
const LoadingContext = createContext<LoadingCtx | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);
  const show = useCallback(() => setCount(c => c + 1), []);
  const hide = useCallback(() => setCount(c => Math.max(0, c - 1)), []);
  const loading = count > 0;

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [loading]);

  return (
    <LoadingContext.Provider value={{ show, hide, loading }}>
      {children}
      {loading && (
        <LoadingSpinner />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingCtx => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
};
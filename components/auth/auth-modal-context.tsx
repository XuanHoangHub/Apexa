'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

export type AuthModalMode = 'login' | 'signup' | 'forgot' | 'reset';

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthModalMode) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined,
);

function getInitialState(): { isOpen: boolean; mode: AuthModalMode } {
  if (typeof window === 'undefined') {
    return { isOpen: false, mode: 'login' };
  }
  const params = new URLSearchParams(window.location.search);
  const authParam = params.get('auth');
  if (
    authParam === 'login' ||
    authParam === 'signup' ||
    authParam === 'forgot' ||
    authParam === 'reset'
  ) {
    return { isOpen: true, mode: authParam };
  }
  return { isOpen: false, mode: 'login' };
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(getInitialState);
  const [isOpen, setIsOpen] = useState(initial.isOpen);
  const [mode, setMode] = useState<AuthModalMode>(initial.mode);

  const openAuthModal = useCallback((targetMode?: AuthModalMode) => {
    if (targetMode) setMode(targetMode);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Clean up ?auth= query param from the browser URL if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('auth')) {
      params.delete('auth');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        openAuthModal,
        closeAuthModal,
        setMode,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

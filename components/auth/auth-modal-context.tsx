'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export type AuthModalMode = 'login' | 'signup' | 'forgot' | 'reset';

interface AuthModalContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOpen: boolean;
  mode: AuthModalMode;
  reason: string | null;
  openAuthModal: (mode?: AuthModalMode, reason?: string) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthModalMode) => void;
  setReason: (reason: string | null) => void;
  requireAuth: (action?: () => void, reason?: string) => boolean;
  executePendingAction: () => void;
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
  const [reason, setReason] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Subscribe to Supabase auth state change
  useEffect(() => {
    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });
      return () => data.subscription.unsubscribe();
    } catch {
      queueMicrotask(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const openAuthModal = useCallback(
    (targetMode?: AuthModalMode, triggerReason?: string) => {
      if (targetMode) setMode(targetMode);
      if (triggerReason !== undefined) setReason(triggerReason);
      setIsOpen(true);
    },
    [],
  );

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setReason(null);
  }, []);

  const executePendingAction = useCallback(() => {
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      try {
        action();
      } catch (err) {
        console.error('Failed to execute pending action after auth:', err);
      }
    }
  }, []);

  const requireAuth = useCallback(
    (action?: () => void, customReason?: string): boolean => {
      if (user) {
        return true;
      }
      if (action) {
        pendingActionRef.current = action;
      }
      setReason(customReason || 'Vui lòng đăng nhập để sử dụng tính năng này.');
      setMode('login');
      setIsOpen(true);
      return false;
    },
    [user],
  );

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
        user,
        isAuthenticated: !!user,
        isLoading,
        isOpen,
        mode,
        reason,
        openAuthModal,
        closeAuthModal,
        setMode,
        setReason,
        requireAuth,
        executePendingAction,
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

// Alias for generic auth access
export const useAuth = useAuthModal;

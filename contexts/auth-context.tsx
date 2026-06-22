import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '@/api/client';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/constants/types';
import type { AuthPayload, Usuario } from '@/types/domain';

type AuthContextType = {
  user: Usuario | null;
  token: string | null;
  loadingSession: boolean;
  login: (data: AuthPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: Usuario | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const clearSession = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY, '@traco:favorites']);
    setUser(null);
    setToken(null);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    router.replace('/(tabs)/login' as never);
  }, [clearSession, router]);

  const refreshUser = useCallback(async () => {
    const [rawUser, storedToken] = await Promise.all([
      AsyncStorage.getItem(USER_STORAGE_KEY),
      AsyncStorage.getItem(TOKEN_STORAGE_KEY),
    ]);
    setUser(rawUser ? JSON.parse(rawUser) : null);
    setToken(storedToken);
  }, []);

  const login = useCallback(async (data: AuthPayload) => {
    await AsyncStorage.multiSet([
      [USER_STORAGE_KEY, JSON.stringify(data.usuario)],
      [TOKEN_STORAGE_KEY, data.token],
    ]);
    setUser(data.usuario);
    setToken(data.token);
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoadingSession(false));
  }, [refreshUser]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
      router.replace('/(tabs)/login' as never);
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  useEffect(() => {
    if (loadingSession) return;
    const route = segments.join('/');
    const isAuthRoute = route.includes('login') || route.includes('cadastrar');

    if (!token && !isAuthRoute) router.replace('/(tabs)/login' as never);
    if (token && isAuthRoute) router.replace('/(tabs)' as never);
  }, [loadingSession, router, segments, token]);

  const value = useMemo(
    () => ({ user, token, loadingSession, login, logout, refreshUser, setUser }),
    [user, token, loadingSession, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}


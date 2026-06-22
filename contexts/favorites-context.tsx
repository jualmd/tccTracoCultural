import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adicionarFavorito, listarFavoritos, removerFavorito } from '@/services/favorite-service';
import type { Evento } from '@/types/domain';
import { useAuth } from '@/contexts/auth-context';

type FavoritesContextType = {
  favorites: Set<string>;
  favoriteEvents: Evento[];
  loadingFavorites: boolean;
  toggleFavorite: (id: string | number) => Promise<void>;
  isFavorite: (id: string | number) => boolean;
  clearFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  count: number;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteEvents, setFavoriteEvents] = useState<Evento[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const { token } = useAuth();

  const refreshFavorites = useCallback(async () => {
    if (!token) {
      setFavoriteEvents([]);
      setFavorites(new Set());
      return;
    }

    setLoadingFavorites(true);
    try {
      const eventos = await listarFavoritos();
      setFavoriteEvents(eventos);
      setFavorites(new Set(eventos.map((event) => String(event.id))));
    } finally {
      setLoadingFavorites(false);
    }
  }, [token]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(async (id: string | number) => {
    const normalized = String(id);
    const wasFavorite = favorites.has(normalized);

    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(normalized);
      else next.add(normalized);
      return next;
    });

    if (wasFavorite) {
      setFavoriteEvents((prev) => prev.filter((event) => String(event.id) !== normalized));
    }

    try {
      if (wasFavorite) await removerFavorito(Number(id));
      else await adicionarFavorito(Number(id));
      await refreshFavorites();
    } catch {
      setFavorites((prev) => {
        const rollback = new Set(prev);
        if (wasFavorite) rollback.add(normalized);
        else rollback.delete(normalized);
        return rollback;
      });
    }
  }, [favorites, refreshFavorites]);

  const isFavorite = useCallback((id: string | number) => favorites.has(String(id)), [favorites]);

  const clearFavorites = useCallback(async () => {
    setFavoriteEvents([]);
    setFavorites(new Set());
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      favoriteEvents,
      loadingFavorites,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      refreshFavorites,
      count: favorites.size,
    }),
    [favoriteEvents, favorites, isFavorite, loadingFavorites, refreshFavorites, toggleFavorite, clearFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}


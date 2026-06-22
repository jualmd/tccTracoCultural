import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listarEventos } from '@/services/event-service';
import type { Evento } from '@/types/domain';

export function useEvents() {
  const [events, setEvents] = useState<Evento[]>([]);
  const [allEvents, setAllEvents] = useState<Evento[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca todos os eventos uma vez para extrair categorias
  const loadAll = useCallback(async () => {
    try {
      const data = await listarEventos();
      setAllEvents(data);
    } catch {
      // silencia — categorias podem ficar vazias
    }
  }, []);

  const fetchEvents = useCallback(async (q: string, cat: string | null) => {
    setLoading(true);
    setError('');
    try {
      const filters: Record<string, string> = {};
      if (q.trim()) filters.q = q.trim();
      if (cat) filters.categoria = cat;
      setEvents(await listarEventos(filters as any));
    } catch {
      setError('Não foi possível carregar os eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce na busca textual
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchEvents(search, category), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, category, fetchEvents]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refresh = useCallback(() => fetchEvents(search, category), [fetchEvents, search, category]);

  const categories = useMemo(
    () => [...new Set(allEvents.map((e) => e.categoria?.nome).filter(Boolean) as string[])],
    [allEvents]
  );

  return {
    events,
    filteredEvents: events,
    categories,
    search,
    setSearch,
    category,
    setCategory,
    loading,
    error,
    refresh,
  };
}


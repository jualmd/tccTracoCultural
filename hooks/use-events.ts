import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarEventos } from '@/services/event-service';
import type { Evento } from '@/types/domain';

// Remove acentos e normaliza caixa — evita que "Educação" vs "educacao"
// ou "Cultura & Arte" vs "cultura&arte" quebrem a comparação.
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function useEvents() {
  const [allEvents, setAllEvents] = useState<Evento[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Busca TODOS os eventos uma única vez (sem filtros no backend).
  // A filtragem por categoria e por texto acontece aqui no app, então
  // funciona sempre — mesmo que o backend não trate corretamente os
  // parâmetros de query.
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarEventos();
      setAllEvents(data);
    } catch {
      setError('Não foi possível carregar os eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refresh = useCallback(() => loadAll(), [loadAll]);

  const categories = useMemo(
    () => [...new Set(allEvents.map((e) => e.categoria?.nome).filter(Boolean) as string[])],
    [allEvents]
  );

  const filteredEvents = useMemo(() => {
    const normalizedSearch = normalize(search);
    const normalizedCategory = category ? normalize(category) : null;

    return allEvents.filter((evento) => {
      if (normalizedCategory) {
        const eventoCategoria = evento.categoria?.nome ? normalize(evento.categoria.nome) : '';
        if (eventoCategoria !== normalizedCategory) return false;
      }

      if (normalizedSearch) {
        const haystack = normalize(
          [evento.nome, evento.descricao ?? '', evento.cidade, evento.categoria?.nome ?? '']
            .filter(Boolean)
            .join(' ')
        );
        if (!haystack.includes(normalizedSearch)) return false;
      }

      return true;
    });
  }, [allEvents, search, category]);

  return {
    events: allEvents,
    filteredEvents,
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
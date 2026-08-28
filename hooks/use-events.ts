import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarEventos } from '@/services/event-service';
import { listarCategorias } from '@/services/category-service';
import { normalizeText as normalize } from '@/lib/text';
import type { Evento } from '@/types/domain';

export function useEvents() {
  const [allEvents, setAllEvents] = useState<Evento[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
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
      const [eventos, categorias] = await Promise.all([
        listarEventos(),
        listarCategorias(),
      ]);
      setAllEvents(eventos);
      // Lista de categorias vem do backend (igual ao web), não só das que
      // já têm evento cadastrado -- assim os chips não "somem" quando a
      // base de eventos ainda é pequena.
      setAllCategories(categorias.map((c) => c.nome));
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

  const categories = useMemo(() => {
    if (allCategories.length > 0) return allCategories;
    // Fallback defensivo: se o endpoint de categorias falhar por algum
    // motivo, ainda derivamos da lista de eventos pra não ficar sem chips.
    return [...new Set(allEvents.map((e) => e.categoria?.nome).filter(Boolean) as string[])];
  }, [allCategories, allEvents]);

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
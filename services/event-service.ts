import apiClient from '@/api/client';
import type { Evento } from '@/types/domain';

export type EventFilters = {
  q?: string;
  categoriaId?: number | string;
  cidade?: string;
  categoria?: string;
};

export async function listarEventos(filters?: EventFilters) {
  const params: Record<string, any> = {};
  if (filters?.q) params.q = filters.q;
  if (filters?.categoriaId) params.categoriaId = filters.categoriaId;
  if (filters?.categoria) params.categoria = filters.categoria;
  if (filters?.cidade) params.cidade = filters.cidade;
  const { data } = await apiClient.get<Evento[]>('/eventos', { params });
  return Array.isArray(data) ? data : [];
}

export async function getEventoPorId(id: number) {
  const { data } = await apiClient.get<Evento>(`/eventos/${id}`);
  return data;
}

export async function listarMeusEventos() {
  const { data } = await apiClient.get<Evento[]>('/eventos/meus');
  return Array.isArray(data) ? data : [];
}

export type EventUpdatePayload = {
  nome?: string;
  descricao?: string | null;
  dataInicio?: string;
  dataFim?: string | null;
  cidade?: string;
  linkExterno?: string | null;
};

export async function atualizarEvento(id: number, payload: EventUpdatePayload) {
  const { data } = await apiClient.put<Evento>(`/eventos/${id}`, payload);
  return data;
}


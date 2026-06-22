import apiClient from '@/api/client';
import type { Evento } from '@/types/domain';

export async function listarFavoritos() {
  const { data } = await apiClient.get<Evento[]>('/favoritos');
  return Array.isArray(data) ? data : [];
}

export async function adicionarFavorito(eventoId: number) {
  await apiClient.post('/favoritos', { idEventoFk: eventoId });
}

export async function removerFavorito(eventoId: number) {
  await apiClient.delete(`/favoritos/${eventoId}`);
}


import apiClient from '@/api/client';
import type { Comentario } from '@/types/domain';

export async function listarComentarios(eventoId: number) {
  const { data } = await apiClient.get<Comentario[]>(`/eventos/${eventoId}/comentarios`);
  return Array.isArray(data) ? data : [];
}

export async function criarComentario(eventoId: number, texto: string) {
  const { data } = await apiClient.post<Comentario>(`/eventos/${eventoId}/comentarios`, { texto });
  return data;
}

export async function excluirComentario(comentarioId: number) {
  await apiClient.delete(`/comentarios/${comentarioId}`);
}


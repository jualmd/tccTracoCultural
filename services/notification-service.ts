import apiClient from '@/api/client';

export type Notificacao = {
  id: number;
  idUsuarioFk: number;
  idEventoFk: number | null;
  mensagem: string;
  tipo: 'COMENTARIO' | 'EVENTO_PROXIMO' | 'GERAL' | 'EVENTO_ATUALIZACAO' | string;
  lida: boolean;
  dataCriacao: string;
};

export async function listarNotificacoes() {
  const { data } = await apiClient.get<Notificacao[]>('/notificacoes');
  return Array.isArray(data) ? data : [];
}

export async function contarNaoLidas() {
  const { data } = await apiClient.get<{ total: number }>('/notificacoes/nao-lidas/contagem');
  return data.total ?? 0;
}

export async function marcarComoLida(id: number) {
  await apiClient.patch(`/notificacoes/${id}/lida`);
}

export async function marcarTodasComoLidas() {
  await apiClient.patch('/notificacoes/lidas');
}

// Admin -> todo mundo, sobre o sistema.
export async function enviarNotificacaoGeral(mensagem: string) {
  const { data } = await apiClient.post<{ totalEnviado: number }>('/admin/notificacoes', { mensagem });
  return data;
}

// Dono do evento -> só quem favoritou ESSE evento.
export async function notificarFavoritosEvento(eventoId: number, mensagem: string) {
  const { data } = await apiClient.post<{ totalEnviado: number }>(
    `/eventos/${eventoId}/notificar-favoritos`,
    { mensagem }
  );
  return data;
}
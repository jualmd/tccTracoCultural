import apiClient from '@/api/client';

export type Notificacao = {
  id: number;
  idUsuarioFk: number;
  idEventoFk: number | null;
  mensagem: string;
  tipo: 'COMENTARIO' | 'EVENTO_PROXIMO' | string;
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

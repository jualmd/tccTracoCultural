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

// Um envio em lote (histórico persistido, editável/excluível) — o mesmo
// registro que gera N `Notificacao` (uma por destinatário). Usado tanto
// pela tela de admin (envios gerais) quanto pelo dono de um evento
// (avisos pra quem favoritou).
export type EnvioNotificacao = {
  id: number;
  tipo: string;
  mensagem: string;
  idEventoFk: number | null;
  nomeEvento: string | null;
  totalDestinatarios: number;
  dataCriacao: string;
  dataAtualizacao: string | null;
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

// Histórico de envios (igual ao front web): listar, editar e excluir.
export async function listarEnviosNotificacao() {
  const { data } = await apiClient.get<EnvioNotificacao[]>('/notificacoes/envios');
  return Array.isArray(data) ? data : [];
}

export async function editarEnvioNotificacao(id: number, mensagem: string) {
  const { data } = await apiClient.put<EnvioNotificacao>(`/notificacoes/envios/${id}`, { mensagem });
  return data;
}

export async function excluirEnvioNotificacao(id: number) {
  await apiClient.delete(`/notificacoes/envios/${id}`);
}
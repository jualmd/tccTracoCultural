import apiClient from '@/api/client';

export async function registrarCompartilhamento(eventoId: number) {
  const { data } = await apiClient.post<{ total: number }>(`/eventos/${eventoId}/compartilhamentos`);
  return data.total;
}

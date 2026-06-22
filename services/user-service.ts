import apiClient from '@/api/client';
import type { UpdateUserRequest, Usuario } from '@/types/domain';

export async function buscarUsuario(id: number) {
  const { data } = await apiClient.get<Usuario>(`/usuarios/${id}`);
  return data;
}

export async function atualizarUsuario(id: number, dados: UpdateUserRequest) {
  const { data } = await apiClient.put<Usuario>(`/usuarios/${id}`, dados);
  return data;
}

export async function excluirUsuario(id: number) {
  await apiClient.delete(`/usuarios/${id}`);
}


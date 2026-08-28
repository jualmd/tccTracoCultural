import apiClient from '@/api/client';
import type { Categoria } from '@/types/domain';

export async function listarCategorias() {
  const { data } = await apiClient.get<Categoria[]>('/categorias');
  return Array.isArray(data) ? data : [];
}
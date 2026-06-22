import apiClient from '@/api/client';
import { loginUsuario, cadastrarUsuario } from '@/services/auth-service';
import { listarEventos, getEventoPorId } from '@/services/event-service';
import { listarFavoritos, adicionarFavorito, removerFavorito } from '@/services/favorite-service';
import { buscarUsuario, atualizarUsuario } from '@/services/user-service';

export { loginUsuario, cadastrarUsuario, getEventoPorId, adicionarFavorito, removerFavorito, atualizarUsuario };

export const getEventos = async (params?: Record<string, string>) => ({ data: await listarEventos(params) });
export const getFavoritos = async () => ({ data: await listarFavoritos() });
export const getUsuarioPorId = async (id: number) => ({ data: await buscarUsuario(id) });

export default apiClient;

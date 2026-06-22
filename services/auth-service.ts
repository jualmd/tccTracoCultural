import apiClient from '@/api/client';
import type { AuthPayload, LoginRequest, RegisterRequest, Usuario } from '@/types/domain';

function normalizeAuthResponse(data: any): AuthPayload {
  const token = data?.token ?? data?.accessToken ?? data?.jwt ?? data?.data?.token;
  const usuario = data?.usuario ?? data?.user ?? data?.data?.usuario ?? data?.data?.user ?? data;

  return {
    token,
    usuario: {
      id: Number(usuario?.id),
      nome: usuario?.nome ?? usuario?.name ?? '',
      email: usuario?.email ?? '',
      estado: usuario?.estado,
      icone: usuario?.icone,
      corFundo: usuario?.corFundo,
      token,
      createdAt: usuario?.createdAt,
    },
  };
}

export async function loginUsuario(email: string, senha: string) {
  const { data } = await apiClient.post('/auth/login', { email, senha } satisfies LoginRequest);
  return normalizeAuthResponse(data);
}

export async function cadastrarUsuario(dados: RegisterRequest) {
  const { data } = await apiClient.post('/auth/register', dados);
  return normalizeAuthResponse(data);
}

export async function getPerfil(id: number) {
  const { data } = await apiClient.get<Usuario>(`/usuarios/${id}`);
  return data;
}


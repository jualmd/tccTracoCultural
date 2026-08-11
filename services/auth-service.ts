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

// O backend não loga automaticamente após o cadastro -- a conta fica
// "não confirmada" até o código de verificação ser validado. Por isso
// aqui devolvemos a resposta crua (id/email/message), não um AuthPayload.
export async function cadastrarUsuario(dados: RegisterRequest) {
  const { data } = await apiClient.post('/auth/register', dados);
  return data as { id: number; email: string; message: string };
}

export async function getPerfil(id: number) {
  const { data } = await apiClient.get<Usuario>(`/usuarios/${id}`);
  return data;
}

// ── Confirmação de email / redefinição de senha ──
// Espelha o front web (src/servicos/api.js): dois endpoints parecidos e
// FÁCEIS de confundir -- verificar-codigo CONFIRMA A CONTA e CONSOME o
// código (uso exclusivo da tela de cadastro); validar-codigo só CONFERE
// sem consumir (uso da tela de redefinir senha). Nunca trocar os dois.

export async function reenviarCodigo(email: string) {
  const { data } = await apiClient.post('/auth/reenviar-codigo', { email });
  return data as { message: string };
}

// Confirma o cadastro (tela verificar-codigo). Consome o código e já
// devolve token de login, igual ao endpoint de login.
export async function verificarCodigoCadastro(email: string, codigo: string) {
  const { data } = await apiClient.post('/auth/verificar-codigo', { email, codigo });
  return normalizeAuthResponse(data);
}

// Só confere se o código bate, SEM consumir (tela redefinir-senha, usada
// pra revelar os campos de nova senha antes do submit final).
export async function validarCodigo(email: string, codigo: string) {
  const { data } = await apiClient.post<{ valido: boolean }>('/auth/validar-codigo', { email, codigo });
  return data;
}

export async function esqueciSenha(email: string) {
  const { data } = await apiClient.post('/auth/esqueci-senha', { email });
  return data as { message: string };
}

export async function redefinirSenha(email: string, codigo: string, novaSenha: string) {
  const { data } = await apiClient.post('/auth/redefinir-senha', { email, codigo, novaSenha });
  return data as { message: string };
}

export type Categoria = {
  id: number;
  nome: string;
};

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  estado?: string;
  icone?: string;
  corFundo?: string;
  token?: string;
  createdAt?: string;
  isAdm?: boolean;
};

export type Evento = {
  id: number;
  nome: string;
  descricao?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  cidade: string;
  linkExterno?: string | null;
  cardImage?: string | null;
  categoria?: Categoria | null;
  // O backend nunca manda um objeto "usuario" aninhado — só o id direto
  // (bug histórico: o app comparava event.usuario?.id, que é sempre
  // undefined, então "é meu evento?" nunca dava certo).
  idUsuarioFk?: number | null;
  destacado?: boolean;
  patrocinado?: boolean;
  // Só vêm preenchidos quando o evento foi buscado via getEventoPorId
  // (GET /eventos/{id}), que retorna esses dois campos extras junto do
  // evento.
  totalFavoritos?: number;
  favoritadoPeloUsuario?: boolean;
};

export type Comentario = {
  id: number;
  texto: string;
  dataCriacao?: string;
  // mesma história do Evento: o backend manda os campos flat, não um
  // objeto "usuario" aninhado.
  idUsuarioFk?: number | null;
  idEventoFk?: number | null;
  nomeUsuario?: string | null;
};

export type AuthPayload = {
  token: string;
  usuario: Usuario;
};

export type LoginRequest = {
  email: string;
  senha: string;
};

export type RegisterRequest = {
  nome: string;
  email: string;
  senha: string;
};

export type UpdateUserRequest = Partial<Pick<Usuario, 'nome' | 'email' | 'estado' | 'icone' | 'corFundo'>>;
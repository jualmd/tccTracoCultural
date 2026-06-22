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
  usuario?: Pick<Usuario, 'id' | 'nome'> | null;
};

export type Comentario = {
  id: number;
  texto: string;
  dataCriacao?: string;
  usuario?: Pick<Usuario, 'id' | 'nome' | 'email'> | null;
  evento?: Pick<Evento, 'id' | 'nome'> | null;
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


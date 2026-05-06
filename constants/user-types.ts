export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const USER_STORAGE_KEY = '@traco:user';

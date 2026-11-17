export interface User {
  id: string;
  username: string;
  email: string;
  creadoEn?: string;
  seguidores: string[];
  seguidos: string[];
}

export interface CreateUserDTO {
  username: string;
  email: string;
  creadoEn: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  creadoEn?: string;
}

export interface ServerResponse<T> {
  data: T;
  message: string;
  status: number;
}

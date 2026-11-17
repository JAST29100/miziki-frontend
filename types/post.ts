export interface Post {
  id: string;
  userId: string;
  numberId: string;
  contenido: string;
  fecha: string;
}

export interface CreatePostDTO {
  userId: string;
  numberId: string;
  contenido: string;
  fecha: string;
}

export interface UpdatePostDTO {
  numberId?: string;
  contenido?: string;
  fecha?: string;
}

export interface PostServerResponse {
  data: Post[];
  message: string;
  status: number;
}

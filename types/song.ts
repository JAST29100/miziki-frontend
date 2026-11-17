export interface Song {
  id: string;
  titulo: string;
  artista: string;
  album?: string;
  genero?: string;
  duracion: number;
}

export interface SongServerResponse {
  data: Song[];
  message: string;
  status: number;
}

export interface CreateSongDTO {
  titulo: string;
  artista: string;
  album?: string;
  genero?: string;
  duracion: number;
}

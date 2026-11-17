export interface Event {
  id: string;
  userId: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  asistentes: string[];
}

export interface CreateEventDTO {
  userId: string;
  titulo: string;
  descripcion: string;
  fecha: string;
}

export interface UpdateEventDTO {
  titulo?: string;
  descripcion?: string;
  fecha?: string;
}

export interface EventServerResponse {
  data: Event[];
  message: string;
  status: number;
}

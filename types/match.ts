import type { User } from "@/types/user";

export interface Match {
  id: string;
  usuariosMatch: string[];
}

export interface MatchServerResponse {
  data: Array<User | Match>;
  message: string;
  status: number;
}

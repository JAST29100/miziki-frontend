import type { Match, MatchServerResponse } from "@/types/match";
import type { User } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class MatchServiceError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "MatchServiceError";
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  if (!API_URL) {
    throw new Error("La variable NEXT_PUBLIC_API_URL no está configurada.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
  });

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error(`El servidor devolvió una respuesta no válida (${response.status}).`);
  }

  if (!response.ok || typeof result !== "object" || result === null || !("data" in result) || !("status" in result)) {
    throw new Error("El servidor devolvió una respuesta de matches no válida.");
  }

  return result as MatchServerResponse;
}

function assertSuccess(response: MatchServerResponse) {
  if (response.status >= 400) {
    throw new MatchServiceError(
      response.message || "La operación de matches no pudo completarse.",
      response.status,
    );
  }
}

export const matchService = {
  async discover(userId: string): Promise<User[]> {
    const response = await request(`/matches/${encodeURIComponent(userId)}/discover`);
    if (response.status === 404 && response.data.length === 0) return [];
    assertSuccess(response);
    return response.data as User[];
  },

  async getAll(userId: string): Promise<Match[]> {
    const response = await request(`/matches/${encodeURIComponent(userId)}`);
    assertSuccess(response);
    return response.data as Match[];
  },

  async like(userId: string, targetUserId: string): Promise<Match | null> {
    const response = await request(
      `/matches/${encodeURIComponent(userId)}/like/${encodeURIComponent(targetUserId)}`,
      { method: "POST" },
    );
    assertSuccess(response);
    const result = response.data[0];
    return result && "usuariosMatch" in result ? result : null;
  },

  async reject(userId: string, targetUserId: string): Promise<void> {
    const response = await request(
      `/matches/${encodeURIComponent(userId)}/reject/${encodeURIComponent(targetUserId)}`,
      { method: "POST" },
    );
    assertSuccess(response);
  },
};

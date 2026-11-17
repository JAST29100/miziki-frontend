import type { CreateSongDTO, SongServerResponse } from "@/types/song";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const songService = {
  async getAll(): Promise<SongServerResponse["data"]> {
    if (!API_URL) {
      throw new Error("La variable NEXT_PUBLIC_API_URL no está configurada.");
    }

    const response = await fetch(`${API_URL}/songs`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    let result: unknown;
    try {
      result = await response.json();
    } catch {
      throw new Error(
        `El servidor devolvió una respuesta no válida (${response.status}).`,
      );
    }

    if (!response.ok) {
      const message =
        typeof result === "object" &&
        result !== null &&
        "message" in result &&
        typeof result.message === "string"
          ? result.message
          : `Error HTTP ${response.status}`;
      throw new Error(message);
    }

    if (
      typeof result !== "object" ||
      result === null ||
      !("data" in result) ||
      !("status" in result) ||
      !Array.isArray(result.data) ||
      typeof result.status !== "number"
    ) {
      throw new Error("El servidor devolvió una lista de canciones no válida.");
    }

    const payload = result as {
      data: unknown[];
      message?: unknown;
      status: number;
    };

    // GET /songs informa status 404 cuando no hay canciones, aunque use HTTP 200.
    if (payload.status === 404 && payload.data.length === 0) {
      return [];
    }

    if (payload.status >= 400) {
      throw new Error(
        typeof payload.message === "string"
          ? payload.message
          : "No se pudieron cargar las canciones.",
      );
    }

    return payload.data as SongServerResponse["data"];
  },

  async create(data: CreateSongDTO): Promise<SongServerResponse["data"]> {
    if (!API_URL) {
      throw new Error("La variable NEXT_PUBLIC_API_URL no está configurada.");
    }

    const response = await fetch(`${API_URL}/songs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    let result: unknown;
    try {
      result = await response.json();
    } catch {
      throw new Error(`El servidor devolvió una respuesta no válida (${response.status}).`);
    }

    if (!response.ok || typeof result !== "object" || result === null || !("status" in result)) {
      throw new Error("No se pudo crear la canción.");
    }

    const payload = result as SongServerResponse;
    if (payload.status >= 400) {
      throw new Error(payload.message || "No se pudo crear la canción.");
    }

    return payload.data;
  },
};

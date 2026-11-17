import type {
  CreateEventDTO,
  Event,
  EventServerResponse,
  UpdateEventDTO,
} from "@/types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(
  endpoint: string,
  options: RequestInit = {},
): Promise<EventServerResponse> {
  if (!API_URL) {
    throw new Error(
      "La variable NEXT_PUBLIC_API_URL no está configurada.",
    );
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
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
    typeof result === "object" &&
    result !== null &&
    "status" in result &&
    typeof result.status === "number" &&
    result.status >= 400
  ) {
    const message =
      "message" in result && typeof result.message === "string"
        ? result.message
        : "La operación no pudo completarse.";

    throw new Error(message);
  }

  return result as EventServerResponse;
}

export const eventService = {
  async getAll(): Promise<Event[]> {
    const response = await request("/events");
    return response.data;
  },

  async getById(eventId: string): Promise<Event | null> {
    const response = await request(
      `/events/${encodeURIComponent(eventId)}`,
    );

    return response.data[0] ?? null;
  },

  async create(data: CreateEventDTO): Promise<Event[]> {
    const response = await request("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  },

  async update(
    eventId: string,
    data: UpdateEventDTO,
  ): Promise<Event[]> {
    const response = await request(
      `/events/${encodeURIComponent(eventId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return response.data;
  },

  async delete(eventId: string): Promise<Event[]> {
    const response = await request(
      `/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  },

  async attend(eventId: string, userId: string): Promise<Event[]> {
    const response = await request(
      `/events/${encodeURIComponent(eventId)}/attend`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      },
    );

    return response.data;
  },

  async cancelAttendance(
    eventId: string,
    userId: string,
  ): Promise<Event[]> {
    const response = await request(
      `/events/${encodeURIComponent(eventId)}/attend`,
      {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      },
    );

    return response.data;
  },
};

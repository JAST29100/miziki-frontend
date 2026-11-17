import type {
  CreateUserDTO,
  ServerResponse,
  UpdateUserDTO,
  User,
} from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
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
    throw new ApiError(
      `El servidor devolvió una respuesta no válida (${response.status}).`,
      response.status,
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

    throw new ApiError(message, response.status);
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

    throw new ApiError(message, result.status);
  }

  return result as T;
}

export const userService = {
  async getAll(): Promise<User[]> {
    try {
      const response = await request<ServerResponse<User[]>>("/users");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }

      throw error;
    }
  },

  async getById(userId: string): Promise<User> {
    const response = await request<ServerResponse<User[]>>(
      `/users/${encodeURIComponent(userId)}`,
    );

    const user = response.data[0];

    if (!user) {
      throw new Error("El usuario solicitado no existe.");
    }

    return user;
  },

  async create(data: CreateUserDTO): Promise<User> {
    const response = await request<ServerResponse<User[]>>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const createdUser = response.data[response.data.length - 1];

    if (!createdUser) {
      throw new Error("El servidor no devolvió el usuario creado.");
    }

    return createdUser;
  },

  async update(
    userId: string,
    data: UpdateUserDTO,
  ): Promise<User> {
    const response = await request<ServerResponse<User[]>>(
      `/users/${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    const updatedUser = response.data.find(
      (user) => user.id === userId,
    );

    if (!updatedUser) {
      throw new Error("El servidor no devolvió el usuario actualizado.");
    }

    return updatedUser;
  },

  async delete(userId: string): Promise<User[]> {
    const response = await request<ServerResponse<User[]>>(
      `/users/${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  },
};

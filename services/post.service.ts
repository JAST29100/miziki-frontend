import type {
  CreatePostDTO,
  Post,
  PostServerResponse,
  UpdatePostDTO,
} from "@/types/post";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(
  endpoint: string,
  options: RequestInit = {},
): Promise<PostServerResponse> {
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

  return result as PostServerResponse;
}

export const postService = {
  async getAll(): Promise<Post[]> {
    const response = await request("/posts");
    return response.data;
  },

  async getById(postId: string): Promise<Post | null> {
    const response = await request(
      `/posts/${encodeURIComponent(postId)}`,
    );

    return response.data[0] ?? null;
  },

  async create(data: CreatePostDTO): Promise<Post[]> {
    const response = await request("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  },

  async update(
    postId: string,
    data: UpdatePostDTO,
  ): Promise<Post[]> {
    const response = await request(
      `/posts/${encodeURIComponent(postId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return response.data;
  },

  async delete(postId: string): Promise<Post[]> {
    const response = await request(
      `/posts/${encodeURIComponent(postId)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  },
};

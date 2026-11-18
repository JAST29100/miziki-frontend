import type {
  Conversation,
  CreateConversationDTO,
  CreateMessageDTO,
  Message,
} from "@/types/message";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  return result as T;
}

function sonParticipantes(conversation: Conversation, firstId: string, secondId: string) {
  return (
    (conversation.userId === firstId && conversation.otherUserId === secondId) ||
    (conversation.userId === secondId && conversation.otherUserId === firstId)
  );
}

export const messageService = {
  getConversations(): Promise<Conversation[]> {
    return request<Conversation[]>("/conversations");
  },

  createConversation(data: CreateConversationDTO): Promise<Conversation> {
    return request<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async ensureConversation(firstId: string, secondId: string) {
    const conversations = await this.getConversations();
    const existing = conversations.find((conversation) =>
      sonParticipantes(conversation, firstId, secondId),
    );
    if (existing) return { conversation: existing, created: false };

    const conversation = await this.createConversation({
      userId: firstId,
      otherUserId: secondId,
    });
    return { conversation, created: true };
  },

  getMessages(conversationId: string, page = 1, limit = 100): Promise<Message[]> {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    return request<Message[]>(
      `/conversations/${encodeURIComponent(conversationId)}/messages?${query.toString()}`,
    );
  },

  sendMessage(conversationId: string, data: CreateMessageDTO): Promise<Message> {
    return request<Message>(
      `/conversations/${encodeURIComponent(conversationId)}/messages`,
      { method: "POST", body: JSON.stringify(data) },
    );
  },
};

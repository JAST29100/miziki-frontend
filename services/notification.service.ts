import type { Notification } from "@/types/notification";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("La variable NEXT_PUBLIC_API_URL no está configurada.");
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const notificationService = {
  getAll(): Promise<Notification[]> {
    return request<Notification[]>("/notifications?page=1&limit=100");
  },
  markRead(notificationId: string): Promise<void> {
    return request<void>(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PUT" });
  },
};

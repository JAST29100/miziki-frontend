
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { useActiveUser } from "@/contexts/ActiveUserContext";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types/notification";

interface NotificationSettings {
  notificaciones?: { matches?: boolean; mensajes?: boolean };
}

function leerPreferencias(userId: string) {
  try {
    const raw = localStorage.getItem(`miziki.configuracion.${userId}`);
    return raw ? (JSON.parse(raw) as NotificationSettings).notificaciones ?? {} : {};
  } catch {
    return {};
  }
}

function permitida(notification: Notification, settings: ReturnType<typeof leerPreferencias>) {
  const message = notification.message.toLocaleLowerCase("es");
  if (/match|me gusta|like/.test(message)) return settings.matches !== false;
  if (/mensaje|chat|conversaci[oó]n/.test(message)) return settings.mensajes !== false;
  return true;
}

function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
}

export default function BarraSuperior() {
  const { users, activeUser, selectUser } = useActiveUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const cargarNotificaciones = useCallback(async () => {
    if (!activeUser) { setNotifications([]); return; }
    try {
      const settings = leerPreferencias(activeUser.id);
      const items = await notificationService.getAll();
      setNotifications(items.filter((item) => item.userId === activeUser.id && permitida(item, settings)));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las notificaciones.");
    }
  }, [activeUser]);

  useEffect(() => { void cargarNotificaciones(); }, [cargarNotificaciones]);

  async function marcarLeida(notification: Notification) {
    if (notification.read) return;
    try {
      await notificationService.markRead(notification.id);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo marcar como leída.");
    }
  }

  return (
    <header className="barra-superior">
      <Link href="/" className="logo-container">
        <span className="logo">MIZIKI</span>
        <span className="subtitulo-logo">
          Comunidad musical
        </span>
      </Link>

      <div className="buscador">
        <input
          type="text"
          placeholder="Buscar músicos, eventos o creaciones"
          aria-label="Buscar músicos, eventos o creaciones"
        />
      </div>

      <div className="acciones-superiores">
        {activeUser && (
          <div className="notificaciones-superiores">
            <button type="button" className="boton-notificaciones" aria-expanded={open} onClick={() => { setOpen((value) => !value); if (!open) void cargarNotificaciones(); }}>
              Notificaciones <span className="contador-notificaciones">{notifications.filter((item) => !item.read).length}</span>
            </button>
            {open && (
              <section className="panel-notificaciones" aria-label="Notificaciones">
                <h3>Notificaciones</h3>
                {error && <p role="alert">{error}</p>}
                {!error && notifications.length === 0 && <p>No tienes notificaciones.</p>}
                {notifications.map((notification) => (
                  <button type="button" key={notification.id} className={`notificacion-item ${notification.read ? "leida" : "no-leida"}`} onClick={() => void marcarLeida(notification)}>
                    {notification.message}{!notification.read && <span> Marcar como leída</span>}
                  </button>
                ))}
              </section>
            )}
          </div>
        )}
        <Link
          href="/eventos/crear"
          className="crear-evento-superior"
        >
          Crear evento
        </Link>

        {activeUser ? (
          <>
            <Link
              href="/perfil"
              className="usuario-superior"
              aria-label={`Ir al perfil de ${activeUser.username}`}
            >
              {obtenerIniciales(activeUser.username)} ·{" "}
              {activeUser.username}
            </Link>

            {users.length > 1 && (
              <select
                aria-label="Cambiar usuario activo"
                value={activeUser.id}
                onChange={(evento) =>
                  selectUser(evento.target.value)
                }
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            )}
          </>
        ) : (
          <Link href="/perfil" className="usuario-superior">
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}

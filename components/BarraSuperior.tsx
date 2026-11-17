
"use client";

import Link from "next/link";

import { useActiveUser } from "@/contexts/ActiveUserContext";

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

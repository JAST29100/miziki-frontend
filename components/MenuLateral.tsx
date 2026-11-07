"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuLateral() {
  const rutaActual = usePathname();

  return (
    <aside className="menu-lateral">
      <div>
        <p className="titulo-menu">NAVEGACIÓN</p>

        <nav className="navegacion">
          <Link
            href="/"
            className={`enlace-menu ${
              rutaActual === "/" ? "activo" : ""
            }`}
          >
            Inicio
          </Link>

          <Link
            href="/mapa"
            className={`enlace-menu ${
              rutaActual === "/mapa" ? "activo" : ""
            }`}
          >
            Mapa
          </Link>

          <Link href="/eventos" className="enlace-menu">
            Eventos
          </Link>

          <Link href="/social" className="enlace-menu">
            Social
          </Link>

          <Link href="/perfil" className="enlace-menu">
            Perfil
          </Link>
        </nav>
      </div>

      <div className="accesos-rapidos">
        <p className="titulo-menu">ACCESOS RÁPIDOS</p>

        <Link
          href="/eventos/crear"
          className="crear-evento-lateral"
        >
          + Crear evento
        </Link>

        <Link href="/eventos" className="enlace-menu">
          Mis eventos
        </Link>

        <Link
          href="/configuracion"
          className="enlace-menu"
        >
          Configuración
        </Link>
      </div>
    </aside>
  );
}
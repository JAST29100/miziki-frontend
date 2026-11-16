"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface EnlaceNavegacion {
  href: string;
  etiqueta: string;
}

const enlacesNavegacion: EnlaceNavegacion[] = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/mapa", etiqueta: "Mapa" },
  { href: "/eventos", etiqueta: "Eventos" },
  { href: "/social", etiqueta: "Social" },
  { href: "/perfil", etiqueta: "Perfil" },
];

export default function MenuLateral() {
  const rutaActual = usePathname() ?? "";

  const esActivo = (href: string): boolean => {
    if (href === "/") {
      return rutaActual === "/";
    }

    return rutaActual === href || rutaActual.startsWith(`${href}/`);
  };

  return (
    <aside className="menu-lateral">
      <div>
        <p className="titulo-menu">NAVEGACIÓN</p>

        <nav className="navegacion">
          {enlacesNavegacion.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`enlace-menu ${
                esActivo(enlace.href) ? "activo" : ""
              }`}
              aria-current={esActivo(enlace.href) ? "page" : undefined}
            >
              {enlace.etiqueta}
            </Link>
          ))}
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

"use client";

import { useState } from "react";
import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";

interface PerfilUsuario {
  iniciales: string;
  nombreCompleto: string;
  resumen: string;
  etiquetas: string[];
}

interface Estadistica {
  id: string;
  valor: string;
  etiqueta: string;
}

interface InfoMusical {
  instrumentos: string;
  generos: string;
  disponibilidad: string;
}

interface CampoInfoMusical {
  clave: keyof InfoMusical;
  etiqueta: string;
}

type IdOpcionConfiguracion = "notificaciones" | "privacidad" | "cuenta";

interface OpcionConfiguracion {
  id: IdOpcionConfiguracion;
  titulo: string;
  descripcion: string;
}

// TODO: reemplazar por fetch a la API de NestJS (GET /usuarios/me)
const perfil: PerfilUsuario = {
  iniciales: "JC",
  nombreCompleto: "Juan Carlos Martínez",
  resumen: "Pianista · Cali, Colombia · Disponible para jams",
  etiquetas: ["Piano", "Jazz", "Blues"],
};

const estadisticas: Estadistica[] = [
  { id: "calificacion", valor: "4,9", etiqueta: "Calificación" },
  { id: "resenas", valor: "24", etiqueta: "Reseñas" },
  { id: "jams", valor: "16", etiqueta: "Jams" },
];

const infoMusicalInicial: InfoMusical = {
  instrumentos: "Piano · Teclado",
  generos: "Jazz · Blues · Soul",
  disponibilidad: "Lun · Mié · Vie después de las 18:00",
};

const camposInfoMusical: CampoInfoMusical[] = [
  { clave: "instrumentos", etiqueta: "Instrumentos" },
  { clave: "generos", etiqueta: "Géneros favoritos" },
  { clave: "disponibilidad", etiqueta: "Disponibilidad" },
];

const opcionesConfiguracion: OpcionConfiguracion[] = [
  {
    id: "notificaciones",
    titulo: "Notificaciones",
    descripcion: "Gestionar alertas",
  },
  {
    id: "privacidad",
    titulo: "Privacidad",
    descripcion: "Controlar visibilidad",
  },
  {
    id: "cuenta",
    titulo: "Cuenta",
    descripcion: "Correo y seguridad",
  },
];

export default function PaginaPerfil() {
  const [editando, setEditando] = useState(false);
  const [infoMusical, setInfoMusical] =
    useState<InfoMusical>(infoMusicalInicial);
  const [opcionActiva, setOpcionActiva] =
    useState<IdOpcionConfiguracion>("notificaciones");

  function alternarEdicion() {
    if (editando) {
      // TODO: reemplazar por PATCH a la API de NestJS (PATCH /usuarios/me)
    }

    setEditando((anterior) => !anterior);
  }

  function actualizarInfo(clave: keyof InfoMusical, valor: string) {
    setInfoMusical((anterior) => ({ ...anterior, [clave]: valor }));
  }

  function cerrarSesion() {
    // TODO: llamar al endpoint de cierre de sesión en NestJS y redirigir a /login
    console.info("Cerrar sesión");
  }

  return (
    <div className="pagina">
      <BarraSuperior />

      <div className="contenido">
        <MenuLateral />

        <main className="zona-pagina">
          <div className="encabezado-pagina">
            <div className="titulo-pagina">
              <h2>Mi perfil</h2>
            </div>

            <button
              type="button"
              className="boton-principal"
              onClick={alternarEdicion}
            >
              {editando ? "Guardar cambios" : "Editar perfil"}
            </button>
          </div>

          <section className="tarjeta-pagina perfil-cabecera">
            <div className="avatar-grande">{perfil.iniciales}</div>

            <div className="perfil-datos">
              <h3>{perfil.nombreCompleto}</h3>

              <p>{perfil.resumen}</p>

              <div className="etiquetas-perfil">
                {perfil.etiquetas.map((etiqueta, indice) => (
                  <span key={etiqueta}>
                    {indice > 0 && (
                      <span aria-hidden="true">· </span>
                    )}
                    {etiqueta}
                  </span>
                ))}
              </div>
            </div>

            <div className="perfil-estadisticas">
              {estadisticas.map((estadistica) => (
                <div className="estadistica" key={estadistica.id}>
                  <strong>{estadistica.valor}</strong>

                  <span>{estadistica.etiqueta}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="perfil-layout">
            <section className="tarjeta-pagina">
              <h3>Información musical</h3>

              {camposInfoMusical.map((campo) => (
                <div className="campo-formulario" key={campo.clave}>
                  <label htmlFor={`perfil-${campo.clave}`}>
                    {campo.etiqueta}
                  </label>

                  {editando ? (
                    <input
                      id={`perfil-${campo.clave}`}
                      type="text"
                      className="campo"
                      value={infoMusical[campo.clave]}
                      onChange={(e) =>
                        actualizarInfo(campo.clave, e.target.value)
                      }
                    />
                  ) : (
                    <div
                      id={`perfil-${campo.clave}`}
                      className="campo"
                    >
                      {infoMusical[campo.clave]}
                    </div>
                  )}
                </div>
              ))}
            </section>

            <section className="tarjeta-pagina">
              <h3>Configuración</h3>

              {opcionesConfiguracion.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  className={`opcion-config ${
                    opcion.id === opcionActiva ? "activa" : ""
                  }`}
                  aria-pressed={opcion.id === opcionActiva}
                  onClick={() => setOpcionActiva(opcion.id)}
                >
                  <strong>{opcion.titulo}</strong>

                  <span>{opcion.descripcion} →</span>
                </button>
              ))}

              <button
                type="button"
                className="boton-cerrar-sesion"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

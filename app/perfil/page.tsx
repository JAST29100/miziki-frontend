"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";
import { useActiveUser } from "@/contexts/ActiveUserContext";

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

const estadisticas = [
  { id: "calificacion", valor: "4,9", etiqueta: "Calificación" },
  { id: "resenas", valor: "24", etiqueta: "Reseñas" },
  { id: "jams", valor: "16", etiqueta: "Jams" },
];

const infoMusicalInicial: InfoMusical = {
  instrumentos: "Piano · Teclado",
  generos: "Jazz · Blues · Soul",
  disponibilidad: "Lun · Mié · Vie después de las 18:00",
};

const etiquetasIniciales = ["Piano", "Jazz", "Blues"];

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

function obtenerIniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/);

  return palabras
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
}

export default function PaginaPerfil() {
  const {
    users,
    activeUser,
    isLoading,
    error,
    selectUser,
    createActiveUser,
    updateActiveUser,
    reloadUsers,
  } = useActiveUser();

  const [editando, setEditando] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [correo, setCorreo] = useState("");

  const [infoMusical, setInfoMusical] =
    useState<InfoMusical>(infoMusicalInicial);

  const [opcionActiva, setOpcionActiva] =
    useState<IdOpcionConfiguracion>("notificaciones");

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [creandoUsuario, setCreandoUsuario] = useState(false);

  useEffect(() => {
    if (activeUser) {
      setNombreUsuario(activeUser.username);
      setCorreo(activeUser.email);
      setEditando(false);
    }
  }, [activeUser]);

  function actualizarInfo(clave: keyof InfoMusical, valor: string) {
    setInfoMusical((anterior) => ({
      ...anterior,
      [clave]: valor,
    }));
  }

  async function alternarEdicion() {
    if (!activeUser) {
      return;
    }

    if (!editando) {
      setEditando(true);
      return;
    }

    if (!nombreUsuario.trim() || !correo.trim()) {
      return;
    }

    try {
      await updateActiveUser({
        username: nombreUsuario.trim(),
        email: correo.trim(),
      });

      setEditando(false);
    } catch {
      // El contexto conserva y muestra el error de la API.
    }
  }

  async function crearUsuario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!nuevoNombre.trim() || !nuevoCorreo.trim()) {
      return;
    }

    setCreandoUsuario(true);

    try {
      await createActiveUser({
        username: nuevoNombre.trim(),
        email: nuevoCorreo.trim(),
      });

      setNuevoNombre("");
      setNuevoCorreo("");
    } catch {
      // El contexto conserva y muestra el error de la API.
    } finally {
      setCreandoUsuario(false);
    }
  }

  function cerrarSesion() {
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

            {activeUser && (
              <button
                type="button"
                className="boton-principal"
                onClick={alternarEdicion}
                disabled={
                  editando &&
                  (!nombreUsuario.trim() || !correo.trim())
                }
              >
                {editando ? "Guardar cambios" : "Editar perfil"}
              </button>
            )}
          </div>

          {isLoading ? (
            <section className="tarjeta-pagina">
              <p>Cargando usuarios...</p>
            </section>
          ) : !activeUser ? (
            <section className="tarjeta-pagina">
              <h3>Crear usuario</h3>

              <p>
                No hay usuarios registrados. Crea uno para comenzar
                a utilizar Miziki.
              </p>

              {error && (
                <p role="alert">
                  {error}
                </p>
              )}

              <form onSubmit={crearUsuario}>
                <div className="campo-formulario">
                  <label htmlFor="nuevo-username">
                    Nombre de usuario
                  </label>

                  <input
                    id="nuevo-username"
                    type="text"
                    className="campo"
                    value={nuevoNombre}
                    onChange={(evento) =>
                      setNuevoNombre(evento.target.value)
                    }
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="nuevo-email">
                    Correo electrónico
                  </label>

                  <input
                    id="nuevo-email"
                    type="email"
                    className="campo"
                    value={nuevoCorreo}
                    onChange={(evento) =>
                      setNuevoCorreo(evento.target.value)
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="boton-principal"
                  disabled={creandoUsuario}
                >
                  {creandoUsuario ? "Creando..." : "Crear usuario"}
                </button>
              </form>

              {error && (
                <button
                  type="button"
                  className="boton-pildora"
                  onClick={() => void reloadUsers()}
                >
                  Volver a intentar
                </button>
              )}
            </section>
          ) : (
            <>
              {error && (
                <p role="alert">
                  {error}
                </p>
              )}

              <section className="tarjeta-pagina perfil-cabecera">
                <div className="avatar-grande">
                  {obtenerIniciales(activeUser.username)}
                </div>

                <div className="perfil-datos">
                  {editando ? (
                    <>
                      <div className="campo-formulario">
                        <label htmlFor="perfil-username">
                          Nombre de usuario
                        </label>

                        <input
                          id="perfil-username"
                          type="text"
                          className="campo"
                          value={nombreUsuario}
                          onChange={(evento) =>
                            setNombreUsuario(evento.target.value)
                          }
                        />
                      </div>

                      <div className="campo-formulario">
                        <label htmlFor="perfil-email">
                          Correo electrónico
                        </label>

                        <input
                          id="perfil-email"
                          type="email"
                          className="campo"
                          value={correo}
                          onChange={(evento) =>
                            setCorreo(evento.target.value)
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h3>{activeUser.username}</h3>
                      <p>{activeUser.email}</p>
                    </>
                  )}

                  <div className="etiquetas-perfil">
                    {etiquetasIniciales.map((etiqueta, indice) => (
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
                    <div
                      className="estadistica"
                      key={estadistica.id}
                    >
                      <strong>{estadistica.valor}</strong>
                      <span>{estadistica.etiqueta}</span>
                    </div>
                  ))}
                </div>
              </section>

              {users.length > 1 && (
                <section className="tarjeta-pagina">
                  <div className="campo-formulario">
                    <label htmlFor="usuario-activo">
                      Usuario activo
                    </label>

                    <select
                      id="usuario-activo"
                      className="campo"
                      value={activeUser.id}
                      onChange={(evento) =>
                        selectUser(evento.target.value)
                      }
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </section>
              )}

              <div className="perfil-layout">
                <section className="tarjeta-pagina">
                  <h3>Información musical</h3>

                  {camposInfoMusical.map((campo) => (
                    <div
                      className="campo-formulario"
                      key={campo.clave}
                    >
                      <label htmlFor={`perfil-${campo.clave}`}>
                        {campo.etiqueta}
                      </label>

                      {editando ? (
                        <input
                          id={`perfil-${campo.clave}`}
                          type="text"
                          className="campo"
                          value={infoMusical[campo.clave]}
                          onChange={(evento) =>
                            actualizarInfo(
                              campo.clave,
                              evento.target.value,
                            )
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

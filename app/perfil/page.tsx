
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

interface ConfiguracionUsuario {
  notificaciones: {
    nuevasPublicaciones: boolean;
    mensajes: boolean;
    eventos: boolean;
  };
  privacidad: {
    perfilPublico: boolean;
    mostrarCorreo: boolean;
    permitirMensajes: boolean;
  };
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

const configuracionInicial: ConfiguracionUsuario = {
  notificaciones: {
    nuevasPublicaciones: true,
    mensajes: true,
    eventos: true,
  },
  privacidad: {
    perfilPublico: true,
    mostrarCorreo: false,
    permitirMensajes: true,
  },
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

function obtenerInfoMusical(userId: string): InfoMusical {
  const guardada = localStorage.getItem(
    `miziki.infoMusical.${userId}`,
  );

  if (!guardada) {
    return infoMusicalInicial;
  }

  try {
    const datos = JSON.parse(guardada) as Partial<InfoMusical>;

    return {
      instrumentos:
        datos.instrumentos ?? infoMusicalInicial.instrumentos,
      generos: datos.generos ?? infoMusicalInicial.generos,
      disponibilidad:
        datos.disponibilidad ?? infoMusicalInicial.disponibilidad,
    };
  } catch {
    return infoMusicalInicial;
  }
}

function obtenerConfiguracion(userId: string): ConfiguracionUsuario {
  const guardada = localStorage.getItem(
    `miziki.configuracion.${userId}`,
  );

  if (!guardada) {
    return configuracionInicial;
  }

  try {
    const datos = JSON.parse(guardada) as Partial<ConfiguracionUsuario>;

    return {
      notificaciones: {
        ...configuracionInicial.notificaciones,
        ...datos.notificaciones,
      },
      privacidad: {
        ...configuracionInicial.privacidad,
        ...datos.privacidad,
      },
    };
  } catch {
    return configuracionInicial;
  }
}

export default function PaginaPerfil() {
  const {
    users,
    activeUser,
    isLoading,
    error,
    selectUser,
    logout,
    createActiveUser,
    updateActiveUser,
    reloadUsers,
  } = useActiveUser();

  const [editando, setEditando] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [correo, setCorreo] = useState("");

  const [infoMusical, setInfoMusical] =
    useState<InfoMusical>(infoMusicalInicial);

  const [configuracion, setConfiguracion] =
    useState<ConfiguracionUsuario>(configuracionInicial);

  const [opcionActiva, setOpcionActiva] =
    useState<IdOpcionConfiguracion>("notificaciones");

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [creandoUsuario, setCreandoUsuario] = useState(false);
  const [mostrarFormularioCrear, setMostrarFormularioCrear] =
    useState(false);

  useEffect(() => {
    if (activeUser) {
      setNombreUsuario(activeUser.username);
      setCorreo(activeUser.email);
      setInfoMusical(obtenerInfoMusical(activeUser.id));
      setConfiguracion(obtenerConfiguracion(activeUser.id));
      setEditando(false);
      setMostrarFormularioCrear(false);
    } else {
      setInfoMusical(infoMusicalInicial);
      setConfiguracion(configuracionInicial);
      setEditando(false);
    }
  }, [activeUser]);

  function actualizarInfo(clave: keyof InfoMusical, valor: string) {
    setInfoMusical((anterior) => ({
      ...anterior,
      [clave]: valor,
    }));
  }


  function actualizarConfiguracion(
    seccion: keyof ConfiguracionUsuario,
    clave: string,
    valor: boolean,
  ) {
    if (!activeUser) {
      return;
    }

    setConfiguracion((anterior) => {
      let actualizada: ConfiguracionUsuario;

      if (seccion === "notificaciones") {
        actualizada = {
          ...anterior,
          notificaciones: {
            ...anterior.notificaciones,
            [clave]: valor,
          },
        };
      } else {
        actualizada = {
          ...anterior,
          privacidad: {
            ...anterior.privacidad,
            [clave]: valor,
          },
        };
      }

      localStorage.setItem(
        `miziki.configuracion.${activeUser.id}`,
        JSON.stringify(actualizada),
      );

      return actualizada;
    });
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

      localStorage.setItem(
        `miziki.infoMusical.${activeUser.id}`,
        JSON.stringify(infoMusical),
      );

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
      setMostrarFormularioCrear(false);
    } catch {
      // El contexto conserva y muestra el error de la API.
    } finally {
      setCreandoUsuario(false);
    }
  }

  function formularioCrearUsuario() {
    return (
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
    );
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
            <>
              <section className="tarjeta-pagina">
                <h3>Seleccionar usuario</h3>

                <p>
                  Selecciona una cuenta existente o crea un usuario
                  nuevo para comenzar.
                </p>

                {error && <p role="alert">{error}</p>}

                {users.length > 0 ? (
                  <div className="campo-formulario">
                    <label htmlFor="usuario-activo">
                      Usuarios registrados
                    </label>

                    <select
                      id="usuario-activo"
                      className="campo"
                      defaultValue=""
                      onChange={(evento) => {
                        if (evento.target.value) {
                          selectUser(evento.target.value);
                        }
                      }}
                    >
                      <option value="" disabled>
                        Selecciona un usuario
                      </option>

                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p>No hay usuarios registrados todavía.</p>
                )}

                <button
                  type="button"
                  className="boton-pildora"
                  onClick={() => void reloadUsers()}
                >
                  Actualizar usuarios
                </button>
              </section>

              <section className="tarjeta-pagina">
                <h3>Crear usuario</h3>
                {formularioCrearUsuario()}
              </section>
            </>
          ) : (
            <>
              {error && <p role="alert">{error}</p>}

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

                <button
                  type="button"
                  className="boton-pildora"
                  onClick={() =>
                    setMostrarFormularioCrear((anterior) => !anterior)
                  }
                >
                  {mostrarFormularioCrear
                    ? "Cancelar"
                    : "Crear otro usuario"}
                </button>

                {mostrarFormularioCrear && (
                  <div>
                    <h3>Nuevo usuario</h3>
                    {formularioCrearUsuario()}
                  </div>
                )}
              </section>

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

                  {opcionActiva === "notificaciones" && (
                    <div>
                      <h3>Preferencias de notificaciones</h3>

                      <div className="campo-formulario">
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              configuracion.notificaciones.nuevasPublicaciones
                            }
                            onChange={(evento) =>
                              actualizarConfiguracion(
                                "notificaciones",
                                "nuevasPublicaciones",
                                evento.target.checked,
                              )
                            }
                          />
                          Notificaciones de nuevas publicaciones
                        </label>
                      </div>

                      <div className="campo-formulario">
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              configuracion.notificaciones.mensajes
                            }
                            onChange={(evento) =>
                              actualizarConfiguracion(
                                "notificaciones",
                                "mensajes",
                                evento.target.checked,
                              )
                            }
                          />
                          Notificaciones de mensajes
                        </label>
                      </div>

                      <div className="campo-formulario">
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              configuracion.notificaciones.eventos
                            }
                            onChange={(evento) =>
                              actualizarConfiguracion(
                                "notificaciones",
                                "eventos",
                                evento.target.checked,
                              )
                            }
                          />
                          Recordatorios de eventos
                        </label>
                      </div>
                    </div>
                  )}

                  {opcionActiva === "privacidad" && (
                    <div>
                      <h3>Preferencias de privacidad</h3>

                      <div className="campo-formulario">
                        <label>
                          <input
                            type="checkbox"
                            checked={configuracion.privacidad.perfilPublico}
                            onChange={(evento) =>
                              actualizarConfiguracion(
                                "privacidad",
                                "perfilPublico",
                                evento.target.checked,
                              )
                            }
                          />
                          Perfil público
                        </label>
                      </div>

                      <div className="campo-formulario">
                        <label>
                          <input
                            type="checkbox"
                            checked={configuracion.privacidad.mostrarCorreo}
                            onChange={(evento) =>
                              actualizarConfiguracion(
                                "privacidad",
                                "mostrarCorreo",
                                evento.target.checked,
                              )
                            }
                          />
                          Mostrar mi correo electrónico
                        </label>
                      </div>

                      <div className="campo-formulario">
                        <label>
                          <input
                            type="checkbox"
                            checked={configuracion.privacidad.permitirMensajes}
                            onChange={(evento) =>
                              actualizarConfiguracion(
                                "privacidad",
                                "permitirMensajes",
                                evento.target.checked,
                              )
                            }
                          />
                          Permitir que otros usuarios me contacten
                        </label>
                      </div>
                    </div>
                  )}

                  {opcionActiva === "cuenta" && (
                    <div>
                      <h3>Información de la cuenta</h3>

                      <div className="campo-formulario">
                        <label htmlFor="cuenta-username">
                          Nombre de usuario
                        </label>
                        <input
                          id="cuenta-username"
                          className="campo"
                          value={activeUser.username}
                          readOnly
                        />
                      </div>

                      <div className="campo-formulario">
                        <label htmlFor="cuenta-email">
                          Correo electrónico
                        </label>
                        <input
                          id="cuenta-email"
                          className="campo"
                          value={activeUser.email}
                          readOnly
                        />
                      </div>

                      <p>
                        Para modificar estos datos, utiliza la opción
                        "Editar perfil".
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className="boton-cerrar-sesion"
                    onClick={logout}
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

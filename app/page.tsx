"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";
import { useActiveUser } from "@/contexts/ActiveUserContext";
import { postService } from "@/services/post.service";
import type { Post } from "@/types/post";

const musicos = [
  {
    id: 1,
    iniciales: "CD",
    nombre: "Carlos Delgado",
    instrumento: "Guitarra",
    distancia: "0,4 km",
  },
  {
    id: 2,
    iniciales: "SR",
    nombre: "Sofía Ramírez",
    instrumento: "Voz",
    distancia: "0,7 km",
  },
  {
    id: 3,
    iniciales: "ET",
    nombre: "Elena Torres",
    instrumento: "Piano",
    distancia: "1,2 km",
  },
];

const creaciones = [
  {
    id: 1,
    titulo: "Noches frías",
    autor: "Carlos Rojas Neme",
    instrumento: "Piano",
    simbolo: "♫",
  },
  {
    id: 2,
    titulo: "Fur Elise - Cover",
    autor: "Juan Jose Franco",
    instrumento: "Piano",
    simbolo: "♪",
  },
];

function obtenerFecha(fecha: string): string {
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function Home() {
  const { users, activeUser, isLoading: isLoadingUser } =
    useActiveUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [contenido, setContenido] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarPublicaciones() {
      setIsLoadingPosts(true);
      setPostError(null);

      try {
        const publicaciones = await postService.getAll();
        setPosts(publicaciones);
      } catch (error) {
        setPostError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las publicaciones.",
        );
      } finally {
        setIsLoadingPosts(false);
      }
    }

    void cargarPublicaciones();
  }, []);

  async function publicar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const texto = contenido.trim();

    if (!texto || !activeUser || isPublishing) {
      return;
    }

    setIsPublishing(true);
    setPostError(null);

    try {
      const publicaciones = await postService.create({
        userId: activeUser.id,
        numberId: String(Date.now()),
        contenido: texto,
        fecha: new Date().toISOString(),
      });

      setPosts(publicaciones);
      setContenido("");
    } catch (error) {
      setPostError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la publicación.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  async function editarPublicacion(post: Post) {
    const nuevoContenido = window.prompt(
      "Editar publicación:",
      post.contenido,
    );

    if (nuevoContenido === null) {
      return;
    }

    const texto = nuevoContenido.trim();

    if (!texto) {
      return;
    }

    setPostError(null);

    try {
      const publicaciones = await postService.update(post.id, {
        contenido: texto,
      });

      setPosts(publicaciones);
    } catch (error) {
      setPostError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la publicación.",
      );
    }
  }

  async function eliminarPublicacion(postId: string) {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta publicación?",
    );

    if (!confirmar) {
      return;
    }

    setPostError(null);

    try {
      const publicaciones = await postService.delete(postId);
      setPosts(publicaciones);
    } catch (error) {
      setPostError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la publicación.",
      );
    }
  }

  function obtenerNombreAutor(userId: string): string {
    return (
      users.find((user) => user.id === userId)?.username ??
      "Usuario desconocido"
    );
  }

  return (
    <div className="pagina">
      <BarraSuperior />

      <div className="contenido">
        <MenuLateral />

        <main className="zona-central">
          <div className="saludo">
            <h2>
              Hola, {activeUser?.username ?? "usuario"}
            </h2>

            <p>
              Encuentra músicos, comparte tus creaciones
              y crea momentos en comunidad.
            </p>
          </div>

          <form className="publicar" onSubmit={publicar}>
            <textarea
              placeholder="Comparte una idea, una canción o invita a un evento..."
              value={contenido}
              onChange={(evento) =>
                setContenido(evento.target.value)
              }
              disabled={isLoadingUser || !activeUser || isPublishing}
            />

            <div className="publicar-acciones">
              <button
                type="submit"
                className="boton-publicar"
                disabled={
                  isLoadingUser ||
                  !activeUser ||
                  !contenido.trim() ||
                  isPublishing
                }
              >
                {isPublishing ? "Publicando..." : "Publicar"}
              </button>
            </div>

            {!isLoadingUser && !activeUser && (
              <p role="alert">
                Selecciona o crea un usuario desde tu perfil para publicar.
              </p>
            )}
          </form>

          {postError && (
            <p role="alert" className="mensaje-error">
              {postError}
            </p>
          )}

          <section className="seccion">
            <div className="encabezado-seccion">
              <h3>Publicaciones recientes</h3>
            </div>

            {isLoadingPosts ? (
              <p>Cargando publicaciones...</p>
            ) : posts.length === 0 ? (
              <p>
                Todavía no hay publicaciones. Comparte algo con la comunidad.
              </p>
            ) : (
              <div className="lista-creaciones">
                {[...posts].reverse().map((post) => {
                  const esAutor = post.userId === activeUser?.id;

                  return (
                    <article
                      className="tarjeta-creacion"
                      key={post.id}
                    >
                      <div className="portada-creacion">
                        <span>♫</span>
                      </div>

                      <div className="informacion-creacion">
                        <h4>{post.contenido}</h4>

                        <p>{obtenerNombreAutor(post.userId)}</p>

                        <p>{obtenerFecha(post.fecha)}</p>

                        <div className="pie-creacion">
                          <span className="etiqueta">
                            Publicación
                          </span>

                          {esAutor && (
                            <>
                              <button
                                type="button"
                                className="boton-escuchar"
                                onClick={() =>
                                  void editarPublicacion(post)
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className="boton-escuchar"
                                onClick={() =>
                                  void eliminarPublicacion(post.id)
                                }
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="seccion">
            <div className="encabezado-seccion">
              <h3>Músicos cerca de ti</h3>

              <Link href="/mapa" className="ver-todo">
                Ver en mapa →
              </Link>
            </div>

            <div className="lista-musicos">
              {musicos.map((musico) => (
                <article
                  className="tarjeta-musico"
                  key={musico.id}
                >
                  <div className="avatar">
                    {musico.iniciales}
                  </div>

                  <h4>{musico.nombre}</h4>

                  <p>
                    {musico.instrumento} - {musico.distancia}
                  </p>

                  <button className="boton-perfil">
                    Ver perfil
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="seccion">
            <div className="encabezado-seccion">
              <h3>Creaciones populares</h3>

              <a href="#" className="ver-todo">
                Explorar todo →
              </a>
            </div>

            <div className="lista-creaciones">
              {creaciones.map((creacion) => (
                <article
                  className="tarjeta-creacion"
                  key={creacion.id}
                >
                  <div className="portada-creacion">
                    <span>{creacion.simbolo}</span>
                  </div>

                  <div className="informacion-creacion">
                    <h4>{creacion.titulo}</h4>

                    <p>{creacion.autor}</p>

                    <div className="pie-creacion">
                      <span className="etiqueta">
                        {creacion.instrumento}
                      </span>

                      <button className="boton-escuchar">
                        Escuchar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="panel-derecho">
          <section className="panel-tarjeta">
            <div className="encabezado-panel">
              <h3>Eventos cerca de ti</h3>
              <a href="#">Ver todos →</a>
            </div>

            <div className="evento evento-verde">
              <span className="fecha-evento">
                HOY · 20:00
              </span>

              <h4>Jam de Blues en El Loco Club</h4>
              <p>Cali · 0,4 km</p>
            </div>

            <div className="evento">
              <span className="fecha-evento">
                SÁB · 18:00
              </span>

              <h4>Aurora Sound Fest</h4>
              <p>Cali · 0,5 km</p>
            </div>
          </section>

          <section className="panel-tarjeta">
            <h3>Social</h3>

            <p className="descripcion-panel">
              Conecta con tu comunidad musical
            </p>

            <div className="social-item social-verde">
              <h4>Amigos</h4>
              <p>3 músicos activos cerca de ti</p>
            </div>

            <div className="social-item">
              <h4>Mensajes</h4>
              <p>Sofía Ramírez te escribió hace 5 min</p>
            </div>
          </section>

          <section className="panel-tarjeta actividad">
            <h3>Gestiona tu actividad</h3>

            <button className="boton-crear">
              + Crear evento
            </button>

            <div className="botones-actividad">
              <button>Mis eventos</button>
              <button>Mi perfil</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

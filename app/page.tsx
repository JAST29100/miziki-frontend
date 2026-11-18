"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

import BarraSuperior from "@/components/BarraSuperior";
import CreacionCard from "@/components/CreacionCard";
import MenuLateral from "@/components/MenuLateral";
import { useActiveUser } from "@/contexts/ActiveUserContext";
import { eventService } from "@/services/event.service";
import { matchService, MatchServiceError } from "@/services/match.service";
import { messageService } from "@/services/message.service";
import { postService } from "@/services/post.service";
import { songService } from "@/services/song.service";
import type { Event } from "@/types/event";
import type { Post } from "@/types/post";
import type { Song } from "@/types/song";
import type { User } from "@/types/user";

const detallesMusicoFallback = [
  {
    instrumento: "Guitarra",
    distancia: "0,4 km",
  },
  {
    instrumento: "Voz",
    distancia: "0,7 km",
  },
  {
    instrumento: "Piano",
    distancia: "1,2 km",
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
  const activeUserId = activeUser?.id;

  const [posts, setPosts] = useState<Post[]>([]);
  const [contenido, setContenido] = useState("");
  const [tipoPublicar, setTipoPublicar] = useState<"publicacion" | "cancion">("publicacion");
  const [tituloCancion, setTituloCancion] = useState("");
  const [generoCancion, setGeneroCancion] = useState("");
  const [albumCancion, setAlbumCancion] = useState("");
  const [duracionCancion, setDuracionCancion] = useState("");
  const [songPublishError, setSongPublishError] = useState<string | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [songError, setSongError] = useState<string | null>(null);
  const [musicosSugeridos, setMusicosSugeridos] = useState<User[]>([]);
  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set());
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);
  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null);
  const [socialMatchCount, setSocialMatchCount] = useState(0);
  const [conversacionReciente, setConversacionReciente] = useState<string>("Aún no hay conversaciones");

  useEffect(() => {
    let vigente = true;
    async function cargarSocial() {
      if (!activeUserId) {
        setSocialMatchCount(0);
        setConversacionReciente("Selecciona un usuario para ver su actividad");
        return;
      }
      try {
        const [matches, conversaciones] = await Promise.all([
          matchService.getAll(activeUserId),
          messageService.getConversations(),
        ]);
        if (!vigente) return;
        setSocialMatchCount(matches.length);
        const recientes = conversaciones.filter((conversation) =>
          conversation.userId === activeUserId || conversation.otherUserId === activeUserId,
        );
        setConversacionReciente(recientes.length ? `${recientes.length} conversación${recientes.length === 1 ? "" : "es"} reciente${recientes.length === 1 ? "" : "s"}` : "Aún no hay conversaciones");
      } catch {
        if (vigente) {
          setSocialMatchCount(0);
          setConversacionReciente("No se pudo cargar la actividad");
        }
      }
    }
    void cargarSocial();
    return () => { vigente = false; };
  }, [activeUserId]);

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

  useEffect(() => {
    let vigente = true;

    async function cargarSugerencias() {
      if (!activeUserId) {
        setMusicosSugeridos([]);
        setMatchedUserIds(new Set());
        setMatchError(null);
        setMatchFeedback(null);
        setIsLoadingMatches(false);
        return;
      }

      setIsLoadingMatches(true);
      setMatchError(null);
      try {
        const [candidatos, misMatches] = await Promise.all([
          matchService.discover(activeUserId),
          matchService.getAll(activeUserId),
        ]);
        if (!vigente) return;
        const idsMatch = new Set(
          misMatches.flatMap((match) =>
            match.usuariosMatch.filter((id) => id !== activeUserId),
          ),
        );
        setMatchedUserIds(idsMatch);
        const candidatosPorId = new Map(
          candidatos.map((candidato) => [candidato.id, candidato] as const),
        );
        users.forEach((usuario) => {
          if (idsMatch.has(usuario.id)) candidatosPorId.set(usuario.id, usuario);
        });
        setMusicosSugeridos([...candidatosPorId.values()]);
      } catch (error) {
        if (!vigente) return;
        setMatchError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los músicos sugeridos.",
        );
      } finally {
        if (vigente) setIsLoadingMatches(false);
      }
    }

    void cargarSugerencias();
    return () => {
      vigente = false;
    };
  }, [activeUserId, users]);

  useEffect(() => {
    async function cargarCanciones() {
      try {
        setSongs(await songService.getAll());
      } catch (error) {
        setSongError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las canciones.",
        );
      } finally {
        setIsLoadingSongs(false);
      }
    }

    void cargarCanciones();
  }, []);

  useEffect(() => {
    async function cargarEventos() {
      try {
        setEvents(await eventService.getAll());
      } catch (error) {
        setEventError(
          error instanceof Error ? error.message : "No se pudieron cargar los eventos.",
        );
      } finally {
        setIsLoadingEvents(false);
      }
    }

    void cargarEventos();
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

  async function publicarCancion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const duracion = Number(duracionCancion);
    if (
      !activeUser ||
      !tituloCancion.trim() ||
      !generoCancion.trim() ||
      !Number.isInteger(duracion) ||
      duracion <= 0 ||
      isPublishing
    ) {
      return;
    }

    setIsPublishing(true);
    setSongPublishError(null);
    try {
      const nuevas = await songService.create({
        titulo: tituloCancion.trim(),
        artista: activeUser.username,
        genero: generoCancion.trim(),
        album: albumCancion.trim() || undefined,
        duracion,
      });
      setSongs((anteriores) => [
        ...nuevas,
        ...anteriores.filter(
          (cancion) => !nuevas.some((nueva) => nueva.id === cancion.id),
        ),
      ]);
      setTituloCancion("");
      setGeneroCancion("");
      setAlbumCancion("");
      setDuracionCancion("");
    } catch (error) {
      setSongPublishError(
        error instanceof Error ? error.message : "No se pudo publicar la canción.",
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

  async function darLike(musico: User) {
    if (!activeUser || processingMatchId) return;
    setProcessingMatchId(musico.id);
    setMatchError(null);
    setMatchFeedback(null);
    try {
      const nuevoMatch = await matchService.like(activeUser.id, musico.id);
      if (nuevoMatch) {
        setMatchedUserIds((anteriores) => new Set(anteriores).add(musico.id));
        setMatchFeedback(`¡Tienes un match con ${musico.username}!`);
        try {
          const { created } = await messageService.ensureConversation(activeUser.id, musico.id);
          setMatchFeedback(
            `¡Tienes un match con ${musico.username}! ${created ? "Chat creado." : "El chat ya estaba creado."}`,
          );
        } catch (error) {
          setMatchError(
            error instanceof Error
              ? `Match creado, pero no se pudo iniciar el chat: ${error.message}`
              : "Match creado, pero no se pudo iniciar el chat.",
          );
        }
      } else {
        setMusicosSugeridos((anteriores) => anteriores.filter((item) => item.id !== musico.id));
        setMatchFeedback(`Le enviaste un me gusta a ${musico.username}.`);
      }
    } catch (error) {
      if (error instanceof MatchServiceError && error.status === 409) {
        setMusicosSugeridos((anteriores) =>
          anteriores.filter((item) => item.id !== musico.id),
        );
        setMatchFeedback(`Ya habías enviado un me gusta a ${musico.username}.`);
        return;
      }
      setMatchError(error instanceof Error ? error.message : "No se pudo enviar el me gusta.");
    } finally {
      setProcessingMatchId(null);
    }
  }

  async function rechazarMusico(musico: User) {
    if (!activeUser || processingMatchId) return;
    setProcessingMatchId(musico.id);
    setMatchError(null);
    setMatchFeedback(null);
    try {
      await matchService.reject(activeUser.id, musico.id);
      setMusicosSugeridos((anteriores) => anteriores.filter((item) => item.id !== musico.id));
    } catch (error) {
      setMatchError(error instanceof Error ? error.message : "No se pudo descartar al músico.");
    } finally {
      setProcessingMatchId(null);
    }
  }

  function obtenerNombreAutor(userId: string): string {
    return (
      users.find((user) => user.id === userId)?.username ??
      "Usuario desconocido"
    );
  }

  function obtenerIniciales(nombre: string): string {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("");
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

          <form
            className="publicar"
            onSubmit={tipoPublicar === "publicacion" ? publicar : publicarCancion}
          >
            <div
              className="selector-publicar"
              role="group"
              aria-label="Tipo de contenido"
            >
              <button
                type="button"
                className={tipoPublicar === "publicacion" ? "activo" : ""}
                onClick={() => {
                  setTipoPublicar("publicacion");
                  setSongPublishError(null);
                }}
              >
                Publicación
              </button>
              <button
                type="button"
                className={tipoPublicar === "cancion" ? "activo" : ""}
                onClick={() => {
                  setTipoPublicar("cancion");
                  setPostError(null);
                }}
              >
                Canción
              </button>
            </div>

            {tipoPublicar === "publicacion" ? (
              <textarea
                placeholder="Comparte una idea, una canción o invita a un evento..."
                value={contenido}
                onChange={(evento) => setContenido(evento.target.value)}
                disabled={isLoadingUser || !activeUser || isPublishing}
              />
            ) : (
              <div className="campos-publicar-cancion">
                <input
                  className="campo"
                  aria-label="Título de la canción"
                  placeholder="Título"
                  value={tituloCancion}
                  onChange={(evento) => setTituloCancion(evento.target.value)}
                  required
                  disabled={isLoadingUser || !activeUser || isPublishing}
                />
                <input
                  className="campo"
                  aria-label="Género"
                  placeholder="Género"
                  value={generoCancion}
                  onChange={(evento) => setGeneroCancion(evento.target.value)}
                  required
                  disabled={isLoadingUser || !activeUser || isPublishing}
                />
                <input
                  className="campo"
                  aria-label="Álbum opcional"
                  placeholder="Álbum (opcional)"
                  value={albumCancion}
                  onChange={(evento) => setAlbumCancion(evento.target.value)}
                  disabled={isLoadingUser || !activeUser || isPublishing}
                />
                <input
                  className="campo"
                  aria-label="Duración en segundos"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Duración (segundos)"
                  value={duracionCancion}
                  onChange={(evento) => setDuracionCancion(evento.target.value)}
                  required
                  disabled={isLoadingUser || !activeUser || isPublishing}
                />
              </div>
            )}

            <div className="publicar-acciones">
              <button
                type="submit"
                className="boton-publicar"
                disabled={
                  isLoadingUser ||
                  !activeUser ||
                  (tipoPublicar === "publicacion" && !contenido.trim()) ||
                  (tipoPublicar === "cancion" &&
                    (!tituloCancion.trim() ||
                      !generoCancion.trim() ||
                      !Number.isInteger(Number(duracionCancion)) ||
                      Number(duracionCancion) <= 0)) ||
                  isPublishing
                }
              >
                {isPublishing
                  ? "Publicando..."
                  : tipoPublicar === "publicacion"
                    ? "Publicar"
                    : "Publicar canción"}
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
          {songPublishError && (
            <p role="alert" className="mensaje-error">
              {songPublishError}
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

            {matchError && (
              <p role="alert" className="mensaje-error">
                {matchError}
              </p>
            )}
            {matchFeedback && <p role="status">{matchFeedback}</p>}

            <div className="lista-musicos">
              {isLoadingMatches ? (
                <p>Cargando músicos sugeridos...</p>
              ) : musicosSugeridos.length === 0 ? (
                <p>No hay músicos sugeridos por ahora.</p>
              ) : (
                musicosSugeridos.map((musico, index) => {
                  const detalle =
                    detallesMusicoFallback[index % detallesMusicoFallback.length];

                  return (
                    <article
                      className="tarjeta-musico"
                      key={musico.id}
                    >
                      <div className="avatar">
                        {obtenerIniciales(musico.username)}
                      </div>

                      <h4>{musico.username}</h4>

                      <p>
                        {detalle.instrumento} - {detalle.distancia}
                      </p>

                      {matchedUserIds.has(musico.id) ? (
                        <span className="etiqueta">Match</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="boton-perfil"
                            onClick={() => void darLike(musico)}
                            disabled={processingMatchId !== null}
                          >
                            Me gusta
                          </button>
                          <button
                            type="button"
                            className="boton-pasar"
                            onClick={() => void rechazarMusico(musico)}
                            disabled={processingMatchId !== null}
                          >
                            Pasar
                          </button>
                        </>
                      )}
                    </article>
                  );
                })
              )}
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
              {isLoadingSongs ? (
                <p>Cargando canciones...</p>
              ) : songError ? (
                <p role="alert" className="mensaje-error">
                  {songError}
                </p>
              ) : songs.length === 0 ? (
                <p>Todavía no hay canciones publicadas.</p>
              ) : (
                songs.map((song) => (
                  <CreacionCard key={song.id} song={song} />
                ))
              )}
            </div>
          </section>
        </main>

        <aside className="panel-derecho">
          <section className="panel-tarjeta">
            <div className="encabezado-panel">
              <h3>Eventos cerca de ti</h3>
              <Link href="/eventos">Ver todos →</Link>
            </div>

            {isLoadingEvents ? (
              <p>Cargando eventos...</p>
            ) : eventError ? (
              <p role="alert" className="mensaje-error">{eventError}</p>
            ) : events.filter((event) => new Date(event.fecha).getTime() >= Date.now()).length === 0 ? (
              <p>Todavía no hay eventos próximos.</p>
            ) : (
              events
                .filter((event) => new Date(event.fecha).getTime() >= Date.now())
                .slice(0, 2)
                .map((event, index) => (
                  <div className={`evento ${index === 0 ? "evento-verde" : ""}`} key={event.id}>
                    <span className="fecha-evento">
                      {new Date(event.fecha).toLocaleString("es-CO", {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                    <h4>{event.titulo}</h4>
                    <p>{event.descripcion || "Cali, Colombia"} · {event.asistentes.length} asistentes</p>
                  </div>
                ))
            )}
          </section>

          <section className="panel-tarjeta">
            <h3>Social</h3>

            <p className="descripcion-panel">
              Conecta con tu comunidad musical
            </p>

            <Link href="/social" className="social-item social-verde">
              <h4>Amigos</h4>
              <p>{socialMatchCount} {socialMatchCount === 1 ? "match" : "matches"} activos</p>
            </Link>

            <Link href="/social" className="social-item">
              <h4>Mensajes</h4>
              <p>{conversacionReciente}</p>
            </Link>
          </section>

          <section className="panel-tarjeta actividad">
            <h3>Gestiona tu actividad</h3>

            <Link href="/eventos" className="boton-crear">+ Crear evento</Link>

            <div className="botones-actividad">
              <Link href="/eventos">Mis eventos</Link>
              <Link href="/perfil">Mi perfil</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

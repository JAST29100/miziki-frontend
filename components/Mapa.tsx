"use client";

import { useEffect, useState } from "react";
import { matchService, MatchServiceError } from "@/services/match.service";
import { messageService } from "@/services/message.service";
import { useActiveUser } from "@/contexts/ActiveUserContext";
import type { Match } from "@/types/match";
import type { User } from "@/types/user";

interface Musico {
  id: string;
  nombre: string;
  instrumento: string;
  nivel: string;
  distancia: number;
  esMatch: boolean;
  posicion: {
    left: string;
    top: string;
  };
}

interface Evento {
  id: number;
  nombre: string;
  posicion: {
    left: string;
    top: string;
  };
}

export default function Mapa() {
  const { activeUser, users } = useActiveUser();
  const activeUserId = activeUser?.id;
  const [candidatos, setCandidatos] = useState<User[]>([]);
  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set());
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoadingMusicos, setIsLoadingMusicos] = useState(true);
  const [errorMusicos, setErrorMusicos] = useState<string | null>(null);
  const [distancia, setDistancia] = useState("5");
  const [instrumento, setInstrumento] = useState("Todos");
  const [nivel, setNivel] = useState("Todos");

  useEffect(() => {
    let vigente = true;

    async function cargarCandidatos() {
      if (!activeUserId) {
        setCandidatos([]);
        setMatchedUserIds(new Set());
        setErrorMusicos(null);
        setIsLoadingMusicos(false);
        return;
      }

      setIsLoadingMusicos(true);
      setErrorMusicos(null);
      try {
        const [descubiertos, misMatches]: [User[], Match[]] = await Promise.all([
          matchService.discover(activeUserId),
          matchService.getAll(activeUserId),
        ]);
        if (vigente) {
          const idsMatch = new Set(
            misMatches.flatMap((match) =>
              match.usuariosMatch.filter((id) => id !== activeUserId),
            ),
          );
          setMatchedUserIds(idsMatch);
          const candidatosPorId = new Map(
            descubiertos.map((usuario) => [usuario.id, usuario] as const),
          );
          users.forEach((usuario) => {
            if (idsMatch.has(usuario.id)) candidatosPorId.set(usuario.id, usuario);
          });
          setCandidatos([...candidatosPorId.values()]);
        }
      } catch (error) {
        if (vigente) {
          setErrorMusicos(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los músicos del mapa.",
          );
        }
      } finally {
        if (vigente) setIsLoadingMusicos(false);
      }
    }

    void cargarCandidatos();
    return () => {
      vigente = false;
    };
  }, [activeUserId, users]);

  async function darLike(usuario: User) {
    if (!activeUserId || processingUserId) return;
    setProcessingUserId(usuario.id);
    setErrorMusicos(null);
    setMatchFeedback(null);
    try {
      const nuevoMatch = await matchService.like(activeUserId, usuario.id);
      setSelectedUserId(null);
      if (nuevoMatch) {
        setMatchedUserIds((anteriores) => new Set(anteriores).add(usuario.id));
        try {
          const { created } = await messageService.ensureConversation(activeUserId, usuario.id);
          setMatchFeedback(
            `¡Match con ${usuario.username}! ${created ? "Chat creado." : "Chat ya existente."}`,
          );
        } catch (error) {
          setErrorMusicos(
            error instanceof Error
              ? `Match creado, pero no se pudo iniciar el chat: ${error.message}`
              : "Match creado, pero no se pudo iniciar el chat.",
          );
        }
      } else {
        setCandidatos((anteriores) => anteriores.filter((item) => item.id !== usuario.id));
      }
    } catch (error) {
      if (error instanceof MatchServiceError && error.status === 409) {
        setCandidatos((anteriores) => anteriores.filter((item) => item.id !== usuario.id));
        setMatchFeedback(`Ya habías enviado un me gusta a ${usuario.username}.`);
        return;
      }
      setErrorMusicos(error instanceof Error ? error.message : "No se pudo enviar el me gusta.");
    } finally {
      setProcessingUserId(null);
    }
  }

  async function pasarUsuario(usuario: User) {
    if (!activeUserId || processingUserId) return;
    setProcessingUserId(usuario.id);
    setErrorMusicos(null);
    try {
      await matchService.reject(activeUserId, usuario.id);
      setCandidatos((anteriores) => anteriores.filter((item) => item.id !== usuario.id));
      setSelectedUserId(null);
    } catch (error) {
      setErrorMusicos(error instanceof Error ? error.message : "No se pudo descartar al músico.");
    } finally {
      setProcessingUserId(null);
    }
  }

  const detallesMusicoFallback: Omit<Musico, "id" | "nombre">[] = [
    {
      instrumento: "Guitarra",
      nivel: "Intermedio",
      distancia: 0.4,
      posicion: { left: "35%", top: "34%" },
    },
    {
      instrumento: "Voz",
      nivel: "Avanzado",
      distancia: 0.7,
      posicion: { left: "68%", top: "51%" },
    },
    {
      instrumento: "Piano",
      nivel: "Principiante",
      distancia: 1.2,
      posicion: { left: "73%", top: "25%" },
    },
    {
      instrumento: "Guitarra",
      nivel: "Avanzado",
      distancia: 2.3,
      posicion: { left: "28%", top: "72%" },
    },
    {
      instrumento: "Batería",
      nivel: "Intermedio",
      distancia: 3.5,
      posicion: { left: "53%", top: "80%" },
    },
  ];

  const musicos: Musico[] = candidatos.map((usuario, index) => ({
    id: usuario.id,
    nombre: usuario.username,
    esMatch: matchedUserIds.has(usuario.id),
    ...detallesMusicoFallback[index % detallesMusicoFallback.length],
  }));

  const eventos: Evento[] = [
    {
      id: 1,
      nombre: "Jam de Blues",
      posicion: { left: "51%", top: "66%" },
    },
    {
      id: 2,
      nombre: "Aurora Sound Fest",
      posicion: { left: "81%", top: "40%" },
    },
    {
      id: 3,
      nombre: "Parque de la Música",
      posicion: { left: "56%", top: "36%" },
    },
  ];

  const musicosFiltrados = musicos.filter((musico) => {
    const cumpleDistancia =
      musico.distancia <= Number(distancia);

    const cumpleInstrumento =
      instrumento === "Todos" ||
      musico.instrumento === instrumento;

    const cumpleNivel =
      nivel === "Todos" ||
      musico.nivel === nivel;

    return (
      cumpleDistancia &&
      cumpleInstrumento &&
      cumpleNivel
    );
  });

  return (
    <div className="mapa-contenido">

      <aside className="filtros-mapa">
        <h3>Filtros</h3>

        <div className="grupo-filtro">
          <label htmlFor="distancia">
            Distancia
          </label>

          <select
            id="distancia"
            value={distancia}
            onChange={(evento) =>
              setDistancia(evento.target.value)
            }
          >
            <option value="1">Hasta 1 km</option>
            <option value="5">Hasta 5 km</option>
            <option value="10">Hasta 10 km</option>
            <option value="50">Cualquier distancia</option>
          </select>
        </div>

        <div className="grupo-filtro">
          <label htmlFor="instrumento">
            Instrumento
          </label>

          <select
            id="instrumento"
            value={instrumento}
            onChange={(evento) =>
              setInstrumento(evento.target.value)
            }
          >
            <option value="Todos">Todos</option>
            <option value="Guitarra">Guitarra</option>
            <option value="Voz">Voz</option>
            <option value="Piano">Piano</option>
            <option value="Batería">Batería</option>
          </select>
        </div>

        <div className="grupo-filtro">
          <label htmlFor="nivel">
            Nivel
          </label>

          <select
            id="nivel"
            value={nivel}
            onChange={(evento) =>
              setNivel(evento.target.value)
            }
          >
            <option value="Todos">
              Todos los niveles
            </option>
            <option value="Principiante">
              Principiante
            </option>
            <option value="Intermedio">
              Intermedio
            </option>
            <option value="Avanzado">
              Avanzado
            </option>
          </select>
        </div>

        <p className="resultado-filtros">
          {isLoadingMusicos
            ? "Cargando músicos..."
            : errorMusicos ??
              matchFeedback ??
              `${musicosFiltrados.length} músicos encontrados`}
        </p>
      </aside>

      <div className="mapa-visual">

        <div className="mapa-zonas zona-uno" />
        <div className="mapa-zonas zona-dos" />
        <div className="mapa-zonas zona-tres" />

        <svg
          className="calles-mapa"
          viewBox="0 0 800 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M-20 120 C150 80 180 210 310 180 S570 90 830 130" />
          <path d="M-20 250 C130 210 230 280 350 250 S610 190 830 230" />
          <path d="M-20 390 C130 350 250 420 390 370 S620 330 830 390" />
          <path d="M100 -20 C140 120 90 220 170 330 S210 500 250 630" />
          <path d="M280 -20 C250 120 330 220 300 330 S350 500 330 630" />
          <path d="M480 -20 C430 120 520 220 490 330 S540 500 520 630" />
          <path d="M680 -20 C620 120 700 220 660 330 S710 500 690 630" />

          <path
            className="calle-principal"
            d="M-20 520 C170 430 190 330 360 300 S590 210 830 20"
          />

          <path
            className="calle-principal"
            d="M220 -20 C350 120 390 230 420 330 S470 500 470 630"
          />
        </svg>

        <span className="texto-zona zona-texto-uno">
          ACOPI
        </span>

        <span className="texto-zona zona-texto-dos">
          SAN FERNANDO
        </span>

        <span className="texto-zona zona-texto-tres">
          CIUDAD JARDÍN
        </span>

        <span className="texto-zona zona-texto-cuatro">
          PANCE
        </span>

        <div className="indicacion-mapa">
          Mapa ilustrativo · Cali, Colombia
        </div>

        {musicosFiltrados.map((musico) => (
          <div
            key={musico.id}
            className="marcador marcador-musico"
            style={{
              left: musico.posicion.left,
              top: musico.posicion.top,
            }}
          >
            <span className="punto-marcador">
              ♪
            </span>

            {musico.esMatch ? (
              <>
                <span className="etiqueta-marcador">{musico.nombre}</span>
                <span className="etiqueta">Match</span>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="etiqueta-marcador marcador-nombre"
                  aria-expanded={selectedUserId === musico.id}
                  onClick={() =>
                    setSelectedUserId((actual) =>
                      actual === musico.id ? null : musico.id,
                    )
                  }
                >
                  {musico.nombre}
                </button>
                {selectedUserId === musico.id && (
                  <div className="acciones-marcador">
                    <button
                      type="button"
                      className="boton-pildora"
                      onClick={() => {
                        const usuario = candidatos.find((item) => item.id === musico.id);
                        if (usuario) void darLike(usuario);
                      }}
                      disabled={processingUserId !== null}
                    >
                      Me gusta
                    </button>
                    <button
                      type="button"
                      className="enlace-verde"
                      onClick={() => {
                        const usuario = candidatos.find((item) => item.id === musico.id);
                        if (usuario) void pasarUsuario(usuario);
                      }}
                      disabled={processingUserId !== null}
                    >
                      Pasar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="marcador marcador-evento"
            style={{
              left: evento.posicion.left,
              top: evento.posicion.top,
            }}
          >
            <span className="punto-marcador">
              ★
            </span>

            <span className="etiqueta-marcador">
              {evento.nombre}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
}

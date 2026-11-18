"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";
import { useActiveUser } from "@/contexts/ActiveUserContext";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types/event";

interface FormularioEvento {
  nombre: string;
  fecha: string;
  ubicacion: string;
}

const formularioInicial: FormularioEvento = {
  nombre: "",
  fecha: "",
  ubicacion: "Cali, Colombia",
};

function formatearFecha(valor: string): string {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;

  const dia = fecha
    .toLocaleDateString("es-CO", { weekday: "short" })
    .replace(".", "");

  const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);

  const hora = fecha.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${diaCapitalizado} · ${hora}`;
}

export default function PaginaEventos() {
  const { activeUser, isLoading: isLoadingUser } = useActiveUser();
  const [eventos, setEventos] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formulario, setFormulario] =
    useState<FormularioEvento>(formularioInicial);
  const [fechaEnfocada, setFechaEnfocada] = useState(false);
  const [error, setError] = useState("");

  const nombreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function cargarEventos() {
      setError("");
      try {
        setEventos(await eventService.getAll());
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los eventos.");
      } finally {
        setIsLoading(false);
      }
    }
    void cargarEventos();
  }, []);

  const misEventos = activeUser
    ? eventos.filter((evento) => evento.userId === activeUser.id)
    : [];
  const [ahora] = useState(() => Date.now());

  const proximos = misEventos.filter((evento) => new Date(evento.fecha).getTime() >= ahora).length;
  const finalizados = misEventos.length - proximos;

  async function alternarUnirse(evento: Event) {
    if (!activeUser || isSaving) {
      setError("Selecciona un usuario desde tu perfil para gestionar asistencia.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const actualizados = evento.asistentes.includes(activeUser.id)
        ? await eventService.cancelAttendance(evento.id, activeUser.id)
        : await eventService.attend(evento.id, activeUser.id);
      setEventos(actualizados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la asistencia.");
    } finally {
      setIsSaving(false);
    }
  }

  function actualizarCampo(campo: keyof FormularioEvento, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setError("");
  }

  function irAlFormulario() {
    nombreRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    nombreRef.current?.focus({ preventScroll: true });
  }

  async function crearEvento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!formulario.nombre.trim() || !formulario.fecha) {
      setError("Escribe el nombre y selecciona la fecha.");
      return;
    }

    if (!activeUser) {
      setError("Selecciona un usuario desde tu perfil para crear un evento.");
      return;
    }
    setIsSaving(true);
    try {
      const actualizados = await eventService.create({
        userId: activeUser.id,
        titulo: formulario.nombre.trim(),
        descripcion: formulario.ubicacion.trim() || "Cali, Colombia",
        fecha: new Date(formulario.fecha).toISOString(),
      });
      setEventos(actualizados);
      setFormulario(formularioInicial);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el evento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function eliminarEvento(eventId: string) {
    if (!window.confirm("¿Eliminar este evento?")) return;
    setIsSaving(true);
    setError("");
    try {
      setEventos(await eventService.delete(eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el evento.");
    } finally {
      setIsSaving(false);
    }
  }

  const textoResumen = `${proximos} próximos · ${finalizados} finalizado${finalizados === 1 ? "" : "s"}`;

  return (
    <div className="pagina">
      <BarraSuperior />

      <div className="contenido">
        <MenuLateral />

        <main className="zona-pagina">
          <div className="encabezado-pagina">
            <div className="titulo-pagina">
              <h2>Eventos</h2>

              <p>Encuentra encuentros, únete o crea el próximo.</p>
            </div>

            <button
              type="button"
              className="boton-principal"
              onClick={irAlFormulario}
            >
              + Crear evento
            </button>
          </div>

          <div className="eventos-layout">
            <section className="tarjeta-pagina eventos-proximos">
              <h3>Próximos eventos</h3>

              {error && (
                <p className="mensaje-error" role="alert">
                  {error}
                </p>
              )}
              {isLoading ? (
                <p>Cargando eventos...</p>
              ) : eventos.length === 0 ? (
                <p>Todavía no hay eventos. Crea el primero.</p>
              ) : (
                eventos.map((evento, indice) => {
                const estaUnido = Boolean(activeUser && evento.asistentes.includes(activeUser.id));

                return (
                  <article
                    key={evento.id}
                    className={`fila-evento ${
                      indice === 0 ? "verde" : ""
                    }`}
                  >
                    <div>
                      <span className="fecha-evento">
                        {formatearFecha(evento.fecha)}
                      </span>

                      <h4>{evento.titulo}</h4>

                      <p>
                        {evento.descripcion || "Cali, Colombia"} · {evento.asistentes.length} asistentes
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`boton-pildora ${
                        estaUnido ? "secundario" : ""
                      }`}
                      aria-pressed={estaUnido}
                      onClick={() => void alternarUnirse(evento)}
                      disabled={isSaving || isLoadingUser}
                    >
                      {estaUnido ? "Unido ✓" : "Unirme"}
                    </button>
                  </article>
                );
                })
              )}
            </section>

            <div className="eventos-lateral">
              <section className="tarjeta-pagina">
                <h3>Mis eventos</h3>

                <p className="subtitulo-tarjeta">{textoResumen}</p>

                {misEventos.map((miEvento, indice) => (
                  <article
                    key={miEvento.id}
                    className={`evento-propio ${
                      indice === 0 ? "verde" : ""
                    }`}
                  >
                    <h4>{miEvento.titulo}</h4>

                    <p>
                      {formatearFecha(miEvento.fecha)} · {miEvento.asistentes.length} participantes
                    </p>

                    <button
                      type="button"
                      className="enlace-verde"
                      onClick={() => void eliminarEvento(miEvento.id)}
                      disabled={isSaving}
                    >
                      Eliminar →
                    </button>
                  </article>
                ))}
              </section>

              <section className="tarjeta-pagina" id="crear-evento">
                <h3>Crea tu próximo encuentro</h3>

                <p className="subtitulo-tarjeta">
                  Define fecha, ubicación y aforo desde un solo flujo.
                </p>

                <form onSubmit={crearEvento} noValidate>
                  <div className="campo-formulario">
                    <label htmlFor="evento-nombre">Nombre del evento</label>

                    <input
                      id="evento-nombre"
                      ref={nombreRef}
                      type="text"
                      className="campo"
                      placeholder="Jam de jazz"
                      value={formulario.nombre}
                      onChange={(e) =>
                        actualizarCampo("nombre", e.target.value)
                      }
                    />
                  </div>

                  <div className="campo-formulario">
                    <label htmlFor="evento-fecha">Fecha y hora</label>

                    <input
                      id="evento-fecha"
                      type={
                        fechaEnfocada || formulario.fecha
                          ? "datetime-local"
                          : "text"
                      }
                      className="campo"
                      placeholder="Seleccionar"
                      value={formulario.fecha}
                      onFocus={() => setFechaEnfocada(true)}
                      onBlur={() => setFechaEnfocada(false)}
                      onChange={(e) =>
                        actualizarCampo("fecha", e.target.value)
                      }
                    />
                  </div>

                  <div className="campo-formulario">
                    <label htmlFor="evento-ubicacion">Ubicación</label>

                    <input
                      id="evento-ubicacion"
                      type="text"
                      className="campo"
                      placeholder="Cali, Colombia"
                      value={formulario.ubicacion}
                      onChange={(e) =>
                        actualizarCampo("ubicacion", e.target.value)
                      }
                    />
                  </div>

                  {error && (
                    <p className="mensaje-error" role="alert">
                      {error}
                    </p>
                  )}

                  <button type="submit" className="boton-principal" disabled={isSaving || isLoadingUser || !activeUser}>
                    {isSaving ? "Creando..." : "Crear evento"}
                  </button>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

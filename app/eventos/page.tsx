"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";

interface EventoProximo {
  id: number;
  fecha: string;
  titulo: string;
  lugar: string;
  distancia: string;
  destacado?: boolean;
}

interface MiEvento {
  id: number;
  titulo: string;
  detalle: string;
}

interface ResumenMisEventos {
  proximos: number;
  finalizados: number;
}

interface FormularioEvento {
  nombre: string;
  fecha: string;
  ubicacion: string;
}

// TODO: reemplazar por fetch a la API de NestJS (GET /eventos/proximos)
const eventosProximos: EventoProximo[] = [
  {
    id: 1,
    fecha: "HOY · 20:00",
    titulo: "Jam de Blues en El Loco Club",
    lugar: "Cali",
    distancia: "0,4 km",
    destacado: true,
  },
  {
    id: 2,
    fecha: "SÁB · 18:00",
    titulo: "Aurora Sound Fest",
    lugar: "Cali",
    distancia: "0,5 km",
  },
  {
    id: 3,
    fecha: "DOM · 16:00",
    titulo: "Micrófono Abierto",
    lugar: "Cali",
    distancia: "1,0 km",
  },
];

// TODO: reemplazar por fetch a la API de NestJS (GET /usuarios/me/eventos)
const misEventosIniciales: MiEvento[] = [
  {
    id: 1,
    titulo: "Ensayo acústico",
    detalle: "Vie · 19:00 · 5 participantes",
  },
];

const resumenInicial: ResumenMisEventos = {
  proximos: 2,
  finalizados: 1,
};

const formularioInicial: FormularioEvento = {
  nombre: "",
  fecha: "",
  ubicacion: "Cali, Colombia",
};

function formatearFecha(valor: string): string {
  const fecha = new Date(valor);

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
  const [unidos, setUnidos] = useState<number[]>([]);
  const [misEventos, setMisEventos] =
    useState<MiEvento[]>(misEventosIniciales);
  const [resumen, setResumen] =
    useState<ResumenMisEventos>(resumenInicial);
  const [formulario, setFormulario] =
    useState<FormularioEvento>(formularioInicial);
  const [fechaEnfocada, setFechaEnfocada] = useState(false);
  const [error, setError] = useState("");

  const nombreRef = useRef<HTMLInputElement>(null);

  function alternarUnirse(id: number) {
    setUnidos((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((eventoId) => eventoId !== id)
        : [...anteriores, id]
    );
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

  function crearEvento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!formulario.nombre.trim() || !formulario.fecha) {
      setError("Escribe el nombre y selecciona la fecha.");
      return;
    }

    // TODO: reemplazar por POST a la API de NestJS (POST /eventos)
    const nuevoEvento: MiEvento = {
      id: Date.now(),
      titulo: formulario.nombre.trim(),
      detalle: `${formatearFecha(formulario.fecha)} · 1 participante`,
    };

    setMisEventos((anteriores) => [nuevoEvento, ...anteriores]);
    setResumen((anterior) => ({
      ...anterior,
      proximos: anterior.proximos + 1,
    }));
    setFormulario(formularioInicial);
    setError("");
  }

  const textoResumen = `${resumen.proximos} próximos · ${
    resumen.finalizados
  } finalizado${resumen.finalizados === 1 ? "" : "s"}`;

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

              {eventosProximos.map((evento) => {
                const estaUnido = unidos.includes(evento.id);

                return (
                  <article
                    key={evento.id}
                    className={`fila-evento ${
                      evento.destacado ? "verde" : ""
                    }`}
                  >
                    <div>
                      <span className="fecha-evento">{evento.fecha}</span>

                      <h4>{evento.titulo}</h4>

                      <p>
                        {evento.lugar} · {evento.distancia}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`boton-pildora ${
                        estaUnido ? "secundario" : ""
                      }`}
                      aria-pressed={estaUnido}
                      onClick={() => alternarUnirse(evento.id)}
                    >
                      {estaUnido ? "Unido ✓" : "Unirme"}
                    </button>
                  </article>
                );
              })}
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

                    <p>{miEvento.detalle}</p>

                    <button type="button" className="enlace-verde">
                      Gestionar →
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

                  {/* Envía el formulario con Enter sin añadir un botón que no está en el diseño */}
                  <button type="submit" hidden>
                    Crear evento
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

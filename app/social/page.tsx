"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";

interface Amigo {
  id: number;
  iniciales: string;
  nombre: string;
  detalle: string;
}

interface Mensaje {
  id: number;
  texto: string;
  enviado: boolean;
}

interface Conversacion {
  id: string;
  titulo: string;
  tiempo: string;
  vistaPrevia: string;
  amigoId?: number;
  mensajes: Mensaje[];
}

// TODO: reemplazar por fetch a la API de NestJS (GET /amigos)
const amigos: Amigo[] = [
  {
    id: 1,
    iniciales: "SR",
    nombre: "Sofía Ramírez",
    detalle: "Voz · Activa ahora",
  },
  {
    id: 2,
    iniciales: "CM",
    nombre: "Carlos Mendoza",
    detalle: "Guitarra · Activo ahora",
  },
  {
    id: 3,
    iniciales: "ET",
    nombre: "Elena Torres",
    detalle: "Piano · Última vez hace 2 h",
  },
];

// TODO: reemplazar por fetch a la API de NestJS (GET /conversaciones)
const conversacionesIniciales: Conversacion[] = [
  {
    id: "sofia",
    titulo: "Sofía Ramírez",
    tiempo: "5 min",
    vistaPrevia: "¿Ensayamos esta tarde?",
    amigoId: 1,
    mensajes: [
      { id: 1, texto: "¿Ensayamos esta tarde?", enviado: false },
      { id: 2, texto: "Claro, a las 6 me queda perfecto.", enviado: true },
    ],
  },
  {
    id: "carlos",
    titulo: "Carlos Mendoza",
    tiempo: "20 min",
    vistaPrevia: "Te envié la progresión.",
    amigoId: 2,
    mensajes: [
      { id: 1, texto: "Te envié la progresión.", enviado: false },
    ],
  },
  {
    id: "jam-blues",
    titulo: "Jam Blues · El Loco",
    tiempo: "Ayer",
    vistaPrevia: "¡Tu plaza está confirmada!",
    mensajes: [
      { id: 1, texto: "¡Tu plaza está confirmada!", enviado: false },
    ],
  },
];

export default function PaginaSocial() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(
    conversacionesIniciales
  );
  const [activaId, setActivaId] = useState<string>("sofia");
  const [borrador, setBorrador] = useState("");

  const listaMensajesRef = useRef<HTMLDivElement>(null);
  const campoMensajeRef = useRef<HTMLInputElement>(null);

  const conversacionActiva =
    conversaciones.find((conversacion) => conversacion.id === activaId) ??
    conversaciones[0];

  useEffect(() => {
    const lista = listaMensajesRef.current;

    if (lista) {
      lista.scrollTop = lista.scrollHeight;
    }
  }, [conversacionActiva.mensajes.length, activaId]);

  function seleccionarConversacion(id: string) {
    setActivaId(id);
    setBorrador("");
  }

  function nuevoMensaje() {
    campoMensajeRef.current?.focus();
  }

  function enviarMensaje(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const texto = borrador.trim();

    if (!texto) {
      return;
    }

    // TODO: reemplazar por POST a la API de NestJS (POST /conversaciones/:id/mensajes)
    setConversaciones((anteriores) =>
      anteriores.map((conversacion) => {
        if (conversacion.id !== activaId) {
          return conversacion;
        }

        const siguienteId =
          Math.max(0, ...conversacion.mensajes.map((m) => m.id)) + 1;

        return {
          ...conversacion,
          tiempo: "Ahora",
          vistaPrevia: texto,
          mensajes: [
            ...conversacion.mensajes,
            { id: siguienteId, texto, enviado: true },
          ],
        };
      })
    );

    setBorrador("");
  }

  return (
    <div className="pagina">
      <BarraSuperior />

      <div className="contenido">
        <MenuLateral />

        <main className="zona-pagina">
          <div className="encabezado-pagina">
            <div className="titulo-pagina">
              <h2>Social</h2>

              <p>Amigos y conversaciones, en un mismo lugar.</p>
            </div>
          </div>

          <div className="social-layout">
            <section className="tarjeta-pagina">
              <div className="encabezado-tarjeta">
                <h3>Amigos</h3>

                <Link href="/mapa" className="enlace-verde">
                  Descubrir →
                </Link>
              </div>

              {amigos.map((amigo) => (
                <article
                  key={amigo.id}
                  className={`fila-amigo ${
                    amigo.id === conversacionActiva.amigoId ? "activa" : ""
                  }`}
                >
                  <div className="avatar-blanco">{amigo.iniciales}</div>

                  <div>
                    <h4>{amigo.nombre}</h4>

                    <p>{amigo.detalle}</p>

                    {/* TODO: cuando exista el perfil público usar `/perfil/${amigo.id}` */}
                    <Link href="/perfil" className="ver-perfil-amigo">
                      Ver perfil →
                    </Link>
                  </div>
                </article>
              ))}
            </section>

            <section className="tarjeta-pagina">
              <div className="encabezado-tarjeta">
                <h3>Mensajes</h3>

                <button
                  type="button"
                  className="boton-pildora"
                  onClick={nuevoMensaje}
                >
                  + Nuevo mensaje
                </button>
              </div>

              {conversaciones.map((conversacion) => (
                <button
                  key={conversacion.id}
                  type="button"
                  className={`fila-conversacion ${
                    conversacion.id === activaId ? "activa" : ""
                  }`}
                  aria-pressed={conversacion.id === activaId}
                  onClick={() => seleccionarConversacion(conversacion.id)}
                >
                  <span className="conversacion-superior">
                    <strong>{conversacion.titulo}</strong>

                    <span className="conversacion-tiempo">
                      {conversacion.tiempo}
                    </span>
                  </span>

                  <span className="conversacion-vista-previa">
                    {conversacion.vistaPrevia}
                  </span>
                </button>
              ))}

              <div className="chat">
                <h4>{conversacionActiva.titulo}</h4>

                <div className="chat-mensajes" ref={listaMensajesRef}>
                  {conversacionActiva.mensajes.map((mensaje) => (
                    <div
                      key={mensaje.id}
                      className={`burbuja ${
                        mensaje.enviado ? "enviada" : ""
                      }`}
                    >
                      {mensaje.texto}
                    </div>
                  ))}cd
                </div>

                <form className="chat-formulario" onSubmit={enviarMensaje}>
                  <input
                    ref={campoMensajeRef}
                    type="text"
                    placeholder="Escribe un mensaje…"
                    aria-label="Escribe un mensaje"
                    value={borrador}
                    onChange={(e) => setBorrador(e.target.value)}
                  />
                </form>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

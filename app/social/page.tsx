"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";
import { useActiveUser } from "@/contexts/ActiveUserContext";
import { matchService } from "@/services/match.service";
import { messageService } from "@/services/message.service";
import type { Conversation, Message } from "@/types/message";
import type { User } from "@/types/user";

function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

function obtenerOtroUsuario(conversation: Conversation, activeUserId: string): string {
  return conversation.userId === activeUserId
    ? conversation.otherUserId
    : conversation.userId;
}

export default function PaginaSocial() {
  const { activeUser, users, isLoading: isLoadingUser } = useActiveUser();
  const activeUserId = activeUser?.id;
  const [matchUsers, setMatchUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, Message | undefined>>({});
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [draft, setDraft] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listaMensajesRef = useRef<HTMLDivElement>(null);
  const selectorMatchRef = useRef<HTMLSelectElement>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  ) ?? null;
  const otherUserId = activeConversation && activeUserId
    ? obtenerOtroUsuario(activeConversation, activeUserId)
    : null;
  const otherUser = users.find((user) => user.id === otherUserId);
  const activeTitle = otherUser?.username ?? "Conversación";

  useEffect(() => {
    let vigente = true;

    async function cargarDatosSociales() {
      if (!activeUserId) {
        setMatchUsers([]);
        setConversations([]);
        setActiveConversationId(null);
        setLastMessages({});
        setMessages([]);
        setIsLoadingMessages(false);
        setIsLoadingConversations(false);
        return;
      }

      setIsLoadingConversations(true);
      setError(null);
      setMatchUsers([]);
      setConversations([]);
      setActiveConversationId(null);
      setLastMessages({});
      setMessages([]);
      try {
        const [allConversations, matches] = await Promise.all([
          messageService.getConversations(),
          matchService.getAll(activeUserId),
        ]);
        const participantConversations = allConversations.filter(
          (conversation) =>
            conversation.userId === activeUserId ||
            conversation.otherUserId === activeUserId,
        );
        const matchUserIds = new Set(
          matches.flatMap((match) =>
            match.usuariosMatch.filter((userId) => userId !== activeUserId),
          ),
        );
        const matchProfiles = users.filter((user) => matchUserIds.has(user.id));
        const previews = await Promise.all(
          participantConversations.map(async (conversation) => {
            try {
              const conversationMessages = await messageService.getMessages(conversation.id);
              return [conversation.id, conversationMessages.at(-1)] as const;
            } catch {
              return [conversation.id, undefined] as const;
            }
          }),
        );
        if (!vigente) return;

        setMatchUsers(matchProfiles);
        setConversations(participantConversations);
        setLastMessages(Object.fromEntries(previews));
        setActiveConversationId((current) =>
          participantConversations.some((conversation) => conversation.id === current)
            ? current
            : participantConversations[0]?.id ?? null,
        );
      } catch (loadError) {
        if (vigente) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar los mensajes.",
          );
        }
      } finally {
        if (vigente) setIsLoadingConversations(false);
      }
    }

    void cargarDatosSociales();
    return () => {
      vigente = false;
    };
  }, [activeUserId, users]);

  useEffect(() => {
    let vigente = true;
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    messageService.getMessages(activeConversationId)
      .then((loadedMessages) => {
        if (vigente) {
          setMessages(loadedMessages);
          setLastMessages((previous) => ({
            ...previous,
            [activeConversationId]: loadedMessages.at(-1),
          }));
        }
      })
      .catch((loadError) => {
        if (vigente) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar los mensajes de esta conversación.",
          );
        }
      })
      .finally(() => {
        if (vigente) setIsLoadingMessages(false);
      });

    return () => {
      vigente = false;
    };
  }, [activeConversationId]);

  useEffect(() => {
    const list = listaMensajesRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length, activeConversationId]);

  async function abrirChatCon(user: User) {
    if (!activeUserId) return;
    setError(null);
    try {
      const { conversation } = await messageService.ensureConversation(
        activeUserId,
        user.id,
      );
      setConversations((previous) =>
        previous.some((item) => item.id === conversation.id)
          ? previous
          : [conversation, ...previous],
      );
      setActiveConversationId(conversation.id);
      setSelectedMatchId("");
      setShowNewChat(false);
      setDraft("");
    } catch (openError) {
      setError(
        openError instanceof Error
          ? openError.message
          : "No se pudo iniciar la conversación.",
      );
    }
  }

  async function crearChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = matchUsers.find((match) => match.id === selectedMatchId);
    if (user) await abrirChatCon(user);
  }

  async function enviarMensaje(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !activeConversationId || !activeUserId || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      const message = await messageService.sendMessage(activeConversationId, {
        senderId: activeUserId,
        content,
      });
      setMessages((previous) => [...previous, message]);
      setLastMessages((previous) => ({ ...previous, [activeConversationId]: message }));
      setDraft("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "No se pudo enviar el mensaje.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function nuevoMensaje() {
    setShowNewChat(true);
    window.setTimeout(() => selectorMatchRef.current?.focus(), 0);
  }

  function seleccionarConversacion(id: string) {
    setActiveConversationId(id);
    setDraft("");
    setError(null);
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
                <h3>Matches</h3>
                <Link href="/mapa" className="enlace-verde">Descubrir →</Link>
              </div>

              {isLoadingUser || isLoadingConversations ? (
                <p>Cargando matches...</p>
              ) : matchUsers.length === 0 ? (
                <p>Aún no tienes matches para iniciar un chat.</p>
              ) : (
                matchUsers.map((user) => (
                  <article
                    key={user.id}
                    className={`fila-amigo ${otherUserId === user.id ? "activa" : ""}`}
                  >
                    <div className="avatar-blanco">{obtenerIniciales(user.username)}</div>
                    <div>
                      <h4>{user.username}</h4>
                      <p>Match · Disponible para conversar</p>
                      <button
                        type="button"
                        className="enlace-verde"
                        onClick={() => void abrirChatCon(user)}
                      >
                        Abrir chat →
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>

            <section className="tarjeta-pagina">
              <div className="encabezado-tarjeta">
                <h3>Mensajes</h3>
                <button
                  type="button"
                  className="boton-pildora"
                  onClick={nuevoMensaje}
                  disabled={matchUsers.length === 0}
                >
                  + Nuevo mensaje
                </button>
              </div>

              {showNewChat && (
                <form className="nuevo-chat-formulario" onSubmit={crearChat}>
                  <select
                    ref={selectorMatchRef}
                    value={selectedMatchId}
                    onChange={(event) => setSelectedMatchId(event.target.value)}
                    aria-label="Elige un match para iniciar un chat"
                    required
                  >
                    <option value="">Selecciona un match</option>
                    {matchUsers.map((user) => (
                      <option value={user.id} key={user.id}>{user.username}</option>
                    ))}
                  </select>
                  <button type="submit" className="boton-pildora">Iniciar chat</button>
                </form>
              )}

              {isLoadingConversations ? (
                <p>Cargando conversaciones...</p>
              ) : conversations.length === 0 ? (
                <p>Aún no hay conversaciones. Inicia una desde tus matches.</p>
              ) : (
                conversations.map((conversation) => {
                  const participantId = activeUserId
                    ? obtenerOtroUsuario(conversation, activeUserId)
                    : "";
                  const participant = users.find((user) => user.id === participantId);
                  const preview = lastMessages[conversation.id]?.content ?? "Sin mensajes aún";

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={`fila-conversacion ${conversation.id === activeConversationId ? "activa" : ""}`}
                      aria-pressed={conversation.id === activeConversationId}
                      onClick={() => seleccionarConversacion(conversation.id)}
                    >
                      <span className="conversacion-superior">
                        <strong>{participant?.username ?? "Usuario"}</strong>
                      </span>
                      <span className="conversacion-vista-previa">{preview}</span>
                    </button>
                  );
                })
              )}

              <div className="chat">
                <h4>{activeTitle}</h4>
                {error && <p className="mensaje-error" role="alert">{error}</p>}
                <div className="chat-mensajes" ref={listaMensajesRef}>
                  {isLoadingMessages ? (
                    <p>Cargando mensajes...</p>
                  ) : messages.length === 0 ? (
                    <p>{activeConversation ? "Aún no hay mensajes." : "Selecciona un match para empezar a conversar."}</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`burbuja ${message.senderId === activeUserId ? "enviada" : ""}`}
                      >
                        {message.content}
                      </div>
                    ))
                  )}
                </div>

                <form className="chat-formulario" onSubmit={enviarMensaje}>
                  <input
                    type="text"
                    placeholder="Escribe un mensaje…"
                    aria-label="Escribe un mensaje"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    disabled={!activeConversation || isSending}
                  />
                  <button
                    type="submit"
                    className="boton-pildora"
                    disabled={!activeConversation || !draft.trim() || isSending}
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

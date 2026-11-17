import { useEffect, useRef, useState } from "react";
import type { Song } from "@/types/song";

interface CreacionCardProps {
  song: Song;
}

function formatearDuracion(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return "Duración desconocida";

  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60).toString().padStart(2, "0");
  return `${minutos}:${resto}`;
}

export default function CreacionCard({ song }: CreacionCardProps) {
  const genero = song.genero?.trim() || "Canción";
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const contextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const playbackDuration = 2600;

  function liberarAudio(resetProgress: boolean) {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
    oscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // Puede haberse detenido al terminar su nota.
      }
      oscillator.disconnect();
    });
    oscillatorsRef.current = [];
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") void context.close();
    setIsPlaying(false);
    if (resetProgress) setProgress(0);
  }

  async function alternarAudio() {
    if (isPlaying) {
      liberarAudio(true);
      return;
    }

    try {
      const context = new window.AudioContext();
      contextRef.current = context;
      await context.resume();

      const notes = [261.63, 329.63, 392, 523.25, 392, 523.25];
      const startAt = context.currentTime + 0.05;
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const noteStart = startAt + index * 0.38;
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.34);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.36);
        oscillatorsRef.current.push(oscillator);
      });

      startedAtRef.current = Date.now();
      setProgress(0);
      setIsPlaying(true);
      intervalRef.current = window.setInterval(() => {
        setProgress(
          Math.min(
            100,
            ((Date.now() - startedAtRef.current) / playbackDuration) * 100,
          ),
        );
      }, 40);
      timeoutRef.current = window.setTimeout(() => {
        liberarAudio(false);
        setProgress(100);
      }, playbackDuration);
    } catch {
      liberarAudio(true);
    }
  }

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      oscillatorsRef.current.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // Ya se detuvo.
        }
        oscillator.disconnect();
      });
      const context = contextRef.current;
      if (context && context.state !== "closed") void context.close();
    },
    [],
  );

  return (
    <article className="tarjeta-creacion">
      <div
        className="portada-creacion"
        style={{
          backgroundImage: "url('/noches-frias.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        role="img"
        aria-label={`Portada de ${song.titulo}`}
      >
        <span aria-hidden="true">♫</span>
      </div>

      <div className="informacion-creacion">
        <h4>{song.titulo}</h4>
        <p>
          {song.artista}
          {song.album ? ` · ${song.album}` : ""}
        </p>

        <div className="pie-creacion">
          <span className="etiqueta">
            {`${genero} · ${formatearDuracion(song.duracion)}`}
          </span>

          <button
            type="button"
            className="boton-escuchar"
            onClick={() => void alternarAudio()}
          >
            {isPlaying ? "Pausar" : "Escuchar"}
          </button>
        </div>
        <div
          className="progreso-audio"
          role="progressbar"
          aria-label={`Progreso de reproducción: ${song.titulo}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </article>
  );
}

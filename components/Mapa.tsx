"use client";

import { useState } from "react";

interface Musico {
  id: number;
  nombre: string;
  instrumento: string;
  nivel: string;
  distancia: number;
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
  const [distancia, setDistancia] = useState("5");
  const [instrumento, setInstrumento] = useState("Todos");
  const [nivel, setNivel] = useState("Todos");

  const musicos: Musico[] = [
    {
      id: 1,
      nombre: "Carlos Delgado",
      instrumento: "Guitarra",
      nivel: "Intermedio",
      distancia: 0.4,
      posicion: { left: "35%", top: "34%" },
    },
    {
      id: 2,
      nombre: "Sofía Ramírez",
      instrumento: "Voz",
      nivel: "Avanzado",
      distancia: 0.7,
      posicion: { left: "68%", top: "51%" },
    },
    {
      id: 3,
      nombre: "Elena Torres",
      instrumento: "Piano",
      nivel: "Principiante",
      distancia: 1.2,
      posicion: { left: "73%", top: "25%" },
    },
    {
      id: 4,
      nombre: "Andrés López",
      instrumento: "Guitarra",
      nivel: "Avanzado",
      distancia: 2.3,
      posicion: { left: "28%", top: "72%" },
    },
    {
      id: 5,
      nombre: "Laura Gómez",
      instrumento: "Batería",
      nivel: "Intermedio",
      distancia: 3.5,
      posicion: { left: "53%", top: "80%" },
    },
  ];

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
          {musicosFiltrados.length} músicos encontrados
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

            <span className="etiqueta-marcador">
              {musico.nombre}
            </span>
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
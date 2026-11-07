import Link from "next/link";

export default function BarraSuperior() {
  return (
    <header className="barra-superior">
      <Link href="/" className="logo-container">
        <span className="logo">MIZIKI</span>
        <span className="subtitulo-logo">
          Comunidad musical
        </span>
      </Link>

      <div className="buscador">
        <input
          type="text"
          placeholder="Buscar músicos, eventos o creaciones"
          aria-label="Buscar músicos, eventos o creaciones"
        />
      </div>

      <div className="acciones-superiores">
        <Link
          href="/eventos/crear"
          className="crear-evento-superior"
        >
          Crear evento
        </Link>

        <span className="usuario-superior">
          Juan C.
        </span>
      </div>
    </header>
  );
}
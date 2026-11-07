import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";
import Mapa from "@/components/Mapa";

export default function PaginaMapa() {
  return (
    <div className="pagina">

      <BarraSuperior />

      <div className="contenido">

        <MenuLateral />

        <main className="zona-mapa">

          <div className="titulo-mapa">
            <h2>Mapa</h2>

            <p>
              Explora músicos y eventos cerca de ti.
            </p>
          </div>

          <Mapa />

        </main>

      </div>
    </div>
  );
}
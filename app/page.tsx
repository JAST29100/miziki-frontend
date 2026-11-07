import Link from "next/link";
import BarraSuperior from "@/components/BarraSuperior";
import MenuLateral from "@/components/MenuLateral";

const musicos = [
  {
    id: 1,
    iniciales: "CD",
    nombre: "Carlos Delgado",
    instrumento: "Guitarra",
    distancia: "0,4 km",
  },
  {
    id: 2,
    iniciales: "SR",
    nombre: "Sofía Ramírez",
    instrumento: "Voz",
    distancia: "0,7 km",
  },
  {
    id: 3,
    iniciales: "ET",
    nombre: "Elena Torres",
    instrumento: "Piano",
    distancia: "1,2 km",
  },
];

const creaciones = [
  {
    id: 1,
    titulo: "Noches frías",
    autor: "Carlos Rojas Neme",
    instrumento: "Piano",
    simbolo: "♫",
  },
  {
    id: 2,
    titulo: "Fur Elise - Cover",
    autor: "Juan Jose Franco",
    instrumento: "Piano",
    simbolo: "♪",
  },
];

export default function Home() {
  return (
    <div className="pagina">
      <BarraSuperior />

      <div className="contenido">
        <MenuLateral />

        <main className="zona-central">

          <div className="saludo">
            <h2>Hola, Juan</h2>

            <p>
              Encuentra músicos, comparte tus creaciones
              y crea momentos en comunidad.
            </p>
          </div>

          <section className="publicar">
            <textarea
              placeholder="Comparte una idea, una canción o invita a un evento..."
            />

            <div className="publicar-acciones">
              <button className="boton-publicar">
                Publicar
              </button>
            </div>
          </section>

          <section className="seccion">
            <div className="encabezado-seccion">
              <h3>Músicos cerca de ti</h3>

              <Link
                href="/mapa"
                className="ver-todo"
              >
                Ver en mapa →
              </Link>
            </div>

            <div className="lista-musicos">
              {musicos.map((musico) => (
                <article
                  className="tarjeta-musico"
                  key={musico.id}
                >
                  <div className="avatar">
                    {musico.iniciales}
                  </div>

                  <h4>{musico.nombre}</h4>

                  <p>
                    {musico.instrumento} - {musico.distancia}
                  </p>

                  <button className="boton-perfil">
                    Ver perfil
                  </button>
                </article>
              ))}
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
              {creaciones.map((creacion) => (
                <article
                  className="tarjeta-creacion"
                  key={creacion.id}
                >
                  <div className="portada-creacion">
                    <span>{creacion.simbolo}</span>
                  </div>

                  <div className="informacion-creacion">
                    <h4>{creacion.titulo}</h4>

                    <p>{creacion.autor}</p>

                    <div className="pie-creacion">
                      <span className="etiqueta">
                        {creacion.instrumento}
                      </span>

                      <button className="boton-escuchar">
                        Escuchar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </main>

        <aside className="panel-derecho">

          <section className="panel-tarjeta">
            <div className="encabezado-panel">
              <h3>Eventos cerca de ti</h3>
              <a href="#">Ver todos →</a>
            </div>

            <div className="evento evento-verde">
              <span className="fecha-evento">
                HOY · 20:00
              </span>

              <h4>Jam de Blues en El Loco Club</h4>
              <p>Cali · 0,4 km</p>
            </div>

            <div className="evento">
              <span className="fecha-evento">
                SÁB · 18:00
              </span>

              <h4>Aurora Sound Fest</h4>
              <p>Cali · 0,5 km</p>
            </div>
          </section>

          <section className="panel-tarjeta">
            <h3>Social</h3>

            <p className="descripcion-panel">
              Conecta con tu comunidad musical
            </p>

            <div className="social-item social-verde">
              <h4>Amigos</h4>
              <p>3 músicos activos cerca de ti</p>
            </div>

            <div className="social-item">
              <h4>Mensajes</h4>
              <p>Sofía Ramírez te escribió hace 5 min</p>
            </div>
          </section>

          <section className="panel-tarjeta actividad">
            <h3>Gestiona tu actividad</h3>

            <button className="boton-crear">
              + Crear evento
            </button>

            <div className="botones-actividad">
              <button>Mis eventos</button>
              <button>Mi perfil</button>
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
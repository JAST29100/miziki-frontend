import "./globals.css"
import CreacionCard from "@/components/CreacionCard";

export default function Home() {
  const creaciones = [
    {
      id: 1,
      titulo: "Noches Frias",
      autor: "Carlos Rojas Neme",
      src: "/noches-frias.png",
      tags: "Guitarra Calido"
    },
    {
      id: 2,
      titulo: "Fur Elise - Cover",
      autor: "Juan Jose Franco",
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhg5NXTorsI5hoyvEGZLndvi5-zktEB4nzxaNsh0RmT4eM6eWV97sOyU&s=10",
      tags: "Piano Clasico"
    }
  ]
  return (
    <div className="app-container">
      {
        creaciones.map((creacion) => {
          return <CreacionCard
            titulo={creacion.titulo}
            autor={creacion.autor}
            src={creacion.src}
            tags={creacion.tags}
            key={creacion.id}
          />
        })
      }
    </div>
  );
}

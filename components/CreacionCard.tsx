import Image from "next/image";

interface Creacion {
  titulo: string;
  autor: string;
  src: string;
  tags: string;
}

export default function CreacionCard({ titulo, autor, src, tags }: Creacion) {
  const tag_list = tags ? tags.split(" ") : [];
  return (
    <div className="card" style={{position: 'relative'}}>
      <div className="image-container" style={{position: 'relative'}}>
        <Image
          src={src}
          alt={`Portada de ${titulo} por ${autor}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-fill"
          priority={false}
        />
      </div>
      <div className="info-container">
        <h1>{titulo}</h1>
        <h1 style={{color: "darkgrey"}}>{autor}</h1>
        <div className="tag-container">
          {
            tag_list.map((item, index) => { return (<p className="tag" key={index}>{item}</p>)})
          }
          <button id="play-btn" className="app-btn">Escuchar</button>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react";
import { Icon } from "../components/Icons";
import MemoryCarousel from "../three/MemoryCarousel";
import { MEMORIES, MILESTONES } from "../data/content";
import { useReveal } from "../hooks/useAppState";

export default function Memories() {
  const [active, setActive] = useState(0);
  const tlRef = useReveal<HTMLDivElement>(120);
  const gridRef = useReveal<HTMLDivElement>(60);

  const current = MEMORIES[active] ?? MEMORIES[0];

  return (
    <section className="section" aria-label="Anılarımız">
      <header className="section__head">
        <div>
          <p className="section__eyebrow">Biriktirdiklerimiz</p>
          <h2 className="section__title">
            Anılarımız <em>♡</em>
          </h2>
          <p className="section__lead">
            Karuseli sürükleyerek döndürebilirsin. Bir kareye dokun, büyüsün.
          </p>
        </div>
        <span className="badge badge--rose">
          <Icon name="camera" />
          {MEMORIES.length} kare
        </span>
      </header>

      <div style={{ position: "relative" }}>
        <MemoryCarousel items={MEMORIES} onSelect={setActive} />
        <div className="carousel3d__hint" aria-hidden>
          sürükle & döndür
        </div>
      </div>

      <div className="row gap-14" style={{ justifyContent: "center", margin: "18px 0 30px", flexWrap: "wrap" }}>
        <span className="badge">
          <Icon name="mapPin" />
          {current.place}
        </span>
        <span className="badge">
          <Icon name="clock" />
          {current.date}
        </span>
        <p className="bottomcard__title bottomcard__title--hand" style={{ textAlign: "center" }}>
          {current.caption}
        </p>
      </div>

      <div className="polaroids" ref={gridRef}>
        {MEMORIES.map((m) => (
          <figure key={m.id} className="polaroid">
            <img src={m.image} alt={m.caption} loading="lazy" decoding="async" />
            <figcaption className="polaroid__cap">
              {m.caption}
              <span className="polaroid__date">
                {m.place} · {m.date}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="timeline" ref={tlRef}>
        {MILESTONES.map((m) => (
          <article key={m.what} className="tlitem">
            <p className="tlitem__when">{m.when}</p>
            <h3 className="tlitem__what">{m.what}</h3>
            <p className="tlitem__desc">{m.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

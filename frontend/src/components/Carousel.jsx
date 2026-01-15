import React, { useEffect, useState } from "react";
import "../styles/Carousel.css";

export default function Carousel({ items = [], interval = 4500 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const t = setInterval(() => setIndex((s) => (s + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [items, interval]);

  const prev = () => setIndex((s) => (s - 1 + items.length) % items.length);
  const next = () => setIndex((s) => (s + 1) % items.length);

  if (!items || items.length === 0) return null;

  return (
    <div className="carousel" role="region" aria-roledescription="carousel">
      <div className="carousel-slides">
        {items.map((it, i) => (
          <div
            key={it._id || i}
            className={`carousel-item ${i === index ? "active" : ""}`}
            style={{ backgroundImage: `url(${it.image})` }}
            aria-hidden={i !== index}
          >
            <div className="carousel-caption">
              <h3>{it.title}</h3>
              {it.teaser && <p className="carousel-teaser">{it.teaser}</p>}
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-prev" aria-label="Précédent" onClick={prev}>‹</button>
      <button className="carousel-next" aria-label="Suivant" onClick={next}>›</button>

      <div className="carousel-dots">
        {items.map((_, i) => (
          <button key={i} className={`dot ${i === index ? "active" : ""}`} onClick={() => setIndex(i)} aria-label={`Aller à la diapositive ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

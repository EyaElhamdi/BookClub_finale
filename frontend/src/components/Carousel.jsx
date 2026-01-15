import React, { useEffect, useState } from "react";
import "../styles/Carousel.css";

// Composant Carousel qui affiche un carrousel d'images et titres
export default function Carousel({ items = [], interval = 4500 }) {
  // index actuel de la diapositive affichée
  const [index, setIndex] = useState(0);

  // 🔹 Effet pour changer automatiquement la diapositive toutes les X ms
  useEffect(() => {
    if (!items || items.length === 0) return; // rien à afficher
    // setInterval pour changer l'index
    const t = setInterval(() => setIndex((s) => (s + 1) % items.length), interval);
    // cleanup: supprimer l'interval quand le composant se démonte ou items change
    return () => clearInterval(t);
  }, [items, interval]); // se relance si items ou interval changent

  // 🔹 Fonction pour passer à la diapositive précédente
  const prev = () => setIndex((s) => (s - 1 + items.length) % items.length);
  // 🔹 Fonction pour passer à la diapositive suivante
  const next = () => setIndex((s) => (s + 1) % items.length);

  // 🔹 Si aucun item, ne rien afficher
  if (!items || items.length === 0) return null;

  return (
    <div className="carousel" role="region" aria-roledescription="carousel">
      {/* Conteneur des diapositives */}
      <div className="carousel-slides">
        {items.map((it, i) => (
          <div
            key={it._id || i} // clé unique pour React
            className={`carousel-item ${i === index ? "active" : ""}`} // classe "active" pour la diapositive courante
            style={{ backgroundImage: `url(${it.image})` }} // image de fond
            aria-hidden={i !== index} // accessibilité: seulement la diapositive active visible
          >
            {/* Légende sur l'image */}
            <div className="carousel-caption">
              <h3>{it.title}</h3>
              {it.teaser && <p className="carousel-teaser">{it.teaser}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Boutons de navigation */}
      <button className="carousel-prev" aria-label="Précédent" onClick={prev}>‹</button>
      <button className="carousel-next" aria-label="Suivant" onClick={next}>›</button>

      {/* Indicateurs (dots) pour naviguer directement */}
      <div className="carousel-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`} // mettre en surbrillance la diapositive courante
            onClick={() => setIndex(i)} // changer de diapositive au clic
            aria-label={`Aller à la diapositive ${i + 1}`} // accessibilité
          />
        ))}
      </div>
    </div>
  );
}

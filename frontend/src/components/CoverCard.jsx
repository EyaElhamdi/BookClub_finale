import React, { useState } from "react";
import { getImageUrl, SVG_PLACEHOLDER } from "../services/imageLoader";

// Composant CoverCard : affiche la couverture d'un livre avec titre et auteur
// Props :
//  - book : objet livre contenant au minimum { title, author, image }
export default function CoverCard({ book }) {
  
  // 🔹 État local pour l'image à afficher
  // On initialise avec l'URL renvoyée par getImageUrl(book.image)
  // getImageUrl permet de gérer les chemins d'images dynamiques ou les placeholders
  const [src, setSrc] = useState(() => getImageUrl(book.image));

  // 🔹 Gestion des erreurs de chargement d'image
  const handleError = () => {
    // Si l'image échoue et n'est pas déjà le placeholder
    if (src !== SVG_PLACEHOLDER) {
      console.warn(`[CoverCard] Image load failed, using placeholder for: ${book.title}`);
      setSrc(SVG_PLACEHOLDER); // remplace l'image par un SVG générique
    }
  };

  return (
    <div className="cover-card">
      {/* Image de couverture */}
      <img 
        src={src} 
        alt={book.title} 
        onError={handleError} // fallback sur erreur
      />
      
      {/* Métadonnées du livre */}
      <div className="cover-meta">
        {/* Titre */}
        <div className="cover-title">{book.title}</div>
        {/* Auteur */}
        <div className="cover-author">{book.author}</div>
      </div>
    </div>
  );
}

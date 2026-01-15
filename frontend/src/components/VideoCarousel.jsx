import React, { useState, useEffect, useRef } from 'react';
import '../styles/VideoCarousel.css';

/* 
  Composant VideoCarousel
  Props:
    - videos: tableau d'objets { src, poster } pour chaque vidéo
    - autoplay: si true, les vidéos défilent automatiquement
    - interval: temps en ms entre chaque vidéo
*/
export default function VideoCarousel({ videos = [], autoplay = true, interval = 6000 }) {
  const [index, setIndex] = useState(0); // Index de la vidéo actuellement affichée
  const timer = useRef(null); // Ref pour stocker le timer de setInterval

  // useEffect pour gérer l'autoplay
  useEffect(() => {
    if (autoplay && videos.length > 1) {
      // Définir un intervalle pour changer la vidéo automatiquement
      timer.current = setInterval(() => {
        setIndex(i => (i + 1) % videos.length); // Cycle infini
      }, interval);

      // Nettoyage à la destruction du composant
      return () => clearInterval(timer.current);
    }
    return () => {};
  }, [autoplay, videos.length, interval]); // Relancer si autoplay, nombre de vidéos ou intervalle change

  // Fonction pour naviguer manuellement (précédent/suivant ou un dot)
  const go = (n) => {
    clearInterval(timer.current); // Stopper l'autoplay lors d'une interaction manuelle
    // Gestion du cycle infini à gauche et à droite
    setIndex(n < 0 ? videos.length - 1 : n % videos.length);
  };

  // Si aucune vidéo, ne rien afficher
  if (!videos || !videos.length) return null;

  return (
    <div className="video-carousel">

      {/* Frame contenant les vidéos */}
      <div className="video-frame">
        {videos.map((v, i) => (
          <video
            key={i}
            className={`vc-video ${i === index ? 'active' : ''}`} // active = visible
            src={v.src}               // URL de la vidéo
            poster={v.poster}         // Image d'aperçu
            controls={false}          // Pas de contrôles natifs
            muted                     // Muet pour autoplay sans blocage
            loop                      // Boucle infinie
            playsInline               // Pour mobile
            autoPlay={i === index}    // Auto-play uniquement pour la vidéo active
          />
        ))}
      </div>

      {/* Contrôles de navigation */}
      <div className="vc-controls">
        {/* Bouton précédent */}
        <button className="vc-btn" onClick={() => go(index - 1)} aria-label="Précédent">‹</button>

        {/* Dots de navigation */}
        <div className="vc-dots">
          {videos.map((_, i) => (
            <button
              key={i}
              className={`vc-dot ${i === index ? 'active' : ''}`} // Active = point actif
              onClick={() => go(i)} // Aller à la vidéo i
              aria-label={`Aller à ${i+1}`}
            />
          ))}
        </div>

        {/* Bouton suivant */}
        <button className="vc-btn" onClick={() => go(index + 1)} aria-label="Suivant">›</button>
      </div>
    </div>
  );
}

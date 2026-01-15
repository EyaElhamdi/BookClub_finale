import React from "react";
import { Link } from "react-router-dom"; // Pour la navigation interne
import "../styles/Landing.css"; // Styles spécifiques à la landing page
import bgVideo from "../assets/bookclubvd1.mp4"; // Vidéo de fond

export default function Landing() {
  return (
    <main className="landing-root">
      {/* 🔹 Vidéo de fond qui tourne en boucle, muette et autoplay */}
      <video
        className="landing-video"
        src={bgVideo}          // chemin de la vidéo
        autoPlay              // démarre automatiquement
        muted                 // muet pour éviter les problèmes autoplay
        loop                  // se répète indéfiniment
        playsInline           // joue en ligne sur mobile
      />

      {/* 🔹 Overlay pour placer le contenu au-dessus de la vidéo */}
      <div className="landing-overlay">
        <div className="landing-content">
          {/* 🔹 Nom du site */}
          <div className="landing-brand">BOOK CLUB</div>

          {/* 🔹 Citation ou slogan */}
          <h1 className="landing-quote">
            “There is more treasure in books than in all the pirate's loot on Treasure Island.”
          </h1>

          {/* 🔹 Auteur de la citation */}
          <p className="landing-by">– Walt Disney</p>

          {/* 🔹 Boutons d'action pour login / register */}
          <div className="landing-ctas">
            {/* Bouton pour se connecter */}
            <Link to="/login" className="primary">Sign In</Link>

            {/* Bouton pour s'inscrire */}
            <Link to="/register" className="view-btn">Sign Up</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

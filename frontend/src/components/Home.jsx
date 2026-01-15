import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard"; // Carte détaillée d'un livre
import CoverCard from "./CoverCard"; // Carte avec juste la couverture
import manualBooks from "../data/manualBooks"; // Livres manuels statiques
import Carousel from "./Carousel"; // Carousel pour affichage des images
import axios from "axios"; // Pour les requêtes HTTP
import "../styles/Home.css"; // Styles
import { useAuth } from "../contexts/AuthContext"; // Context Auth pour savoir si l'utilisateur est connecté

export default function Home({ favorites = [], setFavorites }) {
  const [currentUser, setCurrentUser] = useState(null);

  // 🔹 Charger le profil actuel au montage du composant
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Token dans le localStorage
        if (token) {
          const res = await axios.get('http://localhost:5000/auth/profile', {
            headers: { Authorization: `Bearer ${token}` } // Auth header
          });
          setCurrentUser(res.data); // Sauvegarde du profil
        }
      } catch (err) {
        console.error('Erreur fetch profil:', err);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Aperçu des livres (limité à 5 pour la section "Mes livres")
  const previewBooks = manualBooks.slice(0, 5);

  // 🔹 Séparation des livres par langue pour les étagères
  const englishBooks = manualBooks
    .filter(b => b.language === 'en')
    .map((b, i) => ({ ...b, id: 100 + i })); // Ajoute un id unique pour la key React
  const frenchBooks = manualBooks
    .filter(b => b.language === 'fr')
    .map((b, i) => ({ ...b, id: 200 + i }));
  const arabicBooks = manualBooks
    .filter(b => b.language === 'ar')
    .map((b, i) => ({ ...b, id: 300 + i }));

  return (
    <main className="home-container">
      {/* 🔹 Section hero / accueil */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Bienvenue sur Book Club</h1>
          <p className="hero-sub">
            Partagez vos lectures, découvrez des favoris, et échangez avec la communauté.
          </p>
          <p style={{ marginTop: 8, color: "#5f4049" }}>
            Bienvenue — découvrez une sélection de livres pour commencer.
          </p>

          {/* 🔹 Boutons CTA selon si l'utilisateur est connecté */}
          <div className="cta-row">
            {(() => {
              const { token } = useAuth();
              return token ? (
                <>
                  <Link to="/books" className="primary">Parcourir les livres</Link>
                  <Link to="/favorites" className="view-btn">Mes favoris</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="primary">Se connecter</Link>
                  <Link to="/register" className="view-btn">S'inscrire</Link>
                </>
              );
            })()}
          </div>
        </div>

        {/* 🔹 Illustration hero avec carousel */}
        <div className="hero-illustration" aria-hidden>
          <Carousel items={manualBooks.slice(0, 5)} /> {/* Affiche les 5 premiers livres */}
        </div>
      </section>

      {/* 🔹 Section "Mes livres" */}
      <section className="recent">
        <h2 className="section-title">Mes livres</h2>
        <div className="top-books">
          <div className="book-list">
            {previewBooks.map((b) => (
              <BookCard
                key={b._id}
                book={b}
                onDelete={() => {}} // Pas de suppression ici
                favorites={favorites}
                setFavorites={setFavorites}
                currentUser={currentUser} // Profil actuel pour gérer droits/favoris
              />
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <Link to="/books" className="view-btn">Voir toute la collection →</Link>
          </div>
        </div>
      </section>

      {/* 🔹 Section étagères par langue */}
      <section className="shelves">
        {/* 🔹 Livres anglais */}
        {englishBooks.length > 0 && (
          <div className="shelf">
            <div className="shelf-head">
              <h3>📖 English Books</h3>
              <Link to="/books" className="view-btn">Voir</Link>
            </div>
            <div className="shelf-row">
              {englishBooks.map((b) => (
                <CoverCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        )}

        {/* 🔹 Livres français */}
        {frenchBooks.length > 0 && (
          <div className="shelf">
            <div className="shelf-head">
              <h3>📚 Livres Français</h3>
              <Link to="/books" className="view-btn">Voir</Link>
            </div>
            <div className="shelf-row">
              {frenchBooks.map((b) => (
                <CoverCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        )}

        {/* 🔹 Livres arabes */}
        {arabicBooks.length > 0 && (
          <div className="shelf">
            <div className="shelf-head">
              <h3>✨ الكتب العربية</h3>
              <Link to="/books" className="view-btn">Voir</Link>
            </div>
            <div className="shelf-row">
              {arabicBooks.map((b) => (
                <CoverCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

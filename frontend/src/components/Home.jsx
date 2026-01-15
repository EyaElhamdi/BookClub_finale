import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";
import CoverCard from "./CoverCard";
import manualBooks from "../data/manualBooks";
import Carousel from "./Carousel";
import axios from "axios";
import "../styles/Home.css";
import { useAuth } from "../contexts/AuthContext";

export default function Home({ favorites = [], setFavorites }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch current user profile
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await axios.get('http://localhost:5000/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.error('Erreur fetch profil:', err);
      }
    };
    fetchUser();
  }, []);

  // Utilise les mêmes livres manuels partagés que la page Books
  const previewBooks = manualBooks.slice(0, 5);

  // Etagères — Filtrer par langue
  const englishBooks = manualBooks.filter(b => b.language === 'en').map((b, i) => ({ ...b, id: 100 + i }));
  const frenchBooks = manualBooks.filter(b => b.language === 'fr').map((b, i) => ({ ...b, id: 200 + i }));
  const arabicBooks = manualBooks.filter(b => b.language === 'ar').map((b, i) => ({ ...b, id: 300 + i }));

  return (
    <main className="home-container">
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Bienvenue sur Book Club</h1>
          <p className="hero-sub">
            Partagez vos lectures, découvrez des favoris, et échangez avec la communauté.
          </p>
          <p style={{ marginTop: 8, color: "#5f4049" }}>Bienvenue — découvrez une sélection de livres pour commencer.</p>
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
        <div className="hero-illustration" aria-hidden>
          <Carousel items={manualBooks.slice(0, 5)} />
        </div>
      </section>

      <section className="recent">
        <h2 className="section-title">Mes livres</h2>
        <div className="top-books">
          <div className="book-list">
            {previewBooks.map((b) => (
              <BookCard key={b._id} book={b} onDelete={() => {}} favorites={favorites} setFavorites={setFavorites} currentUser={currentUser} />
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <Link to="/books" className="view-btn">Voir toute la collection →</Link>
          </div>
        </div>
      </section>

      <section className="shelves">
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



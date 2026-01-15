import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import FavoriteBooks from "./FavoriteBooks"; // composant affichant les livres favoris
import ReadingStats from "./ReadingStats";   // composant affichant les stats de lecture
import "../styles/Profile.css";

import { useAuth } from "../contexts/AuthContext";

export default function Profile({ favorites: sharedFavorites = [], setFavorites: setSharedFavorites }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);       // stocke les infos de l'utilisateur
  const [loading, setLoading] = useState(true); // indique si on charge le profil
  const { token, logout } = useAuth();          // contexte auth global

  // 🔹 Récupération du profil depuis l'API
  useEffect(() => {
    // Si pas de token, on ne fetch pas et on passe en vue invité
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile"); // appel API pour récupérer le profil
        setUser(res.data || {});               // si API renvoie null, fallback {}
      } catch (err) {
        // Si token invalide, logout et bascule en vue invité
        if (typeof logout === "function") logout();
        setUser(null);
      } finally {
        setLoading(false);                     // fin du chargement
      }
    };

    fetchProfile();
  }, [navigate, token, logout]);

  // 🔹 Affichage pendant le chargement
  if (loading) return <p className="profile-loading">Chargement du profil...</p>;

  // 🔹 Vue invité si l'utilisateur n'est pas connecté
  if (!token) {
    return (
      <div className="profile-container">
        <header className="header">
          <h1>📚 Book Club</h1>
        </header>
        <main style={{ padding: 24, textAlign: "center" }}>
          <h2>Vous n'êtes pas connecté(e)</h2>
          <p className="muted">Connectez-vous pour voir et modifier votre profil.</p>
          <div style={{ marginTop: 16 }}>
            <button
              className="add-btn"
              onClick={() => navigate("/login")}
            >
              Se connecter
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 🔹 Vue principale pour utilisateur connecté
  return (
    <div className="profile-container">
      {/* ===== HEADER ===== */}
      <header className="header">
        <h1>📚 Book Club</h1>
      </header>

      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <Link to="/home" className="nav-btn">Accueil</Link>
        <Link to="/books" className="nav-btn">Mes livres</Link>
        <Link to="/favorites" className="nav-btn">Favoris</Link>
        <Link to="/profile" className="nav-btn active">Profil</Link>
        <button
          className="nav-btn logout-btn"
          onClick={() => {
            if (typeof logout === "function") logout();
            navigate("/login");
          }}
        >
          Déconnexion
        </button>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        {/* ---- WELCOME + FAVORITES (left column) ---- */}
        <section className="welcome-left">
          <h2 className="greeting">Bonjour {user.firstName || "Utilisateur"} 👋</h2>
          <p className="sub-greeting">Heureuse de vous revoir sur Book Club</p>

          {/* 🔹 Statistiques de lecture */}
          <ReadingStats userId={user._id} />

          {/* 🔹 Favoris */}
          <FavoriteBooks
            favorites={
              (Array.isArray(sharedFavorites) && sharedFavorites.length > 0)
                ? sharedFavorites
                : user?.favorites || []
            }
            setFavorites={(newFavs) => {
              // Met à jour les favoris dans le contexte partagé et dans l'état utilisateur
              if (setSharedFavorites) setSharedFavorites(newFavs);
              if (user) setUser({ ...user, favorites: newFavs });
            }}
            onBookAdded={(book) => {
              // Ajout d'un nouveau livre aux favoris
              const newFavs = [...(sharedFavorites || user?.favorites || []), book];
              if (setSharedFavorites) setSharedFavorites(newFavs);
              if (user) setUser({ ...user, favorites: newFavs });
              window.location.reload(); // recharge la page pour synchroniser
            }}
          />
        </section>

        {/* ---- USER INFO ---- */}
        <aside className="info-box">
          <h2>👤 Informations personnelles</h2>
          <form className="info-form">
            {/* Affiche les champs info utilisateur en lecture seule */}
            {["lastName", "firstName", "email", "city"].map((field) => (
              <div className="info-row" key={field}>
                <label>
                  {field === "lastName"
                    ? "Nom"
                    : field === "firstName"
                    ? "Prénom"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input value={user[field] || ""} disabled />
              </div>
            ))}
            <button
              type="button"
              className="edit-btn"
              onClick={() => navigate("/edit-profile")}
            >
              ✏️ Modifier mes informations
            </button>
          </form>
        </aside>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="footer-text">
        Partagez vos lectures et découvrez ce que les autres membres aiment 💕
      </footer>
    </div>
  );
}

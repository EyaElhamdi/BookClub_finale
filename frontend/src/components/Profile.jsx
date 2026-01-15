import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import FavoriteBooks from "./FavoriteBooks";
import ReadingStats from "./ReadingStats";
import "../styles/Profile.css";

import { useAuth } from "../contexts/AuthContext";

export default function Profile({ favorites: sharedFavorites = [], setFavorites: setSharedFavorites }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // allow guest view when no token (prevents automatic redirect on click)
  const { token, logout } = useAuth();

  useEffect(() => {
    // If no token, stop fetching and show guest view
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setUser(res.data || {}); // si API renvoie null
      } catch (err) {
        // si token invalide, basculer en vue invité
        if (typeof logout === "function") logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token, logout]);

  if (loading) return <p className="profile-loading">Chargement du profil...</p>;

  // Guest view when not authenticated
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

          {/* Reading Stats */}
          <ReadingStats userId={user._id} />

          {/* Favorites placed directly under greeting */}
          <FavoriteBooks
            favorites={
              (Array.isArray(sharedFavorites) && sharedFavorites.length > 0)
                ? sharedFavorites
                : user?.favorites || []
            }
            setFavorites={(newFavs) => {
              if (setSharedFavorites) setSharedFavorites(newFavs);
              if (user) setUser({ ...user, favorites: newFavs });
            }}
            onBookAdded={(book) => {
              // Ajouter le nouveau livre aux favoris et recharger
              const newFavs = [...(sharedFavorites || user?.favorites || []), book];
              if (setSharedFavorites) setSharedFavorites(newFavs);
              if (user) setUser({ ...user, favorites: newFavs });
              window.location.reload();
            }}
          />
        </section>

        {/* ---- USER INFO ---- */}
        <aside className="info-box">
          <h2>👤 Informations personnelles</h2>
          <form className="info-form">
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















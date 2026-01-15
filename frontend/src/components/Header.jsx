import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/buttons.css"; // Styles des boutons
import Logo from "../assets/logo.png"; // Logo local
import { useTheme } from "../contexts/ThemeContext"; // Context pour thème clair/sombre
import { useAuth } from "../contexts/AuthContext"; // Context pour auth utilisateur

// 🔹 Bouton pour changer le thème
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="theme-toggle"
      aria-label="Basculer le thème"
      onClick={toggleTheme} // Appelle la fonction du contexte
    >
      {theme === "dark" ? "☀︎" : "☾"} {/* Soleil si dark, lune si light */}
    </button>
  );
}

// 🔹 Fonction pour résoudre les images locales ou fallback
const resolveLocalImage = (img) => {
  try {
    if (!img) return '/book-placeholder.svg'; // fallback si rien
    if (typeof img === 'string') {
      if (img.startsWith('/') || img.startsWith('http')) return img; // URL absolue ou public path
      if (/^[A-Za-z]:\\\\|^[A-Za-z]:\\/.test(img) || img.includes('\\')) {
        // Windows path -> extraire le nom du fichier
        const fileName = img.split(/[/\\\\]/).pop();
        try { return require(`./${fileName}`); } catch (e) { return img; }
      }
      if (img.startsWith('./') || img.startsWith('../')) {
        try { return require(`${img}`); } catch (e) { return img; }
      }
      return img;
    }
    if (typeof img === 'object' && img.default) return img.default; // import ES Module
    return img;
  } catch (e) {
    return '/book-placeholder.svg';
  }
};

// 🔹 Résolution finale du logo
const logoSrc = resolveLocalImage(Logo);
console.debug("Header logo resolved ->", logoSrc);

export default function Header() {
  const location = useLocation(); // Pour savoir sur quelle page on est

  // 🔹 Pages où le header ne doit pas apparaître
  const hiddenRoutes = ["/", "/login", "/register"];
  if (hiddenRoutes.includes(location.pathname)) {
    return null; // On ne rend pas le header
  }

  const navigate = useNavigate(); // Pour naviguer programmatique
  const { token, logout } = useAuth(); // Infos utilisateur

  // 🔹 Classe active pour le bouton de navigation
  const active = (path) => (location.pathname === path ? "nav-btn active" : "nav-btn");

  return (
    <header className="app-header">
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 🔹 Logo + navigation principale */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" className="brand" aria-label="BOOK CLUB">
            <img
              src={logoSrc}
              alt="BOOK CLUB"
              className="brand-logo"
              style={{ width: 34, height: 34, objectFit: 'contain' }}
              onError={(e)=>{ e.currentTarget.src = '/book-placeholder.svg'; }} // fallback image
            />
            <span className="brand-title">BOOK CLUB</span>
          </Link>

          {/* 🔹 Liens visibles seulement si connecté */}
          {token ? (
            <>
              <Link to="/home" className={active("/home")}>Accueil</Link>
              <Link to="/books" className={active("/books")}>Mes livres</Link>
              <Link to="/favorites" className={active("/favorites")}>Favoris</Link>
              <Link to="/profile" className={active("/profile")}>Profil</Link>
            </>
          ) : null}
        </div>

        {/* 🔹 Boutons à droite : thème + login/logout */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemeToggle /> {/* Changement de thème */}

          {!token ? (
            // 🔹 Si pas connecté : login / register
            <>
              <Link to="/login" className="nav-btn">Se connecter</Link>
              <Link to="/register" className="nav-btn">S'inscrire</Link>
            </>
          ) : (
            // 🔹 Si connecté : bouton logout
            <>
              <button
                className="nav-btn"
                onClick={() => {
                  logout(); // Déconnexion via context
                  navigate('/login'); // Redirection
                }}
              >
                Se déconnecter
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

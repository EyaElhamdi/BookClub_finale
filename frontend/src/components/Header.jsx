import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/buttons.css";
import Logo from "../assets/logo.png";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" aria-label="Basculer le thème" onClick={toggleTheme}>
      {theme === "dark" ? "☀︎" : "☾"}
    </button>
  );
}

// Resolve local images robustly (support import shapes, relative paths and Windows absolute paths)
const resolveLocalImage = (img) => {
  try {
    if (!img) return '/book-placeholder.svg';
    if (typeof img === 'string') {
      // If it's an absolute URL or public path, return as-is
      if (img.startsWith('/') || img.startsWith('http')) return img;
      // If it's a Windows absolute path or contains backslashes, extract filename and try to require it from this folder
      if (/^[A-Za-z]:\\\\|^[A-Za-z]:\\/.test(img) || img.includes('\\')) {
        const fileName = img.split(/[/\\\\]/).pop();
        try { return require(`./${fileName}`); } catch (e) { return img; }
      }
      // Otherwise assume it's a relative path (./...) - try to require it
      if (img.startsWith('./') || img.startsWith('../')) {
        try { return require(`${img}`); } catch (e) { return img; }
      }
      return img;
    }
    if (typeof img === 'object' && img.default) return img.default;
    return img;
  } catch (e) {
    return '/book-placeholder.svg';
  }
};

const logoSrc = resolveLocalImage(Logo);
console.debug("Header logo resolved ->", logoSrc);

export default function Header() {
  const location = useLocation();

  // ❌ Pages où le header ne doit PAS apparaître
  const hiddenRoutes = ["/", "/login", "/register"];

  if (hiddenRoutes.includes(location.pathname)) {
    return null; // ⬅️ cache complètement le header
  }

  const navigate = useNavigate();
  const { token, logout } = useAuth();

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
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" className="brand" aria-label="BOOK CLUB">
            <img
              src={logoSrc}
              alt="BOOK CLUB"
              className="brand-logo"
              style={{ width: 34, height: 34, objectFit: 'contain' }}
              onError={(e)=>{ e.currentTarget.src = '/book-placeholder.svg'; }}
            />
            <span className="brand-title">BOOK CLUB</span>
          </Link>

          {token ? (
            <>
              <Link to="/home" className={active("/home")}>Accueil</Link>
              <Link to="/books" className={active("/books")}>Mes livres</Link>
              <Link to="/favorites" className={active("/favorites")}>Favoris</Link>
              <Link to="/profile" className={active("/profile")}>Profil</Link>
            </>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* theme */}
          <ThemeToggle />

          {!token ? (
            <>
              <Link to="/login" className="nav-btn">Se connecter</Link>
              <Link to="/register" className="nav-btn">S'inscrire</Link>
            </>
          ) : (
            <>
              <button
                className="nav-btn"
                onClick={() => {
                  logout();
                  navigate('/login');
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


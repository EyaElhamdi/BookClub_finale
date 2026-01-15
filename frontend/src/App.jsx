import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// Services
import { preloadAllImages } from "./services/imageRegistry";

// Auth
import Login from "./components/login.jsx";
import Register from "./components/Register.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// User
import Profile from "./components/Profile.jsx";
import EditProfile from "./components/EditProfile.jsx";

// Admin
import UsersPage from "./components/UsersPage.jsx";

// Books
import Home from "./components/Home.jsx";
import Books from "./components/Books.jsx";
import BookDetails from "./components/BookDetails.jsx";
import Favorites from "./components/Favorites.jsx";

// Layout
import Header from "./components/Header.jsx";
import Landing from "./components/Landing.jsx";

function AppRoutes() {
  const { token, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state && location.state.background;
  const isAuthenticated = !!token;

  // debug
  console.log('AppRoutes render', { token, role, pathname: location.pathname, isAuthenticated });
  /* =========================
     FAVORITES (localStorage)
  ========================== */
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("favorites");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

    /* auth via AuthContext (no local state here) */

  return (
    <>
      <Header />

      {/* render the app routes using background location when a modal is open */}
      <Routes location={background || location}>
        {/* Redirection par défaut */}
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Utilisateur */}
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Profile favorites={favorites} setFavorites={setFavorites} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/edit-profile"
          element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />}
        />

        {/* Pages principales */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home favorites={favorites} setFavorites={setFavorites} /> : <Navigate to="/login" />}
        />

        <Route
          path="/books"
          element={
            isAuthenticated ? (
              <Books favorites={favorites} setFavorites={setFavorites} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/books/:id"
          element={isAuthenticated ? (
            <BookDetails favorites={favorites} setFavorites={setFavorites} onAddFavorite={(b)=>{
              const exists = favorites.some((f)=>f._id===b._id);
              if (!exists) setFavorites([...favorites, { _id: b._id, title: b.title, author: b.author, image: b.image }]);
            }} onRemoveFavorite={(b)=> setFavorites(favorites.filter(f=>f._id!==b._id))} />
          ) : (
            <Navigate to="/login" />
          )}
        />

        <Route
          path="/favorites"
          element={
            isAuthenticated ? (
              <Favorites
                favorites={favorites}
                setFavorites={setFavorites}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            isAuthenticated && role === "admin" ? (
              <UsersPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      {/* Modal route — renders on top of the previous location */}
      {background && (
        <Routes>
          <Route
            path="/books/:id"
            element={
              <ModalWrapper onClose={() => navigate(-1)}>
                <BookDetails
                  isModal={true}
                  onClose={() => navigate(-1)}
                  favorites={favorites}
                  setFavorites={setFavorites}
                  onAddFavorite={(b) => {
                    const exists = favorites.some((f) => f._id === b._id);
                    if (!exists) setFavorites([...favorites, { _id: b._id, title: b.title, author: b.author, image: b.image }]);
                  }}
                  onRemoveFavorite={(b) => setFavorites(favorites.filter((f) => f._id !== b._id))}
                />
              </ModalWrapper>
            }
          />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  console.log('App render');

  // Preload all images when app starts
  React.useEffect(() => {
    console.log("[App] Starting image preload...");
    preloadAllImages();
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function ModalWrapper({ children, onClose }) {
  // handle open/close animations and Esc key
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    // open animation
    const t = setTimeout(() => setOpen(true), 10);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    // wait for animation to finish before calling onClose
    setTimeout(() => onClose && onClose(), 220);
  };

  return (
    <div className={`page-modal ${open ? 'open' : 'closing'}`} role="dialog" aria-modal="true" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Fermer" onClick={handleClose}>×</button>
        {children}
      </div>
    </div>
  );
}























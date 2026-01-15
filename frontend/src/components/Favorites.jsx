import React, { useState, useMemo, useEffect } from "react";
import BookCard from "./BookCard"; // Composant pour afficher chaque livre
import axios from "axios"; // Pour communiquer avec le backend
import { useAuth } from "../contexts/AuthContext"; // Pour récupérer le rôle utilisateur
import "../styles/FavoriteBooks.css";

export default function Favorites({ favorites = [], setFavorites }) {
  const [query, setQuery] = useState(""); // Texte de recherche
  const [notification, setNotification] = useState(null); // Message temporaire
  const { role } = useAuth(); // Récupère rôle de l'utilisateur
  const isCreator = role === 'creator'; // Booléen pratique

  // 🔹 Debug : afficher les favoris à chaque changement
  useEffect(() => {
    console.log('[Favorites] Current favorites:', favorites);
  }, [favorites]);

  // 🔹 Filtrage des favoris selon la recherche
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites; // Si pas de recherche, afficher tous
    return favorites.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || // Cherche dans le titre
        (b.author && b.author.toLowerCase().includes(q)) // Cherche dans l'auteur
    );
  }, [query, favorites]);

  // 🔹 Supprimer un livre des favoris côté frontend
  const handleRemoveFavorite = (book) => {
    console.log('[Favorites] Removing book:', book._id, book.title);
    setFavorites(favorites.filter((b) => b._id !== book._id));

    // Afficher notification temporaire
    setNotification(`"${book.title}" a été retiré des favoris`);
    setTimeout(() => setNotification(null), 3000); // disparaît après 3s
  };

  // 🔹 Supprimer un livre côté backend si nécessaire (créateur + livre non manuel)
  const handleDelete = async (id) => {
    const isManualBook = id && id.startsWith('m'); // Les livres manuels commencent par 'm'

    if (!isManualBook && isCreator) {
      try {
        const token = localStorage.getItem('token'); // Récupère le token auth
        await axios.delete(`http://localhost:5000/api/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Erreur suppression livre:', err);
      }
    }

    // Toujours supprimer localement des favoris
    handleRemoveFavorite({ _id: id });
  };

  return (
    <main className="favorites-page">
      {/* 🔹 Notification */}
      {notification && (
        <div className="notification-toast" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff2d6f',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          {notification}
        </div>
      )}

      {/* 🔹 En-tête */}
      <div className="favorites-header">
        <h1>📚 Mes Favoris</h1>
        <p className="subtitle">{filtered.length} livre{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* 🔹 Barre de recherche */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher un livre ou un auteur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 🔹 Grille de livres */}
      {filtered.length > 0 ? (
        <div className="books-grid">
          {filtered.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              favorites={favorites}
              setFavorites={setFavorites}
              onRemoveFavorite={handleRemoveFavorite} // Supprimer des favoris
              onDelete={handleDelete} // Supprimer du backend si créateur
            />
          ))}
        </div>
      ) : (
        // 🔹 État vide
        <div className="empty-state">
          <p className="empty-text">
            {favorites.length === 0
              ? "Aucun livre favori 📚\nComencez à ajouter vos livres préférés!"
              : "Aucun résultat pour votre recherche..."}
          </p>
        </div>
      )}
    </main>
  );
}

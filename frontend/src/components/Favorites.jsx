import React, { useState, useMemo, useEffect } from "react";
import BookCard from "./BookCard";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "../styles/FavoriteBooks.css";

export default function Favorites({ favorites = [], setFavorites }) {
  const [query, setQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const { role } = useAuth();
  const isCreator = role === 'creator';

  // Debug: Log favorites when they change
  useEffect(() => {
    console.log('[Favorites] Current favorites:', favorites);
  }, [favorites]);

  // Filtrer les favoris selon la recherche
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }, [query, favorites]);

  // Supprimer un livre des favoris
  const handleRemoveFavorite = (book) => {
    console.log('[Favorites] Removing book:', book._id, book.title);
    setFavorites(favorites.filter((b) => b._id !== book._id));
    
    // Show notification
    setNotification(`"${book.title}" a été retiré des favoris`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Supprimer un livre (backend si c'est un livre créateur)
  const handleDelete = async (id) => {
    const isManualBook = id && id.startsWith('m');
    
    if (!isManualBook && isCreator) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Erreur suppression livre:', err);
      }
    }
    
    handleRemoveFavorite({ _id: id });
  };

  return (
    <main className="favorites-page">
      {/* Notification */}
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

      <div className="favorites-header">
        <h1>📚 Mes Favoris</h1>
        <p className="subtitle">{filtered.length} livre{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher un livre ou un auteur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Books grid */}
      {filtered.length > 0 ? (
        <div className="books-grid">
          {filtered.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              favorites={favorites}
              setFavorites={setFavorites}
              onRemoveFavorite={handleRemoveFavorite}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
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

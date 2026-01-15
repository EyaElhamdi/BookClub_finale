import React, { useState } from "react";
import BookCard from "./BookCard";
import AddBookModal from "./AddBookModal";
import { addFavorite, deleteBook as deleteBookAPI } from "./bookService";
import { useAuth } from "../contexts/AuthContext";
import "../styles/FavoriteBooks.css";

export default function FavoriteBooks({ favorites = [], setFavorites, onBookAdded }) {
  const { role } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Ajouter un nouveau livre via le formulaire
  const addBook = async (book) => {
    try {
      // Le livre a été créé au backend, on l'ajoute aux favoris ET on notifie la liste globale
      const saved = await addFavorite(book);
      if (saved && setFavorites) {
        setFavorites([...favorites, saved]);
      } else if (setFavorites) {
        setFavorites([...favorites, book]);
      }
      
      // Notifier la page Books pour qu'elle rafraîchisse
      if (onBookAdded) {
        onBookAdded(book);
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du favori :", err);
      if (setFavorites) {
        setFavorites([...favorites, book]);
      }
      if (onBookAdded) {
        onBookAdded(book);
      }
    }
  };

  // Supprimer un livre des favoris (backend si nécessaire)
  const deleteBook = async (id) => {
    try {
      await deleteBookAPI(id); // supprimer côté backend
      if (setFavorites) {
        setFavorites(favorites.filter((b) => b._id !== id));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du livre :", err);
    }
  };

  return (
    <section className="favorites-section">
      <h3>📖 Mes livres favoris</h3>

      {favorites.length > 0 ? (
        <div className="book-list">
          {favorites.slice(0, 3).map((book) => (
            <BookCard
              key={book._id || book.title}
              book={book}
              onDelete={deleteBook}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          ))}
        </div>
      ) : (
        <p className="empty-text">Aucun livre favori pour le moment 📚</p>
      )}

      <div className="buttons">
        {role === 'creator' ? (
          <button className="add-btn" onClick={() => setShowModal(true)}>
            ➕ Ajouter un livre
          </button>
        ) : (
          <button className="add-btn" disabled title="Seuls les créateurs peuvent ajouter des livres">
            ➕ Ajouter un livre
          </button>
        )}
        <button className="view-btn" onClick={() => window.location.href = "/favorites"}>
          Voir plus →
        </button>
      </div>

      {showModal && role === 'creator' && <AddBookModal onAdd={addBook} onClose={() => setShowModal(false)} />}
    </section>
  );
}







import React, { useState } from "react";
import BookCard from "./BookCard"; // Composant pour afficher chaque livre
import AddBookModal from "./AddBookModal"; // Modal pour ajouter un nouveau livre
import { addFavorite, deleteBook as deleteBookAPI } from "./bookService"; // Fonctions pour interagir avec le backend
import { useAuth } from "../contexts/AuthContext"; // Contexte pour récupérer le rôle de l'utilisateur
import "../styles/FavoriteBooks.css";

export default function FavoriteBooks({ favorites = [], setFavorites, onBookAdded }) {
  const { role } = useAuth(); // Récupère le rôle (ex: "creator")
  const [showModal, setShowModal] = useState(false); // Contrôle l'affichage du modal d'ajout

  // 🔹 Fonction pour ajouter un nouveau livre aux favoris
  const addBook = async (book) => {
    try {
      // On tente de l'ajouter via le backend
      const saved = await addFavorite(book);

      // Si on a une réponse du backend et que setFavorites est défini, on met à jour le state
      if (saved && setFavorites) {
        setFavorites([...favorites, saved]);
      } else if (setFavorites) {
        // Sinon on l'ajoute localement
        setFavorites([...favorites, book]);
      }

      // Notifie la liste globale de Books pour rafraîchir si nécessaire
      if (onBookAdded) {
        onBookAdded(book);
      }
    } catch (err) {
      // En cas d'erreur, on ajoute quand même localement pour ne pas bloquer l'utilisateur
      console.error("Erreur lors de l'ajout du favori :", err);
      if (setFavorites) setFavorites([...favorites, book]);
      if (onBookAdded) onBookAdded(book);
    }
  };

  // 🔹 Fonction pour supprimer un livre des favoris
  const deleteBook = async (id) => {
    try {
      await deleteBookAPI(id); // Supprime côté backend
      if (setFavorites) {
        // Supprime aussi côté frontend pour mise à jour immédiate
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
        // 🔹 Affiche les 3 premiers livres favoris
        <div className="book-list">
          {favorites.slice(0, 3).map((book) => (
            <BookCard
              key={book._id || book.title}
              book={book}
              onDelete={deleteBook} // Fonction pour supprimer un livre
              favorites={favorites}
              setFavorites={setFavorites}
            />
          ))}
        </div>
      ) : (
        // 🔹 Message si aucun favori
        <p className="empty-text">Aucun livre favori pour le moment 📚</p>
      )}

      <div className="buttons">
        {/* 🔹 Bouton pour ajouter un livre, uniquement si l'utilisateur est créateur */}
        {role === 'creator' ? (
          <button className="add-btn" onClick={() => setShowModal(true)}>
            ➕ Ajouter un livre
          </button>
        ) : (
          <button className="add-btn" disabled title="Seuls les créateurs peuvent ajouter des livres">
            ➕ Ajouter un livre
          </button>
        )}

        {/* 🔹 Bouton pour aller à la page complète des favoris */}
        <button className="view-btn" onClick={() => window.location.href = "/favorites"}>
          Voir plus →
        </button>
      </div>

      {/* 🔹 Affichage du modal d'ajout si le rôle est "creator" et showModal est true */}
      {showModal && role === 'creator' && (
        <AddBookModal 
          onAdd={addBook} // Callback pour ajouter le livre
          onClose={() => setShowModal(false)} // Fermer le modal
        />
      )}
    </section>
  );
}
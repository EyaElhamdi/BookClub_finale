import React, { useEffect, useState, useMemo } from "react";
import BookCard from "./BookCard"; // Composant pour afficher chaque livre
import manualBooks from "../data/manualBooks"; // Livres ajoutés manuellement (local)
import axios from "axios"; // Pour fetch depuis l'API
import "../styles/Books.css";

// Composant principal qui liste tous les livres et gère favoris
export default function Books({ favorites, setFavorites }) {
  // États principaux
  const [books, setBooks] = useState([]); // Liste complète des livres
  const [query, setQuery] = useState(""); // Valeur de la barre de recherche
  const [currentUser, setCurrentUser] = useState(null); // Informations de l'utilisateur connecté

  // 🔹 useEffect pour récupérer les livres depuis le backend + livres manuels
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/books'); // fetch backend
        const backendBooks = Array.isArray(res.data) ? res.data : [];
        
        // Combinaison des livres manuels et backend
        const allBooks = [...manualBooks, ...backendBooks];
        
        // Supprimer doublons basés sur _id
        const uniqueBooks = Array.from(new Map(allBooks.map(b => [b._id, b])).values());
        
        console.log('Fetched books:', uniqueBooks);
        setBooks(uniqueBooks); // mise à jour de l'état
      } catch (err) {
        console.error('Erreur fetch livres:', err);
        // Si le backend est indisponible, fallback sur livres manuels
        setBooks([...manualBooks]);
      }
    };
    fetchBooks();
  }, []); // se lance une seule fois au montage

  // 🔹 useEffect pour récupérer le profil de l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // récupérer token
        if (token) {
          const res = await axios.get('http://localhost:5000/auth/profile', { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          setCurrentUser(res.data); // mettre à jour l'utilisateur
        }
      } catch (err) {
        console.error('Erreur fetch profil:', err);
      }
    };
    fetchUser();
  }, []); // se lance une seule fois

  // 🔹 Fonction pour supprimer un livre (localement côté client)
  const handleDelete = (id) => {
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  // 🔹 Ajouter un livre aux favoris
  const handleAddFavorite = async (book) => {
    if (!favorites.some((b) => b._id === book._id)) {
      // Ajouter côté client seulement (persisté dans App via localStorage)
      const item = { _id: book._id, title: book.title, author: book.author, image: book.image };
      setFavorites([...favorites, item]);
    }
  };

  // 🔹 Retirer un livre des favoris
  const handleRemoveFavorite = (book) => {
    setFavorites(favorites.filter((b) => b._id !== book._id));
  };

  // 🔹 Filtrage des livres pour la recherche et exclusion livres sans images
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // On ne garde que les livres avec image
    const booksWithImages = books.filter((b) => b.image && b.image.trim() !== "");
    
    if (!q) return booksWithImages; // pas de recherche => tous
    // Filtrage par titre ou auteur
    return booksWithImages.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }, [query, books]); // recalcul seulement si query ou books changent

  // 🔹 Rendu JSX
  return (
    <div className="books-page">
      {/* Section "hero" avec titre et barre de recherche */}
      <div className="books-hero">
        <div className="title-area">
          <h2>Mes livres</h2>
          <span className="book-count">{filtered.length} livre{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <div className="controls">
          <input
            className="search-bar"
            placeholder="Rechercher un titre ou un auteur..."
            value={query}
            onChange={(e) => setQuery(e.target.value)} // mise à jour de query
          />
        </div>
      </div>

      {/* Liste des livres */}
      <div className="book-list">
        {filtered.map((b) => (
          <BookCard
            key={b._id}
            book={b}
            favorites={favorites}
            onDelete={handleDelete}
            onAddFavorite={handleAddFavorite}
            onRemoveFavorite={handleRemoveFavorite}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}

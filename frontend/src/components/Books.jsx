import React, { useEffect, useState, useMemo } from "react";
import BookCard from "./BookCard";
import manualBooks from "../data/manualBooks";
import axios from "axios";
import "../styles/Books.css";

// **Import des images**
export default function Books({ favorites, setFavorites }) {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch tous les livres (backend + manuels)
    const fetchBooks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/books');
        // Combine backend books with manual books
        const backendBooks = Array.isArray(res.data) ? res.data : [];
        const allBooks = [...manualBooks, ...backendBooks];
        
        // Remove duplicates (same title)
        const uniqueBooks = Array.from(new Map(allBooks.map(b => [b._id, b])).values());
        
        console.log('Fetched books:', uniqueBooks);
        setBooks(uniqueBooks);
      } catch (err) {
        console.error('Erreur fetch livres:', err);
        // Fallback aux livres manuels si backend non disponible
        setBooks([...manualBooks]);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    // Fetch current user profile
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await axios.get('http://localhost:5000/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.error('Erreur fetch profil:', err);
      }
    };
    fetchUser();
  }, []);

  // Supprimer un livre
  const handleDelete = (id) => {
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  // Ajouter aux favoris
  const handleAddFavorite = async (book) => {
    if (!favorites.some((b) => b._id === book._id)) {
      // client-side add (persisted in localStorage via App)
      const item = { _id: book._id, title: book.title, author: book.author, image: book.image };
      setFavorites([...favorites, item]);
    }
  };

  // Retirer des favoris
  const handleRemoveFavorite = (book) => {
    setFavorites(favorites.filter((b) => b._id !== book._id));
  };

  // Filtrage - Exclure les livres sans images
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // Filter out books without valid images
    const booksWithImages = books.filter((b) => b.image && b.image.trim() !== "");
    
    if (!q) return booksWithImages;
    return booksWithImages.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }, [query, books]);

  return (
    <div className="books-page">
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
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

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






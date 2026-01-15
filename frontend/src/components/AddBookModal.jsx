import React, { useState } from "react";
import axios from "axios";
import "../styles/AddBookModal.css";

function AddBookModal({ onClose, onAdd }) {
  const [book, setBook] = useState({
    title: "",
    author: "",
    rating: 0,
    image: "",
    teaser: "",
    buyLink: "",
    excerpt: "",
    year: "",
    pages: "",
    publisher: "",
    isbn: "",
    genres: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vous devez être connecté");
        setLoading(false);
        return;
      }

      // Convert genres string to array
      const bookData = {
        ...book,
        rating: book.rating ? parseFloat(book.rating) : 0,
        genres: book.genres ? book.genres.split(',').map(g => g.trim()) : [],
      };

      const response = await axios.post("http://localhost:5000/api/books", bookData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        onAdd(response.data);
        onClose();
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du livre :", err);
      setError(err.response?.data?.message || "Erreur lors de l'ajout du livre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-modal-overlay" onClick={onClose}>
      <div className="add-book-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ajouter un livre</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-row">
            <div className="form-field">
              <label>Titre *</label>
              <input
                type="text"
                name="title"
                placeholder="Titre du livre"
                value={book.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Auteur *</label>
              <input
                type="text"
                name="author"
                placeholder="Nom de l'auteur"
                value={book.author}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Note</label>
              <input
                type="number"
                name="rating"
                placeholder="0-5"
                min="0"
                max="5"
                step="0.1"
                value={book.rating}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Année</label>
              <input
                type="number"
                name="year"
                placeholder="Année de publication"
                value={book.year}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Pages</label>
              <input
                type="number"
                name="pages"
                placeholder="Nombre de pages"
                value={book.pages}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Éditeur</label>
              <input
                type="text"
                name="publisher"
                placeholder="Nom de l'éditeur"
                value={book.publisher}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>ISBN</label>
              <input
                type="text"
                name="isbn"
                placeholder="ISBN du livre"
                value={book.isbn}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Image URL</label>
            <input
              type="url"
              name="image"
              placeholder="https://..."
              value={book.image}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Teaser</label>
            <textarea
              name="teaser"
              placeholder="Courte description"
              rows="2"
              value={book.teaser}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Extrait</label>
            <textarea
              name="excerpt"
              placeholder="Extrait du livre"
              rows="3"
              value={book.excerpt}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Lien d'achat</label>
            <input
              type="url"
              name="buyLink"
              placeholder="https://..."
              value={book.buyLink}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Genres (séparés par des virgules)</label>
            <input
              type="text"
              name="genres"
              placeholder="Ex: Fiction, Aventure, Jeunesse"
              value={book.genres}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter le livre"}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBookModal;


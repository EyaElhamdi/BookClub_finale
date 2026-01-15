import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, SVG_PLACEHOLDER } from "../services/imageLoader";

export default function BookCard({ book, onDelete, favorites = [], setFavorites, onAddFavorite, onRemoveFavorite }) {
  const location = useLocation();
  const { role } = useAuth();
  const isCreator = role === 'creator';
  
  const initial = getImageUrl(book.image);
  const [src, setSrc] = useState(initial);

  React.useEffect(()=>{
    console.debug("BookCard image resolved:", src, "for book:", book && book.title);
  },[src, book]);

  const handleError = () => {
    if (src !== SVG_PLACEHOLDER) {
      console.warn(`[BookCard] Image load failed, using placeholder for: ${book.title}`);
      setSrc(SVG_PLACEHOLDER);
    }
  };

  // Vérifie si le livre est déjà dans les favoris
  const isRtl = book && (book.rtl || (book.language && (book.language === 'ar' || book.language === 'العربية')));
  const isFav = favorites.some((f) => f._id === book._id);

  // Ajouter ou retirer des favoris
  const toggleFavorite = (e) => {
    e && e.stopPropagation();
    const exists = favorites.some((f) => f._id === book._id);
    if (exists) {
      // show confirmation before removing from favorites
      return setShowUnfavConfirm(true);
    }

    // add
    if (typeof onAddFavorite === "function") return onAddFavorite(book);
    if (!setFavorites) return;
    
    // Create favorite object with all needed properties
    const favObject = {
      _id: book._id,
      title: book.title,
      author: book.author,
      image: book.image,
      rating: book.rating,
      language: book.language,
      teaser: book.teaser,
      year: book.year
    };
    
    setFavorites((prev = []) => {
      const updated = [...prev, favObject];
      console.log('[BookCard] Added to favorites:', favObject);
      console.log('[BookCard] Total favorites:', updated.length);
      return updated;
    });
  };

  // Supprimer un livre (seulement pour créateurs et livres du backend)
  const isManualBook = book._id && book._id.startsWith('m');
  const canDeleteBook = isCreator && !isManualBook;
  const [showConfirm, setShowConfirm] = useState(false);
  const [showUnfavConfirm, setShowUnfavConfirm] = useState(false);
  const handleDeleteClick = async () => setShowConfirm(true);
  const confirmDelete = async () => {
    try {
      if (onDelete) onDelete(book._id); // Supprime localement
      await axios.delete(`http://localhost:5000/api/books/${book._id}`); // Supprime côté backend
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Impossible de supprimer le livre. Vérifiez la console.");
    } finally {
      setShowConfirm(false);
    }
  };

  const confirmUnfav = () => {
    try {
      console.log('[BookCard] Removing from favorites:', book._id);
      
      // Call both methods to ensure state is updated everywhere
      if (typeof onRemoveFavorite === "function") {
        onRemoveFavorite(book);
      }
      
      // Also update setFavorites directly to ensure state sync
      if (setFavorites) {
        setFavorites((prev = []) => {
          const updated = prev.filter((f) => f._id !== book._id);
          console.log('[BookCard] Favorites after removal:', updated);
          return updated;
        });
      }
    } finally {
      setShowUnfavConfirm(false);
    }
  };

  return (
    <div className={`book-card ${isRtl ? 'rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="img-wrap">
        {book.rating !== undefined && (
          <div className="rating-pill">⭐ {book.rating || 0}</div>
        )}
        {book.author && (
          <div className="author-badge">{book.author.split(' ')[0]}</div>
        )}
        <img
          src={src}
          alt={book.title}
          loading="lazy"
          onError={handleError}
        />

        {/* Debug: show resolved src if image doesn't display */}


        <div className="overlay">
          <Link className="cta" to={`/books/${book._id}`} state={{ background: location, book }}>Voir plus</Link>
        </div>
      </div>

      <div className="card-body">
        <h4>{book.title}</h4>
        <p>{book.author}</p>
        <p className="rating">⭐ {book.rating || 0}/5</p>

        <div className="actions">
          <button className="small-btn" onClick={toggleFavorite}>
            {isFav ? "❤️Retirer des favoris" : "🤍Ajouter aux favoris"}
          </button>
          {canDeleteBook && (
            <button className="small-btn delete-btn" onClick={handleDeleteClick}>Supprimer</button>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        title="Supprimer le livre"
        message="Voulez-vous vraiment supprimer ce livre ?"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
      <ConfirmModal
        isOpen={showUnfavConfirm}
        title="Retirer des favoris"
        message={`Voulez-vous retirer "${book.title}" de vos favoris ?`}
        onConfirm={confirmUnfav}
        onCancel={() => setShowUnfavConfirm(false)}
      />
    </div>
  );
}



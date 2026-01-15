import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, SVG_PLACEHOLDER } from "../services/imageLoader";

export default function BookCard({ book, onDelete, favorites = [], setFavorites, onAddFavorite, onRemoveFavorite }) {
  const location = useLocation(); // Récupère l'URL actuelle pour passer comme état au Link
  const { role } = useAuth(); // Récupère le rôle de l'utilisateur
  const isCreator = role === 'creator'; // Vérifie si l'utilisateur peut supprimer/modifier

  // Gestion de l'image
  const initial = getImageUrl(book.image); // Récupère l'image ou un placeholder
  const [src, setSrc] = useState(initial); // Stocke l'URL de l'image affichée

  React.useEffect(()=>{
    console.debug("BookCard image resolved:", src, "for book:", book && book.title);
  },[src, book]); // Debug : affiche dans la console quand l'image change

  const handleError = () => {
    // Si l'image ne charge pas, on utilise le placeholder
    if (src !== SVG_PLACEHOLDER) {
      console.warn(`[BookCard] Image load failed, using placeholder for: ${book.title}`);
      setSrc(SVG_PLACEHOLDER);
    }
  };

  // Détection des favoris et du sens de lecture
  const isRtl = book && (book.rtl || (book.language && (book.language === 'ar' || book.language === 'العربية'))); // RTL pour arabe
  const isFav = favorites.some((f) => f._id === book._id); // Déjà favori ?

  // State pour modals
  const [showConfirm, setShowConfirm] = useState(false); // Modal suppression
  const [showUnfavConfirm, setShowUnfavConfirm] = useState(false); // Modal retrait favoris

  // Ajouter ou retirer un favori
  const toggleFavorite = (e) => {
    e && e.stopPropagation(); // Empêche le clic de se propager à d'autres éléments

    const exists = favorites.some((f) => f._id === book._id);
    if (exists) {
      // Si déjà favori, afficher modal de confirmation pour le retirer
      return setShowUnfavConfirm(true);
    }

    // Ajouter aux favoris
    if (typeof onAddFavorite === "function") return onAddFavorite(book); // Callback externe si fourni
    if (!setFavorites) return; // Si aucun moyen de mettre à jour le state, sortir

    // Création de l'objet favori
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

    // Met à jour le state local des favoris
    setFavorites((prev = []) => {
      const updated = [...prev, favObject];
      console.log('[BookCard] Added to favorites:', favObject);
      console.log('[BookCard] Total favorites:', updated.length);
      return updated;
    });
  };

  // Suppression d'un livre
  const isManualBook = book._id && book._id.startsWith('m'); // Les livres manuels ne peuvent pas être supprimés
  const canDeleteBook = isCreator && !isManualBook; // Vérifie si suppression autorisée

  const handleDeleteClick = async () => setShowConfirm(true); // Ouvre la modal de suppression
  const confirmDelete = async () => {
    try {
      if (onDelete) onDelete(book._id); // Supprime localement
      await axios.delete(`http://localhost:5000/api/books/${book._id}`); // Supprime côté backend
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Impossible de supprimer le livre. Vérifiez la console.");
    } finally {
      setShowConfirm(false); // Ferme la modal
    }
  };

  // Confirmer le retrait d'un favori
  const confirmUnfav = () => {
    try {
      console.log('[BookCard] Removing from favorites:', book._id);

      // Callback externe si fourni
      if (typeof onRemoveFavorite === "function") {
        onRemoveFavorite(book);
      }

      // Mise à jour locale des favoris
      if (setFavorites) {
        setFavorites((prev = []) => {
          const updated = prev.filter((f) => f._id !== book._id);
          console.log('[BookCard] Favorites after removal:', updated);
          return updated;
        });
      }
    } finally {
      setShowUnfavConfirm(false); // Ferme la modal
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
          onError={handleError} // Placeholder si image ne charge pas
        />

        <div className="overlay">
          <Link className="cta" to={`/books/${book._id}`} state={{ background: location, book }}>
            Voir plus
          </Link>
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

      {/* Modals de confirmation */}
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

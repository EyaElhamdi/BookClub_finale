import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReviewSection.css';

function ReviewSection({ bookId }) {
  const { token } = useAuth(); // Récupère le token pour savoir si l'utilisateur est connecté
  const [reviews, setReviews] = useState([]); // Tous les avis pour ce livre
  const [userReview, setUserReview] = useState(null); // L'avis de l'utilisateur courant
  const [rating, setRating] = useState(0); // Note de l'utilisateur (1 à 5)
  const [comment, setComment] = useState(''); // Commentaire de l'utilisateur
  const [loading, setLoading] = useState(false); // Indique si une requête est en cours
  const [error, setError] = useState(null); // Message d'erreur éventuel
  const [userId, setUserId] = useState(null); // ID de l'utilisateur courant

  // Récupère l'ID utilisateur depuis le localStorage si connecté
  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('userId');
      setUserId(stored);
    }
  }, [token]);

  // Fetch des avis pour ce livre à chaque changement de bookId ou userId
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/book/${bookId}`);
        setReviews(res.data);

        // Cherche si l'utilisateur courant a déjà laissé un avis
        if (userId) {
          const myReview = res.data.find(r => r.userId._id === userId);
          if (myReview) {
            setUserReview(myReview); // Sauvegarde l'avis utilisateur
            setRating(myReview.rating); // Pré-remplit la note
            setComment(myReview.comment); // Pré-remplit le commentaire
          }
        }
      } catch (err) {
        console.error('Erreur fetch avis:', err);
      }
    };
    fetchReviews();
  }, [bookId, userId]);

  // Fonction pour ajouter ou modifier un avis
  const handleSubmitReview = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (!token) {
      setError('Vous devez être connecté');
      return;
    }
    if (!rating) {
      setError('Sélectionnez une note');
      return;
    }

    setLoading(true);
    try {
      // Envoi de l'avis au serveur
      const res = await axios.post(
        'http://localhost:5000/api/reviews',
        { bookId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mise à jour locale de l'avis utilisateur
      setUserReview(res.data);
      setComment(''); // Réinitialise le champ commentaire
      setError(null);

      // Rafraîchit tous les avis du livre pour refléter le changement
      const updated = await axios.get(`http://localhost:5000/api/reviews/book/${bookId}`);
      setReviews(updated.data);
    } catch (err) {
      console.error('Erreur submission avis:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer l'avis de l'utilisateur
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Supprimer cet avis ?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Réinitialise l'état local
      setUserReview(null);
      setRating(0);
      setComment('');

      // Rafraîchit la liste des avis après suppression
      const updated = await axios.get(`http://localhost:5000/api/reviews/book/${bookId}`);
      setReviews(updated.data);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="review-section">
      <h3>📝 Avis et commentaires</h3>

      {/* Formulaire uniquement pour les utilisateurs connectés */}
      {token && (
        <div className="review-form">
          <h4>{userReview ? 'Modifier votre avis' : 'Laisser un avis'}</h4>
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmitReview}>
            {/* Choix de la note avec étoiles */}
            <div className="rating-input">
              <label>Votre note</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${rating >= star ? 'active' : ''}`} // Highlight selon note
                    onClick={() => setRating(star)} // Met à jour la note
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <span className="rating-display">{rating > 0 ? `${rating}/5` : 'Non noté'}</span>
            </div>

            {/* Champ commentaire */}
            <div className="comment-input">
              <label>Commentaire (optionnel)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre opinion..."
                maxLength={2000}
                rows="4"
              />
              <small>{comment.length}/2000</small>
            </div>

            {/* Bouton soumettre */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Envoi...' : userReview ? 'Mettre à jour' : 'Ajouter un avis'}
            </button>

            {/* Bouton supprimer si avis existant */}
            {userReview && (
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDeleteReview(userReview._id)}
              >
                Supprimer mon avis
              </button>
            )}
          </form>
        </div>
      )}

      {/* Message pour les utilisateurs non connectés */}
      {!token && (
        <div className="login-prompt">
          <p>Connectez-vous pour laisser un avis 🔐</p>
        </div>
      )}

      {/* Liste des avis existants */}
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <strong>{review.userId.firstName || 'Anonyme'}</strong>
                <span className="review-rating">⭐ {review.rating}/5</span>
              </div>
              {review.comment && <p className="review-comment">{review.comment}</p>}
              <small className="review-date">
                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
              </small>
            </div>
          ))
        ) : (
          <p className="no-reviews">Aucun avis pour le moment. Soyez le premier! 📖</p>
        )}
      </div>
    </div>
  );
}

export default ReviewSection;

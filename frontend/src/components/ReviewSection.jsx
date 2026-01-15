import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReviewSection.css';

function ReviewSection({ bookId }) {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Récupérer l'ID de l'utilisateur
  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('userId');
      setUserId(stored);
    }
  }, [token]);

  // Fetch les avis du livre
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/book/${bookId}`);
        setReviews(res.data);
        
        // Chercher l'avis de l'utilisateur courant
        if (userId) {
          const myReview = res.data.find(r => r.userId._id === userId);
          if (myReview) {
            setUserReview(myReview);
            setRating(myReview.rating);
            setComment(myReview.comment);
          }
        }
      } catch (err) {
        console.error('Erreur fetch avis:', err);
      }
    };
    fetchReviews();
  }, [bookId, userId]);

  // Soumettre un avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
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
      const res = await axios.post(
        'http://localhost:5000/api/reviews',
        { bookId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour la liste
      setUserReview(res.data);
      setComment('');
      setError(null);
      
      // Rafraîchir les avis
      const updated = await axios.get(`http://localhost:5000/api/reviews/book/${bookId}`);
      setReviews(updated.data);
    } catch (err) {
      console.error('Erreur submission avis:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un avis
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Supprimer cet avis ?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserReview(null);
      setRating(0);
      setComment('');
      
      // Rafraîchir
      const updated = await axios.get(`http://localhost:5000/api/reviews/book/${bookId}`);
      setReviews(updated.data);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="review-section">
      <h3>📝 Avis et commentaires</h3>

      {token && (
        <div className="review-form">
          <h4>{userReview ? 'Modifier votre avis' : 'Laisser un avis'}</h4>
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmitReview}>
            <div className="rating-input">
              <label>Votre note</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <span className="rating-display">{rating > 0 ? `${rating}/5` : 'Non noté'}</span>
            </div>

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

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Envoi...' : userReview ? 'Mettre à jour' : 'Ajouter un avis'}
            </button>

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

      {!token && (
        <div className="login-prompt">
          <p>Connectez-vous pour laisser un avis 🔐</p>
        </div>
      )}

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

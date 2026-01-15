import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ReadingStats.css';

function ReadingStats({ userId }) {
  // 🔹 État des statistiques
  const [stats, setStats] = useState({
    toRead: 0,       // livres à lire
    reading: 0,      // livres en cours
    completed: 0,    // livres terminés
    avgRating: 0,    // note moyenne
    reviews: 0,      // nombre d'avis
  });
  const [loading, setLoading] = useState(true); // état de chargement

  // 🔹 Fonction pour récupérer les stats depuis l'API
  const fetchStats = async () => {
    try {
      // Récupère l'historique de lecture
      const historyRes = await axios.get('http://localhost:5000/api/reading-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Récupère les avis de l'utilisateur
      const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/user/${userId}`);

      const history = historyRes.data || [];
      const reviews = reviewsRes.data || [];

      // Calcul des différents états
      const toRead = history.filter(h => h.status === 'à-lire').length;
      const reading = history.filter(h => h.status === 'en-cours').length;
      const completed = history.filter(h => h.status === 'lu').length;

      // Calcul de la note moyenne
      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      // Mise à jour de l'état
      setStats({
        toRead,
        reading,
        completed,
        avgRating,
        reviews: reviews.length,
      });
    } catch (err) {
      console.error('Erreur fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Premier fetch au montage du composant
  useEffect(() => {
    fetchStats();
  }, [userId]);

  // 🔹 Rafraîchissement périodique et quand l'utilisateur revient sur la page
  useEffect(() => {
    // Re-fetch si l'onglet devient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };

    // Re-fetch toutes les 3 secondes pour rester à jour
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);

  // 🔹 Affichage en chargement
  if (loading) return <div className="reading-stats">Chargement...</div>;

  return (
    <div className="reading-stats">
      <h3>📊 Mes statistiques de lecture</h3>

      {/* 🔹 Grille de statistiques */}
      <div className="stats-grid">
        {/* À lire */}
        <div className="stat-card">
          <div className="stat-icon">📌</div>
          <div className="stat-content">
            <div className="stat-number">{stats.toRead}</div>
            <div className="stat-label">À lire</div>
          </div>
        </div>

        {/* En cours */}
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-number">{stats.reading}</div>
            <div className="stat-label">En cours</div>
          </div>
        </div>

        {/* Terminés */}
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Terminés</div>
          </div>
        </div>

        {/* Note moyenne */}
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{stats.avgRating}</div>
            <div className="stat-label">Note moyenne</div>
          </div>
        </div>

        {/* Nombre d'avis */}
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-number">{stats.reviews}</div>
            <div className="stat-label">Avis</div>
          </div>
        </div>
      </div>

      {/* 🔹 Barre de progression */}
      <div className="progress-bar">
        <h4>Progression totale</h4>
        <div className="progress-container">
          {stats.toRead > 0 && (
            <div className="progress-segment to-read" title={`À lire: ${stats.toRead}`}></div>
          )}
          {stats.reading > 0 && (
            <div className="progress-segment reading" title={`En cours: ${stats.reading}`}></div>
          )}
          {stats.completed > 0 && (
            <div className="progress-segment completed" title={`Terminés: ${stats.completed}`}></div>
          )}
        </div>

        {/* 🔹 Légende */}
        <div className="legend">
          <span><span className="legend-color to-read-color"></span> À lire</span>
          <span><span className="legend-color reading-color"></span> En cours</span>
          <span><span className="legend-color completed-color"></span> Terminés</span>
        </div>
      </div>
    </div>
  );
}

export default ReadingStats;

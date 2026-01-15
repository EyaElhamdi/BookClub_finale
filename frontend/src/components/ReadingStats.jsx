import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ReadingStats.css';

function ReadingStats({ userId }) {
  const [stats, setStats] = useState({
    toRead: 0,
    reading: 0,
    completed: 0,
    avgRating: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch reading history
      const historyRes = await axios.get('http://localhost:5000/api/reading-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Fetch reviews
      const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/user/${userId}`);

      const history = historyRes.data || [];
      const reviews = reviewsRes.data || [];

      // Calculer les stats
      const toRead = history.filter(h => h.status === 'à-lire').length;
      const reading = history.filter(h => h.status === 'en-cours').length;
      const completed = history.filter(h => h.status === 'lu').length;

      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

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

  // Fetch initial stats
  useEffect(() => {
    fetchStats();
  }, [userId]);

  // Refetch stats when page becomes visible (user returns from BookDetails)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };

    // Refetch every 3 seconds to stay in sync
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);

  if (loading) return <div className="reading-stats">Chargement...</div>;

  return (
    <div className="reading-stats">
      <h3>📊 Mes statistiques de lecture</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📌</div>
          <div className="stat-content">
            <div className="stat-number">{stats.toRead}</div>
            <div className="stat-label">À lire</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-number">{stats.reading}</div>
            <div className="stat-label">En cours</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Terminés</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{stats.avgRating}</div>
            <div className="stat-label">Note moyenne</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-number">{stats.reviews}</div>
            <div className="stat-label">Avis</div>
          </div>
        </div>
      </div>

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

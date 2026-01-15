import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReadingStatus.css';

function ReadingStatus({ bookId }) {
  const { token } = useAuth();
  const [status, setStatus] = useState(null);
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch le statut du livre
  useEffect(() => {
    if (!token) return;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/reading-history/book/${bookId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data) {
          setEntry(res.data);
          setStatus(res.data.status);
          setStartDate(res.data.startDate ? res.data.startDate.split('T')[0] : '');
          setEndDate(res.data.endDate ? res.data.endDate.split('T')[0] : '');
        }
      } catch (err) {
        console.error('Erreur fetch status:', err);
      }
    };
    fetchStatus();
  }, [bookId, token]);

  // Mettre à jour le statut
  const handleStatusChange = async (newStatus) => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/reading-history',
        {
          bookId,
          status: newStatus,
          startDate: newStatus === 'en-cours' && startDate ? startDate : entry?.startDate,
          endDate: newStatus === 'lu' && endDate ? endDate : entry?.endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEntry(res.data);
      setStatus(res.data.status);
      setShowForm(false);
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer du suivi
  const handleRemove = async () => {
    if (!entry || !window.confirm('Supprimer ce livre de votre historique ?')) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/reading-history/${entry._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEntry(null);
      setStatus(null);
      setStartDate('');
      setEndDate('');
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  if (!token) {
    return <div className="reading-status login-msg">Connectez-vous pour tracker votre lecture 📚</div>;
  }

  const statusLabels = {
    'à-lire': '📌 À lire',
    'en-cours': '📖 En cours',
    'lu': '✅ Terminé',
  };

  return (
    <div className="reading-status">
      <h4>Statut de lecture</h4>

      <div className="status-buttons">
        {['à-lire', 'en-cours', 'lu'].map((s) => (
          <button
            key={s}
            className={`status-btn ${status === s ? 'active' : ''}`}
            onClick={() => handleStatusChange(s)}
            disabled={loading}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {status && (
        <>
          <div className="dates-info">
            {status === 'en-cours' && entry?.startDate && (
              <p>🚀 Commencé: {new Date(entry.startDate).toLocaleDateString('fr-FR')}</p>
            )}
            {status === 'lu' && entry?.endDate && (
              <p>✓ Terminé: {new Date(entry.endDate).toLocaleDateString('fr-FR')}</p>
            )}
          </div>

          <button
            className="edit-dates-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Fermer' : '📅 Ajouter les dates'}
          </button>

          {showForm && (
            <div className="date-form">
              {status === 'en-cours' && (
                <div className="date-field">
                  <label>Date de début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              )}

              {status === 'lu' && (
                <>
                  <div className="date-field">
                    <label>Date de début</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="date-field">
                    <label>Date de fin</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button
                className="save-dates-btn"
                onClick={() => handleStatusChange(status)}
                disabled={loading}
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          )}

          <button className="remove-btn" onClick={handleRemove}>
            Retirer du suivi
          </button>
        </>
      )}
    </div>
  );
}

export default ReadingStatus;

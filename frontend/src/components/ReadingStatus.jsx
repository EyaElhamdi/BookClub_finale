import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReadingStatus.css';

function ReadingStatus({ bookId }) {
  const { token } = useAuth(); // 🔹 Token pour les requêtes authentifiées
  const [status, setStatus] = useState(null); // 🔹 Statut actuel du livre
  const [entry, setEntry] = useState(null);   // 🔹 L'entrée complète dans l'historique
  const [loading, setLoading] = useState(false); // 🔹 Indique si une requête est en cours
  const [showForm, setShowForm] = useState(false); // 🔹 Affiche le formulaire de dates
  const [startDate, setStartDate] = useState('');  // 🔹 Date de début
  const [endDate, setEndDate] = useState('');      // 🔹 Date de fin

  // 🔹 Récupérer le statut du livre depuis l'API au montage
  useEffect(() => {
    if (!token) return; // 🔹 Pas de fetch si l'utilisateur n'est pas connecté

    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/reading-history/book/${bookId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data) {
          setEntry(res.data);                  // stocke l'entrée complète
          setStatus(res.data.status);          // statut actuel
          setStartDate(res.data.startDate ? res.data.startDate.split('T')[0] : ''); // format yyyy-mm-dd
          setEndDate(res.data.endDate ? res.data.endDate.split('T')[0] : '');
        }
      } catch (err) {
        console.error('Erreur fetch status:', err);
      }
    };

    fetchStatus();
  }, [bookId, token]);

  // 🔹 Mettre à jour le statut du livre (à-lire, en-cours, lu)
  const handleStatusChange = async (newStatus) => {
    if (!token) return;

    setLoading(true); // indique que la requête est en cours
    try {
      const res = await axios.post(
        'http://localhost:5000/api/reading-history',
        {
          bookId,
          status: newStatus,
          // Dates selon le statut
          startDate: newStatus === 'en-cours' && startDate ? startDate : entry?.startDate,
          endDate: newStatus === 'lu' && endDate ? endDate : entry?.endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mise à jour locale après succès
      setEntry(res.data);
      setStatus(res.data.status);
      setShowForm(false); // ferme le formulaire
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Supprimer le livre de l'historique
  const handleRemove = async () => {
    if (!entry || !window.confirm('Supprimer ce livre de votre historique ?')) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/reading-history/${entry._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Réinitialise l'état local
      setEntry(null);
      setStatus(null);
      setStartDate('');
      setEndDate('');
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  // 🔹 Message si non connecté
  if (!token) {
    return <div className="reading-status login-msg">Connectez-vous pour tracker votre lecture 📚</div>;
  }

  // 🔹 Labels pour l'affichage des statuts
  const statusLabels = {
    'à-lire': '📌 À lire',
    'en-cours': '📖 En cours',
    'lu': '✅ Terminé',
  };

  return (
    <div className="reading-status">
      <h4>Statut de lecture</h4>

      {/* 🔹 Boutons de statut */}
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

      {/* 🔹 Informations et options selon le statut */}
      {status && (
        <>
          {/* Dates */}
          <div className="dates-info">
            {status === 'en-cours' && entry?.startDate && (
              <p>🚀 Commencé: {new Date(entry.startDate).toLocaleDateString('fr-FR')}</p>
            )}
            {status === 'lu' && entry?.endDate && (
              <p>✓ Terminé: {new Date(entry.endDate).toLocaleDateString('fr-FR')}</p>
            )}
          </div>

          {/* Bouton pour afficher/fermer le formulaire de dates */}
          <button
            className="edit-dates-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Fermer' : '📅 Ajouter les dates'}
          </button>

          {/* Formulaire pour modifier les dates */}
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

          {/* Bouton pour retirer le livre du suivi */}
          <button className="remove-btn" onClick={handleRemove}>
            Retirer du suivi
          </button>
        </>
      )}
    </div>
  );
}

export default ReadingStatus;

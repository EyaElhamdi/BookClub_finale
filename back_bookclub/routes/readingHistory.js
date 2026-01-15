import express from 'express';
import ReadingHistory from '../models/ReadingHistory.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET historique de lecture de l'utilisateur
router.get('/', verifyToken, async (req, res) => {
  try {
    const history = await ReadingHistory.find({ userId: req.userId })
      .sort({ updatedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
  }
});

// GET un livre spécifique dans l'historique
router.get('/book/:bookId', verifyToken, async (req, res) => {
  try {
    const entry = await ReadingHistory.findOne({
      userId: req.userId,
      bookId: req.params.bookId,
    });
    res.json(entry || null);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
});

// POST ajouter/mettre à jour le statut de lecture
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookId, status, startDate, endDate, rating } = req.body;

    if (!bookId || !status) {
      return res.status(400).json({ message: 'bookId et status obligatoires' });
    }

    if (!['à-lire', 'en-cours', 'lu'].includes(status)) {
      return res.status(400).json({ message: 'Status invalide' });
    }

    // Chercher l'entrée existante
    let entry = await ReadingHistory.findOne({ userId: req.userId, bookId });

    if (entry) {
      entry.status = status;
      // Only set dates if status is en-cours or lu
      if (status === 'en-cours' || status === 'lu') {
        if (startDate) entry.startDate = new Date(startDate);
        if (endDate && status === 'lu') entry.endDate = new Date(endDate);
      } else if (status === 'à-lire') {
        // Clear dates if back to à-lire
        entry.startDate = undefined;
        entry.endDate = undefined;
      }
      if (rating) entry.rating = rating;
      entry.updatedAt = new Date();
    } else {
      entry = new ReadingHistory({
        userId: req.userId,
        bookId,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        rating: rating || null,
      });
    }

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Erreur création historique:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// DELETE supprimer un livre de l'historique
router.delete('/:historyId', verifyToken, async (req, res) => {
  try {
    const entry = await ReadingHistory.findById(req.params.historyId);

    if (!entry) {
      return res.status(404).json({ message: 'Entrée non trouvée' });
    }

    if (entry.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await ReadingHistory.findByIdAndDelete(req.params.historyId);
    res.json({ message: 'Entrée supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

export default router;

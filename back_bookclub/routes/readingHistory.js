import express from 'express';
import ReadingHistory from '../models/ReadingHistory.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/* =========================
   GET ALL READING HISTORY
   Récupère tout l'historique de lecture de l'utilisateur connecté
========================= */
router.get('/', verifyToken, async (req, res) => {
  try {
    // On récupère toutes les entrées pour l'utilisateur et on trie par date de mise à jour décroissante
    const history = await ReadingHistory.find({ userId: req.userId })
      .sort({ updatedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
  }
});

/* =========================
   GET SPECIFIC BOOK HISTORY
   Récupère une entrée spécifique dans l'historique pour un livre donné
========================= */
router.get('/book/:bookId', verifyToken, async (req, res) => {
  try {
    const entry = await ReadingHistory.findOne({
      userId: req.userId,
      bookId: req.params.bookId,
    });
    // Si aucune entrée, renvoyer null
    res.json(entry || null);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
});

/* =========================
   ADD OR UPDATE READING HISTORY
   Crée une nouvelle entrée ou met à jour le statut d'un livre dans l'historique
========================= */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookId, status, startDate, endDate, rating } = req.body;

    // Vérification des champs obligatoires
    if (!bookId || !status) {
      return res.status(400).json({ message: 'bookId et status obligatoires' });
    }

    // Vérification que le statut est valide
    if (!['à-lire', 'en-cours', 'lu'].includes(status)) {
      return res.status(400).json({ message: 'Status invalide' });
    }

    // Cherche si une entrée existe déjà pour cet utilisateur et ce livre
    let entry = await ReadingHistory.findOne({ userId: req.userId, bookId });

    if (entry) {
      // Mise à jour des champs existants
      entry.status = status;

      // Gestion des dates selon le statut
      if (status === 'en-cours' || status === 'lu') {
        if (startDate) entry.startDate = new Date(startDate);
        if (endDate && status === 'lu') entry.endDate = new Date(endDate);
      } else if (status === 'à-lire') {
        // Réinitialise les dates si on revient à "à-lire"
        entry.startDate = undefined;
        entry.endDate = undefined;
      }

      if (rating) entry.rating = rating;
      entry.updatedAt = new Date();
    } else {
      // Création d'une nouvelle entrée
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

/* =========================
   DELETE HISTORY ENTRY
   Supprime un livre de l'historique de lecture
========================= */
router.delete('/:historyId', verifyToken, async (req, res) => {
  try {
    const entry = await ReadingHistory.findById(req.params.historyId);

    if (!entry) {
      return res.status(404).json({ message: 'Entrée non trouvée' });
    }

    // Vérifie que l'utilisateur connecté est bien le propriétaire de l'entrée
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

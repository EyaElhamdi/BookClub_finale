import express from "express";
import Book from "../models/Book.js";
import Review from "../models/Review.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   GET REVIEWS BY BOOK
   Récupère tous les avis pour un livre donné
========================= */
router.get("/book/:bookId", async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate("userId", "firstName email") // Remplace userId par prénom et email
      .sort({ createdAt: -1 }); // Tri du plus récent au plus ancien
    res.json(reviews);
  } catch (err) {
    console.error('Erreur fetch reviews:', err);
    // En cas d'erreur, on renvoie un tableau vide
    res.json([]);
  }
});

/* =========================
   GET REVIEWS BY USER
   Récupère tous les avis écrits par un utilisateur donné
========================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des avis" });
  }
});

/* =========================
   POST CREATE OR UPDATE REVIEW
   Crée un nouvel avis ou met à jour l'avis existant pour un utilisateur et un livre
========================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;

    console.log('POST avis - bookId:', bookId, 'type:', typeof bookId, 'rating:', rating);

    // Vérification des champs obligatoires
    if (!bookId || !rating) {
      return res.status(400).json({ message: "bookId et rating obligatoires" });
    }

    // Vérification que la note est valide (1 à 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "La note doit être entre 1 et 5" });
    }

    // Cherche si un avis existe déjà pour ce livre et cet utilisateur
    let review = await Review.findOne({ bookId, userId: req.userId });

    if (review) {
      // Mise à jour de l'avis existant
      review.rating = rating;
      review.comment = comment || "";
      review.updatedAt = new Date();
    } else {
      // Création d'un nouvel avis
      review = new Review({
        bookId,
        userId: req.userId,
        rating,
        comment: comment || "",
      });
    }

    await review.save();

    // Pour la réponse, on "populate" les infos utilisateur
    const populatedReview = await Review.findById(review._id).populate('userId', 'firstName email');
    res.status(201).json(populatedReview);
  } catch (err) {
    console.error("Erreur création avis:", err);
    // Gestion spécifique des erreurs d'ObjectId invalide
    if (err.message && err.message.includes('Cast to ObjectId')) {
      return res.status(400).json({ message: "ID de livre invalide" });
    }
    res.status(500).json({ message: "Erreur lors de la création de l'avis" });
  }
});

/* =========================
   DELETE REVIEW
   Supprime un avis existant (seul l'auteur peut supprimer)
========================= */
router.delete("/:reviewId", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    // Vérifie que l'utilisateur connecté est bien l'auteur de l'avis
    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: "Avis supprimé" });
  } catch (err) {
    // Gestion des erreurs d'ObjectId invalide
    if (err.message && err.message.includes('Cast to ObjectId')) {
      return res.status(400).json({ message: "ID d'avis invalide" });
    }
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});

export default router;

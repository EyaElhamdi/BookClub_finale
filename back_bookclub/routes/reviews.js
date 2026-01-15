import express from "express";
import Book from "../models/Book.js";
import Review from "../models/Review.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET avis d'un livre
router.get("/book/:bookId", async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate("userId", "firstName email")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    // Gracefully handle any errors
    console.error('Erreur fetch reviews:', err);
    res.json([]);
  }
});

// GET avis d'un utilisateur
router.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des avis" });
  }
});

// POST créer/mettre à jour un avis
router.post("/", verifyToken, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;

    console.log('POST avis - bookId:', bookId, 'type:', typeof bookId, 'rating:', rating);

    if (!bookId || !rating) {
      return res.status(400).json({ message: "bookId et rating obligatoires" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "La note doit être entre 1 et 5" });
    }

    // Chercher si l'avis existe déjà
    let review = await Review.findOne({ bookId, userId: req.userId });

    if (review) {
      // Mettre à jour
      review.rating = rating;
      review.comment = comment || "";
      review.updatedAt = new Date();
    } else {
      // Créer
      review = new Review({
        bookId,
        userId: req.userId,
        rating,
        comment: comment || "",
      });
    }

    await review.save();
    // Populate userId information for response
    const populatedReview = await Review.findById(review._id).populate('userId', 'firstName email');
    res.status(201).json(populatedReview);
  } catch (err) {
    console.error("Erreur création avis:", err);
    // Check if it's an ObjectId casting error
    if (err.message && err.message.includes('Cast to ObjectId')) {
      return res.status(400).json({ message: "ID de livre invalide" });
    }
    res.status(500).json({ message: "Erreur lors de la création de l'avis" });
  }
});

// DELETE un avis
router.delete("/:reviewId", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: "Avis supprimé" });
  } catch (err) {
    if (err.message && err.message.includes('Cast to ObjectId')) {
      return res.status(400).json({ message: "ID d'avis invalide" });
    }
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});

export default router;

import express from "express";
import Book from "../models/Book.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { body, validationResult } from "express-validator";
import { verifyToken, requireCreatorRole } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   GET ALL BOOKS
========================= */
router.get("/", async (req, res) => {
  try {
    // Récupère tous les livres et les trie par date de création décroissante
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ADD BOOK
========================= */
router.post(
  "/",
  verifyToken,          // Vérifie que l'utilisateur est connecté
  requireCreatorRole,   // Vérifie que l'utilisateur a le rôle "creator"
  [
    // Validation des champs obligatoires
    body("title").notEmpty().withMessage("Title required"),
    body("author").notEmpty().withMessage("Author required"),
  ],
  async (req, res) => {
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });

    try {
      // Récupération des champs du corps de la requête
      const { title, author, rating, image, teaser, buyLink, excerpt, year, pages, publisher, isbn, genres, longDescription } = req.body;

      // Création du livre dans la base avec l'utilisateur courant
      const book = await Book.create({
        title,
        author,
        rating,
        image,
        teaser,
        buyLink,
        excerpt,
        year,
        pages,
        publisher,
        isbn,
        genres,
        longDescription,
        user: req.userId, // Lien vers l'utilisateur qui crée le livre
      });

      res.status(201).json(book);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* =========================
   DELETE BOOK
========================= */
router.delete("/:id", verifyToken, requireCreatorRole, async (req, res) => {
  try {
    // Ne pas permettre de supprimer les livres manuels (ID commençant par "m")
    if (req.params.id.startsWith("m")) {
      return res.status(403).json({ message: "Impossible de supprimer ce livre" });
    }

    // Vérifier que l'ID est un ObjectId valide avant requête
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Livre introuvable" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    // Suppression du livre
    await Book.findByIdAndDelete(req.params.id);

    // Création d'un log d'audit pour la suppression
    try {
      await AuditLog.create({ 
        actor: req.userId, 
        action: 'delete_book', 
        targetType: 'book', 
        targetId: req.params.id, 
        meta: { title: book.title } 
      });
    } catch (e) { 
      console.warn('Audit create failed', e?.message || e); 
    }

    res.json({ message: "Livre supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE BOOK
========================= */
router.put("/:id", verifyToken, requireCreatorRole, async (req, res) => {
  try {
    // Ne pas permettre de modifier les livres manuels
    if (req.params.id.startsWith("m")) {
      return res.status(403).json({ message: "Impossible de modifier ce livre" });
    }

    // Vérifier que l'ID est un ObjectId valide
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Livre introuvable" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    // Récupération des champs à mettre à jour
    const { title, author, rating, image, teaser, buyLink, excerpt, year, pages, publisher, isbn, genres, longDescription } = req.body;
    const updates = { title, author, rating, image, teaser, buyLink, excerpt, year, pages, publisher, isbn, longDescription };
    if (genres) updates.genres = genres;

    // Mise à jour du livre et récupération du document mis à jour
    const updated = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });

    // Log d'audit pour la mise à jour
    try {
      await AuditLog.create({ 
        actor: req.userId, 
        action: 'update_book', 
        targetType: 'book', 
        targetId: updated._id, 
        meta: { changes: updates } 
      });
    } catch (e) { 
      console.warn('Audit create failed', e?.message || e); 
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET BOOK BY ID
========================= */
router.get("/:id", async (req, res) => {
  try {
    // Si l'ID commence par "m", c'est un livre manuel → pas dans MongoDB
    if (req.params.id.startsWith("m")) {
      return res.status(404).json({ message: "Livre introuvable" });
    }

    // Vérification que l'ID est un ObjectId valide
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Livre introuvable" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

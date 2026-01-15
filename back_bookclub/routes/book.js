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
  verifyToken,
  requireCreatorRole,
  [
    body("title").notEmpty().withMessage("Title required"),
    body("author").notEmpty().withMessage("Author required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, author, rating, image, teaser, buyLink, excerpt, year, pages, publisher, isbn, genres, longDescription } = req.body;

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
        user: req.userId,
      });

      res.status(201).json(book);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
router.delete("/:id", verifyToken, requireCreatorRole, async (req, res) => {
  try {
    // Ne pas permettre de supprimer les livres manuels
    if (req.params.id.startsWith("m")) {
      return res.status(403).json({ message: "Impossible de supprimer ce livre" });
    }

    // Vérifier que l'ID est un ObjectId valide
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Livre introuvable" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    await Book.findByIdAndDelete(req.params.id);

    // audit
    try {
      await AuditLog.create({ actor: req.userId, action: 'delete_book', targetType: 'book', targetId: req.params.id, meta: { title: book.title } });
    } catch (e) { console.warn('Audit create failed', e?.message || e); }

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

    const { title, author, rating, image, teaser, buyLink, excerpt, year, pages, publisher, isbn, genres, longDescription } = req.body;
    const updates = { title, author, rating, image, teaser, buyLink, excerpt, year, pages, publisher, isbn, longDescription };
    if (genres) updates.genres = genres;

    const updated = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
    // audit
    try {
      await AuditLog.create({ actor: req.userId, action: 'update_book', targetType: 'book', targetId: updated._id, meta: { changes: updates } });
    } catch (e) { console.warn('Audit create failed', e?.message || e); }
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
    // Si l'ID commence par "m", c'est un livre manuel (ne pas queryier MongoDB)
    if (req.params.id.startsWith("m")) {
      return res.status(404).json({ message: "Livre introuvable" });
    }

    // Vérifier que l'ID est un ObjectId valide avant de faire une requête
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

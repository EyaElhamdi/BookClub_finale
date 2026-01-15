import express from "express";
import User from "../models/User.js";
import Book from "../models/Book.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get current user's favorites (requires auth)
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favorites");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a favorite: if _id provided, push book id; otherwise create a Book then push
router.post("/", verifyToken, async (req, res) => {
  try {
    const { _id, title, author, image } = req.body;

    let bookId = _id;
    if (!bookId) {
      const created = await Book.create({ title, author, image });
      bookId = created._id;
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (!user.favorites) user.favorites = [];
    if (!user.favorites.some((f) => String(f) === String(bookId))) {
      user.favorites.push(bookId);
      await user.save();
    }

    const populated = await User.findById(req.userId).populate("favorites");
    res.status(201).json(populated.favorites.pop());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove favorite by book id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.favorites = (user.favorites || []).filter((f) => String(f) !== String(id));
    await user.save();
    res.json({ message: "Favori supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

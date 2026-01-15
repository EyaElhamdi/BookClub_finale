import express from "express";
import User from "../models/User.js";
import Book from "../models/Book.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   GET USER FAVORITES
   Récupère la liste des favoris de l'utilisateur connecté
========================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    // Récupère l'utilisateur et "populate" les favoris pour avoir les infos complètes des livres
    const user = await User.findById(req.userId).populate("favorites");

    if (!user) 
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Renvoie la liste des favoris (vide si aucun)
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ADD FAVORITE
   Ajoute un livre aux favoris de l'utilisateur
   - si _id fourni → ajoute le livre existant
   - sinon → crée un nouveau livre puis ajoute son _id
========================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { _id, title, author, image } = req.body;

    let bookId = _id;

    // Si aucun _id fourni, création d'un nouveau livre
    if (!bookId) {
      const created = await Book.create({ title, author, image });
      bookId = created._id;
    }

    const user = await User.findById(req.userId);
    if (!user) 
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Initialisation de favorites si vide
    if (!user.favorites) user.favorites = [];

    // Ajoute le livre seulement s'il n'existe pas déjà dans les favoris
    if (!user.favorites.some((f) => String(f) === String(bookId))) {
      user.favorites.push(bookId);
      await user.save();
    }

    // Récupère à nouveau l'utilisateur avec favorites "populés" pour renvoyer l'objet complet
    const populated = await User.findById(req.userId).populate("favorites");

    // Renvoie uniquement le dernier favori ajouté
    res.status(201).json(populated.favorites.pop());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   REMOVE FAVORITE
   Supprime un livre des favoris de l'utilisateur par book id
========================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.userId);
    if (!user) 
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Filtre les favoris pour retirer le livre correspondant à l'id
    user.favorites = (user.favorites || []).filter((f) => String(f) !== String(id));
    await user.save();

    res.json({ message: "Favori supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import AuditLog from "../models/AuditLog.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ---------------------------- REGISTER ---------------------------- */
router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("Prénom requis"),
    body("lastName").notEmpty().withMessage("Nom requis"),
    body("email").isEmail().withMessage("Email invalide"),
    body("password").isLength({ min: 6 }).withMessage("Mot de passe trop court"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { firstName, lastName, email, password, address, city, state, role } = req.body;

      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email déjà utilisé" });

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashed,
        address,
        city,
        state,
        role: role || "user",
      });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(201).json({ message: "Compte créé avec succès", token, role: user.role });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* ---------------------------- LOGIN ---------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------- GET PROFILE ---------------------------- */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------- UPDATE PROFILE ---------------------------- */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, email, address, city, state, password } = req.body;

    const updates = { firstName, lastName, email, address, city, state };

    // si changement de mot de passe
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true })
      .select("-password");

    // record audit log for profile updates (non-sensitive fields only)
    try {
      await AuditLog.create({ actor: req.userId, action: 'update_profile', targetType: 'user', targetId: req.userId, meta: { changes: updates } });
    } catch (e) { console.warn('Audit create failed', e?.message || e); }

    res.json({ message: "Profil mis à jour", user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------- GENERATE AVATAR ---------------------------- */
router.post('/profile/generate-avatar', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // simple SVG initials avatar
    const initials = `${(user.firstName || '').charAt(0)}${(user.lastName || '').charAt(0)}`.toUpperCase() || 'U';
    const bg = '#f8d7e0';
    const fg = '#6b4754';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='.07em' font-family='Arial, Helvetica, sans-serif' font-size='96' font-weight='700' text-anchor='middle' fill='${fg}'>${initials}</text></svg>`;
    const dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

    user.avatar = dataUrl;
    await user.save();

    // audit
    try { await AuditLog.create({ actor: req.userId, action: 'generate_avatar', targetType: 'user', targetId: req.userId, meta: { initials } }); } catch (e) { console.warn('Audit create failed', e?.message || e); }

    res.json({ message: 'Avatar généré', avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------- ADMIN : GET AUDIT LOGS ---------------------------- */
router.get('/audit', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const entries = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------- ADMIN : GET ALL USERS ---------------------------- */
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------- ADMIN : CREATE USER ---------------------------- */
router.post("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role
    });

    res.status(201).json({ user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------- ADMIN : DELETE USER ---------------------------- */
router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    await User.findByIdAndDelete(req.params.id);

    // audit
    try {
      await AuditLog.create({ actor: req.userId, action: 'delete_user', targetType: 'user', targetId: req.params.id, meta: { email: user.email } });
    } catch (e) { console.warn('Audit create failed', e?.message || e); }

    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------- ADMIN : UPDATE USER ---------------------------- */
router.put("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, role, password } = req.body;
    const updates = { firstName, lastName, email, role };

    // handle optional password update
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.password = hashed;
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    // record audit log
    try {
      await AuditLog.create({ actor: req.userId, action: 'update_user', targetType: 'user', targetId: user._id, meta: { changes: updates } });
    } catch (e) {
      console.warn('Audit log failed', e?.message || e);
    }
    res.json({ message: "Utilisateur mis à jour", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


















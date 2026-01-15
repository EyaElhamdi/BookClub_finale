import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.userId = decoded.id;
    next();
  });
};

export const verifyAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  if (user.role !== "admin")
    return res.status(403).json({ message: "Accès refusé" });

  next();
};

export const requireCreatorRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'creator') {
      return res.status(403).json({ message: "Seuls les créateurs peuvent effectuer cette action" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};






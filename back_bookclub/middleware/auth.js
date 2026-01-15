import jwt from "jsonwebtoken"; 
// Librairie utilisée pour gérer les tokens JWT (authentification)

import User from "../models/User.js"; 
// Modèle User (MongoDB / Mongoose) pour accéder à la base de données


// Middleware qui vérifie si le token existe et s'il est valide
export const verifyToken = (req, res, next) => {

  // On récupère le header "authorization" envoyé dans la requête
  const authHeader = req.headers.authorization;

  // Si aucun token n'est fourni → accès refusé
  if (!authHeader) 
    return res.status(401).json({ message: "Token manquant" });

  // Le token est généralement sous la forme : "Bearer TOKEN"
  // On prend seulement la partie TOKEN
  const token = authHeader.split(" ")[1];

  // On vérifie si le token est valide avec la clé secrète
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    // Si le token est faux ou expiré
    if (err) 
      return res.status(403).json({ message: "Token invalide" });

    // Si tout est bon, on récupère l'id de l'utilisateur depuis le token
    req.userId = decoded.id;

    // On autorise la requête à continuer vers la route suivante
    next();
  });
};


// Middleware qui vérifie si l'utilisateur est un admin
export const verifyAdmin = async (req, res, next) => {

  // On cherche l'utilisateur dans la base avec son id (déjà récupéré depuis le token)
  const user = await User.findById(req.userId);

  // Si l'utilisateur n'existe pas
  if (!user) 
    return res.status(404).json({ message: "Utilisateur non trouvé" });

  // Si son rôle n'est pas "admin"
  if (user.role !== "admin")
    return res.status(403).json({ message: "Accès refusé" });

  // Sinon → accès autorisé
  next();
};


// Middleware qui vérifie si l'utilisateur a le rôle "creator"
export const requireCreatorRole = async (req, res, next) => {
  try {

    // On récupère l'utilisateur depuis la base
    const user = await User.findById(req.userId);

    // Si utilisateur inexistant OU rôle différent de "creator"
    if (!user || user.role !== 'creator') {
      return res.status(403).json({ 
        message: "Seuls les créateurs peuvent effectuer cette action" 
      });
    }

    // Si tout est bon → on continue
    next();

  } catch (err) {
    // En cas d'erreur serveur (problème DB, etc.)
    res.status(500).json({ message: err.message });
  }
};

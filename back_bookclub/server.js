import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// Import des routes
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/book.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config(); // Chargement des variables d'environnement

const app = express();

/* =========================
   MIDDLEWARES GÉNÉRAUX
========================= */
app.use(helmet());            // Sécurise les headers HTTP
app.use(express.json());      // Parse le JSON des requêtes
app.use(cors());              // Active le CORS
app.use(morgan("combined"));  // Logger des requêtes HTTP

/* =========================
   RATE LIMITING
   Limite le nombre de requêtes pour éviter les abus
========================= */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 150,            // max 150 requêtes par IP
});
app.use(limiter);

/* =========================
   ROUTES
========================= */
app.use("/auth", authRoutes);           // Routes d'authentification
app.use("/api/books", bookRoutes);      // Routes de gestion des livres

// Import dynamique pour certains modules afin d'éviter les problèmes de circular dependencies
app.use("/api/favorites", (await import('./routes/favorites.js')).default);
app.use("/api/reviews", (await import('./routes/reviews.js')).default);
app.use("/api/reading-history", (await import('./routes/readingHistory.js')).default);

/* =========================
   MIDDLEWARE GESTION D'ERREURS
   Centralise toutes les erreurs
========================= */
app.use(errorHandler);

/* =========================
   CONNECTION À MONGODB ET LANCEMENT DU SERVEUR
========================= */
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connecté");
      app.listen(5000, () => console.log("Backend lancé : http://localhost:5000"));
    })
    .catch(err => console.error("Erreur MongoDB :", err.message));
}

// Export de l'application pour les tests ou l'import dans d'autres modules
export default app;

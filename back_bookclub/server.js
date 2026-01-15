import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/book.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(morgan("combined"));

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 150 });
app.use(limiter);

app.use("/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/favorites", (await import('./routes/favorites.js')).default);
app.use("/api/reviews", (await import('./routes/reviews.js')).default);
app.use("/api/reading-history", (await import('./routes/readingHistory.js')).default);

// central error handler
app.use(errorHandler);

// If not running tests, connect to MongoDB and start server
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connecté");
      app.listen(5000, () => console.log("Backend lancé : http://localhost:5000"));
    })
    .catch(err => console.error("Erreur MongoDB :", err.message));
}

export default app;













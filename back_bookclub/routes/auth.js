import mongoose from "mongoose";
// On utilise Mongoose pour créer un schéma et interagir avec MongoDB

// Définition du schéma pour les utilisateurs
const userSchema = new mongoose.Schema(
  {
    // Prénom de l'utilisateur (obligatoire)
    firstName: { type: String, required: true },

    // Nom de famille de l'utilisateur (obligatoire)
    lastName:  { type: String, required: true },

    // Email de l'utilisateur (obligatoire et unique)
    email:     { type: String, required: true, unique: true },

    // Mot de passe de l'utilisateur (obligatoire)
    password:  { type: String, required: true },

    // Adresse de l'utilisateur (facultatif)
    address:   { type: String },

    // Ville de l'utilisateur (facultatif)
    city:      { type: String },

    // État / région de l'utilisateur (facultatif)
    state:     { type: String },

    // Rôle de l'utilisateur : "user", "admin" ou "creator"
    // Par défaut : "user"
    role: {
      type: String,
      enum: ["user", "admin", "creator"],
      default: "user",
    },

    // Liste de livres favoris de l'utilisateur
    // Chaque élément référence un document Book
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],

    // URL de l'avatar de l'utilisateur
    avatar: { type: String },
  },
);

// Export du modèle pour pouvoir l'utiliser dans le reste du projet
export default mongoose.model("User", userSchema);

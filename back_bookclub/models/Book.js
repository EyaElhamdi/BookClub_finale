import mongoose from "mongoose";
// On utilise Mongoose pour créer un schéma et interagir avec MongoDB

// Définition du schéma pour les livres
const bookSchema = new mongoose.Schema(
  {
    // Titre du livre (obligatoire)
    title: { type: String, required: true },

    // Auteur du livre (obligatoire)
    author: { type: String, required: true },

    // Note moyenne du livre, par défaut 0
    rating: { type: Number, default: 0 },

    // URL de l'image de couverture
    image: { type: String },

    // Petit résumé ou teaser du livre
    teaser: { type: String },

    // Lien pour acheter le livre
    buyLink: { type: String },

    // Extrait du livre
    excerpt: { type: String },

    // Année de publication
    year: { type: Number },

    // Nombre de pages
    pages: { type: Number },

    // Maison d'édition
    publisher: { type: String },

    // Numéro ISBN du livre
    isbn: { type: String },

    // Liste des genres du livre (ex : ["Fantasy", "Adventure"])
    genres: [{ type: String }],

    // Description longue du livre
    longDescription: { type: String },

    // Liste des avis utilisateurs
    // Chaque avis contient : nom de l'utilisateur, note et texte du commentaire
    reviews: [{ 
      user: String, 
      rating: Number, 
      text: String 
    }],

    // Référence à l'utilisateur qui a ajouté le livre (relation avec le modèle User)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },

  // timestamps: true ajoute automatiquement createdAt et updatedAt
  { timestamps: true }
);

// Export du modèle pour pouvoir l'utiliser dans le reste du projet
export default mongoose.model("Book", bookSchema);

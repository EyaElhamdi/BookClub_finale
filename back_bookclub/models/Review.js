import mongoose from 'mongoose';
// On utilise Mongoose pour créer un schéma et interagir avec MongoDB

// Définition du schéma pour les avis (reviews)
const reviewSchema = new mongoose.Schema({
  
  // ID du livre concerné par l'avis
  // Peut être une string pour les livres manuels ("m1", "m2") ou un ObjectId du backend
  bookId: {
    type: String,
    required: true,
  },

  // Référence à l'utilisateur qui laisse l'avis
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lien vers le modèle User
    required: true,
  },

  // Note donnée par l'utilisateur (entre 1 et 5)
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },

  // Commentaire de l'utilisateur
  comment: {
    type: String,
    trim: true,      // Supprime les espaces inutiles au début et à la fin
    maxlength: 2000, // Limite la longueur du commentaire
  },

  // Date de création de l'avis
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Date de dernière modification
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// On crée un index unique pour éviter qu'un utilisateur laisse plusieurs avis sur le même livre
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

// Export du modèle pour pouvoir l'utiliser dans le reste du projet
export default mongoose.model('Review', reviewSchema);

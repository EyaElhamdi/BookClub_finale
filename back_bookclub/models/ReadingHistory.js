import mongoose from 'mongoose';
// On utilise Mongoose pour créer un schéma et interagir avec MongoDB

// Définition du schéma pour l'historique de lecture
const readingHistorySchema = new mongoose.Schema({
  
  // Référence à l'utilisateur qui lit le livre
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lien vers le modèle User
    required: true,
  },

  // ID du livre
  // Peut être un ObjectId du backend ou une string pour les livres manuels (ex: "m1", "m2")
  bookId: {
    type: String,
    required: true,
  },

  // Statut de lecture
  // Enumère uniquement ces valeurs possibles : 'à-lire', 'en-cours', 'lu'
  status: {
    type: String,
    enum: ['à-lire', 'en-cours', 'lu'],
    default: 'à-lire',
  },

  // Date de début de lecture
  startDate: {
    type: Date,
  },

  // Date de fin de lecture
  endDate: {
    type: Date,
  },

  // Note donnée par l'utilisateur au livre (entre 1 et 5)
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  // Date de création de l'entrée
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Date de dernière mise à jour
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// On crée un index unique pour s'assurer qu'un utilisateur ne peut avoir
// qu'une seule entrée par livre
readingHistorySchema.index({ userId: 1, bookId: 1 }, { unique: true });

// Export du modèle pour l'utiliser dans le reste du projet
export default mongoose.model('ReadingHistory', readingHistorySchema);

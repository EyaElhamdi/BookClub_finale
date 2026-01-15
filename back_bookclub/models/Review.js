import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: String,  // String pour supporter les livres manuels (m1, m2, etc) et les ObjectIds du backend
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Empêcher les doublons: un utilisateur ne peut laisser qu'un avis par livre
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);

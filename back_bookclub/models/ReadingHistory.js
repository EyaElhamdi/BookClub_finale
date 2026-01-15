import mongoose from 'mongoose';

const readingHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: String,  // String pour supporter les livres manuels (m1, m2, etc) et les ObjectIds du backend
    required: true,
  },
  status: {
    type: String,
    enum: ['à-lire', 'en-cours', 'lu'],
    default: 'à-lire',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
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

// Un utilisateur ne peut avoir qu'une entrée par livre
readingHistorySchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.model('ReadingHistory', readingHistorySchema);

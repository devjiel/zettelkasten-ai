import mongoose, { Schema, Document } from 'mongoose';

// Interface pour les Flashcards
export interface IFlashcard extends Document {
  question: string;
  answer: string;
  tags: string[];
  sourceNote: mongoose.Types.ObjectId;
  lastReviewed?: Date;
  reviewCount: number;
  nextReviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour les Flashcards
const FlashcardSchema: Schema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [{ type: String }],
  sourceNote: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
  lastReviewed: { type: Date },
  reviewCount: { type: Number, default: 0 },
  nextReviewDate: { type: Date },
}, {
  timestamps: true
});

// Création d'index pour faciliter les recherches
FlashcardSchema.index({ question: 'text', answer: 'text', tags: 'text' });

export default mongoose.model<IFlashcard>('Flashcard', FlashcardSchema); 
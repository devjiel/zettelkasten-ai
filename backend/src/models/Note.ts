import mongoose, { Schema, Document } from 'mongoose';

// Interface pour les Notes
export interface INote extends Document {
  title: string;
  content: string;
  tags: string[];
  references: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour les Notes (Zettelkasten)
const NoteSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  references: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
}, {
  timestamps: true
});

// Création d'index pour faciliter les recherches
NoteSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model<INote>('Note', NoteSchema); 
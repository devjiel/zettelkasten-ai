import express from 'express';
import * as flashcardsController from '../controllers/flashcardsController';

const router = express.Router();

// Route pour obtenir toutes les flashcards
router.get('/', flashcardsController.getAllFlashcards);

// Route pour obtenir les flashcards pour révision
router.get('/review', flashcardsController.getFlashcardsForReview);

// Route pour obtenir les flashcards d'une note spécifique
router.get('/note/:noteId', flashcardsController.getFlashcardsByNoteId);

// Route pour obtenir une flashcard spécifique par ID
router.get('/:id', flashcardsController.getFlashcardById);

// Route pour mettre à jour une flashcard après révision
router.post('/:id/review', flashcardsController.updateFlashcardAfterReview);

// Route pour créer une nouvelle flashcard
router.post('/', flashcardsController.createFlashcard);

// Route pour mettre à jour une flashcard
router.put('/:id', flashcardsController.updateFlashcard);

// Route pour supprimer une flashcard
router.delete('/:id', flashcardsController.deleteFlashcard);

export default router; 
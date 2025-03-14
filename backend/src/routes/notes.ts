import express from 'express';
import * as notesController from '../controllers/notesController';

const router = express.Router();

// Route pour obtenir toutes les notes
router.get('/', notesController.getAllNotes);

// Route pour rechercher des notes
router.get('/search', notesController.searchNotes);

// Route pour créer une nouvelle note
router.post('/', notesController.createNote);

// Route pour obtenir une note spécifique par ID
router.get('/:id', notesController.getNoteById);

// Route pour obtenir les flashcards d'une note spécifique
router.get('/:id/flashcards', notesController.getNoteFlashcards);

// Route pour mettre à jour une note
router.put('/:id', notesController.updateNote);

// Route pour supprimer une note
router.delete('/:id', notesController.deleteNote);

export default router; 
import express from 'express';
import * as notesController from '../controllers/notesController';
import { exportController } from '../controllers/exportController';

const router = express.Router();

// Routes d'export
router.get('/export-all', exportController.exportAllNotes);
router.post('/export', exportController.exportMultipleNotes);

// Route pour rechercher des notes
router.get('/search', notesController.searchNotes);

// Route pour obtenir toutes les notes
router.get('/', notesController.getAllNotes);

// Route pour créer une nouvelle note
router.post('/', notesController.createNote);

// Route pour obtenir une note spécifique par ID
router.get('/:id', notesController.getNoteById);

// Route pour exporter une note spécifique
router.get('/:id/export', exportController.exportSingleNote);

// Route pour obtenir les flashcards d'une note spécifique
router.get('/:id/flashcards', notesController.getNoteFlashcards);

// Route pour mettre à jour une note
router.put('/:id', notesController.updateNote);

// Route pour supprimer une note
router.delete('/:id', notesController.deleteNote);

export default router; 
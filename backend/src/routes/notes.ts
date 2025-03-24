import express from 'express';
import * as notesController from '../controllers/notesController';
import { exportController } from '../controllers/exportController';
import importController, { upload, handleMulterError } from '../controllers/importController';

const router = express.Router();

// Routes CRUD basiques
router.get('/', notesController.getAllNotes);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

// Routes de recherche
router.get('/search', notesController.searchNotes);

// Routes d'export
router.get('/export-all', exportController.exportMultipleNotes);
router.get('/:id/export', exportController.exportNote);

// Routes d'import avec gestion des erreurs Multer
router.post('/import',
    upload,
    handleMulterError,
    importController.importNote
);

router.post('/import-bulk',
    upload,
    handleMulterError,
    importController.importMultipleNotes
);

// Route pour obtenir une note spécifique par ID
router.get('/:id', notesController.getNoteById);

// Route pour obtenir les flashcards d'une note spécifique
router.get('/:id/flashcards', notesController.getNoteFlashcards);

export default router; 
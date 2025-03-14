import { Request, Response } from 'express';
import { FlashcardRepository } from '../storage/FlashcardRepository';
import { NoteRepository } from '../storage/NoteRepository';

const flashcardRepository = FlashcardRepository.getInstance();
const noteRepository = NoteRepository.getInstance();

/**
 * Obtenir toutes les flashcards
 */
export const getAllFlashcards = async (req: Request, res: Response): Promise<void> => {
  try {
    const flashcards = await flashcardRepository.getAllFlashcards();
    res.json(flashcards);
  } catch (error) {
    console.error('Erreur lors de la récupération des flashcards:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des flashcards' });
  }
};

/**
 * Obtenir une flashcard par ID
 */
export const getFlashcardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const flashcard = await flashcardRepository.getFlashcardById(id);
    
    if (!flashcard) {
      res.status(404).json({ error: 'Flashcard non trouvée' });
      return;
    }
    
    res.json(flashcard);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la flashcard ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la flashcard' });
  }
};

/**
 * Obtenir les flashcards d'une note spécifique
 */
export const getFlashcardsByNoteId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const note = await noteRepository.getNoteById(noteId);
    
    if (!note) {
      res.status(404).json({ error: 'Note non trouvée' });
      return;
    }
    
    const flashcards = await flashcardRepository.getFlashcardsByNoteId(noteId);
    res.json(flashcards);
  } catch (error) {
    console.error(`Erreur lors de la récupération des flashcards pour la note ${req.params.noteId}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des flashcards pour cette note' });
  }
};

/**
 * Obtenir les flashcards pour révision
 */
export const getFlashcardsForReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const flashcards = await flashcardRepository.getFlashcardsForReview();
    res.json(flashcards);
  } catch (error) {
    console.error('Erreur lors de la récupération des flashcards pour révision:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des flashcards pour révision' });
  }
};

/**
 * Mettre à jour une flashcard après révision
 */
export const updateFlashcardAfterReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { remembered } = req.body;
    
    if (remembered === undefined) {
      res.status(400).json({ error: 'Le paramètre "remembered" est requis' });
      return;
    }
    
    const flashcard = await flashcardRepository.getFlashcardById(id);
    
    if (!flashcard) {
      res.status(404).json({ error: 'Flashcard non trouvée' });
      return;
    }
    
    // Mise à jour des statistiques de révision
    const updatedFlashcard = await flashcardRepository.updateFlashcardAfterReview(id, remembered);
    res.json(updatedFlashcard);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la flashcard ${req.params.id} après révision:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la flashcard après révision' });
  }
};

/**
 * Créer une nouvelle flashcard
 */
export const createFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, noteId, tags = [] } = req.body;
    
    if (!question || !answer || !noteId) {
      res.status(400).json({ error: 'La question, la réponse et l\'ID de la note sont requis' });
      return;
    }
    
    const note = await noteRepository.getNoteById(noteId);
    
    if (!note) {
      res.status(404).json({ error: 'Note non trouvée' });
      return;
    }
    
    const newFlashcard = await flashcardRepository.createFlashcard({
      question,
      answer,
      sourceNoteId: noteId,
      tags,
      reviewCount: 0,
      nextReviewDate: new Date(),
    });
    
    res.status(201).json(newFlashcard);
  } catch (error) {
    console.error('Erreur lors de la création de la flashcard:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la flashcard' });
  }
};

/**
 * Mettre à jour une flashcard
 */
export const updateFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const flashcard = await flashcardRepository.getFlashcardById(id);
    
    if (!flashcard) {
      res.status(404).json({ error: 'Flashcard non trouvée' });
      return;
    }
    
    const updatedFlashcard = await flashcardRepository.updateFlashcard(id, updates);
    res.json(updatedFlashcard);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la flashcard ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la flashcard' });
  }
};

/**
 * Supprimer une flashcard
 */
export const deleteFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const flashcard = await flashcardRepository.getFlashcardById(id);
    
    if (!flashcard) {
      res.status(404).json({ error: 'Flashcard non trouvée' });
      return;
    }
    
    await flashcardRepository.deleteFlashcard(id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la flashcard ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la flashcard' });
  }
}; 
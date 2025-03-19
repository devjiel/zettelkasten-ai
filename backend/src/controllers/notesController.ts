import { Request, Response } from 'express';
import { NoteRepository } from '../storage/NoteRepository';
import { FlashcardRepository } from '../storage/FlashcardRepository';

const noteRepository = NoteRepository.getInstance();
const flashcardRepository = FlashcardRepository.getInstance();

/**
 * Obtenir toutes les notes
 */
export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const notes = await noteRepository.getAllNotes();
    res.json(notes);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
  }
};

/**
 * Obtenir une note par ID
 */
export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await noteRepository.getNoteById(id);

    if (!note) {
      res.status(404).json({ error: 'Note non trouvée' });
      return;
    }

    res.json(note);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la note ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la note' });
  }
};

/**
 * Créer une nouvelle note
 */
export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, tags, references } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Le titre et le contenu sont requis' });
      return;
    }

    const newNote = await noteRepository.createNote({
      title,
      content,
      tags: tags || [],
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error('Erreur lors de la création de la note:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la note' });
  }
};

/**
 * Mettre à jour une note
 */
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, tags, references } = req.body;

    const updatedNote = await noteRepository.updateNote(id, {
      title,
      content,
      tags,
    });

    if (!updatedNote) {
      res.status(404).json({ error: 'Note non trouvée' });
      return;
    }

    res.json(updatedNote);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la note ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la note' });
  }
};

/**
 * Supprimer une note
 */
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Supprimer d'abord les flashcards associées
    await flashcardRepository.deleteFlashcardsByNoteId(id);

    // Puis supprimer la note
    const deleted = await noteRepository.deleteNote(id);

    if (!deleted) {
      res.status(404).json({ error: 'Note non trouvée' });
      return;
    }

    res.json({ message: `Note ${id} supprimée avec succès` });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la note ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la note' });
  }
};

/**
 * Rechercher des notes
 */
export const searchNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Le paramètre de recherche est requis' });
      return;
    }

    const notes = await noteRepository.searchNotes(query);
    res.json(notes);
  } catch (error) {
    console.error('Erreur lors de la recherche de notes:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche de notes' });
  }
};

/**
 * Obtenir les flashcards d'une note
 */
export const getNoteFlashcards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Vérifier si la note existe
    const note = await noteRepository.getNoteById(id);

    if (!note) {
      res.status(404).json({ error: 'Note non trouvée' });
      return;
    }

    const flashcards = await flashcardRepository.getFlashcardsByNoteId(id);
    res.json(flashcards);
  } catch (error) {
    console.error(`Erreur lors de la récupération des flashcards pour la note ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des flashcards' });
  }
}; 
import api from './api';
import { Flashcard } from '../types';

const getAllFlashcards = async (): Promise<Flashcard[]> => {
  const response = await api.get('/flashcards');
  return response.data;
};

const getFlashcardById = async (id: string): Promise<Flashcard> => {
  const response = await api.get(`/flashcards/${id}`);
  return response.data;
};

const getFlashcardsByNoteId = async (noteId: string): Promise<Flashcard[]> => {
  const response = await api.get(`/flashcards/note/${noteId}`);
  return response.data;
};

const getFlashcardsForReview = async (): Promise<Flashcard[]> => {
  const response = await api.get('/flashcards/review');
  return response.data;
};

const updateFlashcardAfterReview = async (id: string, remembered: boolean): Promise<Flashcard> => {
  const response = await api.post(`/flashcards/${id}/review`, { remembered });
  return response.data;
};

export const flashcardService = {
  getAllFlashcards,
  getFlashcardById,
  getFlashcardsByNoteId,
  getFlashcardsForReview,
  updateFlashcardAfterReview,
}; 
import api from './api';
import { Note } from '../types';

const getAllNotes = async (): Promise<Note[]> => {
  const response = await api.get('/notes');
  return response.data;
};

const getNoteById = async (id: string): Promise<Note> => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

const createNote = async (note: Note): Promise<Note> => {
  const response = await api.post('/notes', note);
  return response.data;
};

const updateNote = async (id: string, note: Partial<Note>): Promise<Note> => {
  const response = await api.put(`/notes/${id}`, note);
  return response.data;
};

const deleteNote = async (id: string): Promise<boolean> => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

const searchNotes = async (query: string): Promise<Note[]> => {
  const response = await api.get(`/notes/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

const getNotesByTag = async (tag: string): Promise<Note[]> => {
  const response = await api.get(`/notes/tag/${encodeURIComponent(tag)}`);
  return response.data;
};

export const noteService = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  getNotesByTag,
}; 
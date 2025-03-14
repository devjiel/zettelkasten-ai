import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, Flashcard, Task } from '../types';
import { noteService } from '../services/noteService';
import { flashcardService } from '../services/flashcardService';
import { agentService } from '../services/agentService';

interface AppContextType {
  notes: Note[];
  flashcards: Flashcard[];
  pendingTasks: Task[];
  loading: boolean;
  error: string | null;
  refreshNotes: () => Promise<void>;
  refreshFlashcards: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

// Valeur par défaut du contexte
const defaultContext: AppContextType = {
  notes: [],
  flashcards: [],
  pendingTasks: [],
  loading: false,
  error: null,
  refreshNotes: async () => {},
  refreshFlashcards: async () => {},
  refreshTasks: async () => {},
};

// Création du contexte
const AppContext = createContext<AppContextType>(defaultContext);

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => useContext(AppContext);

// Provider du contexte
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les notes
  const refreshNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noteService.getAllNotes();
      setNotes(data);
    } catch (err) {
      setError('Erreur lors du chargement des notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les flashcards
  const refreshFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await flashcardService.getAllFlashcards();
      setFlashcards(data);
    } catch (err) {
      setError('Erreur lors du chargement des flashcards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les tâches en cours
  const refreshTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agentService.getPendingTasks();
      setPendingTasks(data);
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    refreshNotes();
    refreshFlashcards();
    refreshTasks();
  }, []);

  // Intervalle pour rafraîchir les tâches en cours
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingTasks.length > 0) {
        refreshTasks();
      }
    }, 5000); // Rafraîchir toutes les 5 secondes s'il y a des tâches en cours

    return () => clearInterval(interval);
  }, [pendingTasks]);

  const value = {
    notes,
    flashcards,
    pendingTasks,
    loading,
    error,
    refreshNotes,
    refreshFlashcards,
    refreshTasks,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 
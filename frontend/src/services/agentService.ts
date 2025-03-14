import api from './api';
import { Task, BookSummaryInput } from '../types';

// Obtenir la liste des agents disponibles
const getAvailableAgents = async () => {
  const response = await api.get('/agents');
  return response.data;
};

// Soumettre une tâche de résumé de livre
const createBookSummary = async (input: BookSummaryInput): Promise<{ taskId: string }> => {
  const response = await api.post('/agents/book-summary', input);
  return response.data;
};

// Obtenir le statut d'une tâche
const getTaskStatus = async (taskId: string): Promise<Task> => {
  const response = await api.get(`/agents/tasks/${taskId}`);
  return response.data;
};

// Obtenir la liste des tâches en cours
const getPendingTasks = async (): Promise<Task[]> => {
  const response = await api.get('/agents/tasks');
  return response.data;
};

export const agentService = {
  getAvailableAgents,
  createBookSummary,
  getTaskStatus,
  getPendingTasks,
}; 
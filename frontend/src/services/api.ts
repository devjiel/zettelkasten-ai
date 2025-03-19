import axios from 'axios';

// Création d'une instance d'axios avec une configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export functions
export const exportNote = async (noteId: string): Promise<Blob> => {
  const response = await api.get(`/notes/${noteId}/export`, { responseType: 'blob' });
  return response.data;
};

export const exportAllNotes = async (): Promise<Blob> => {
  const response = await api.get('/notes/export-all', { responseType: 'blob' });
  return response.data;
};

export default api; 
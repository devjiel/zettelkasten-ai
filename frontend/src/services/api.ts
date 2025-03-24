import axios from 'axios';
import { API_URL } from '../config';

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

interface ImportOptions {
  overwrite: boolean;
  skipDuplicates: boolean;
}

// Import d'une seule note
export const importNote = async (file: File, options: ImportOptions) => {
  const formData = new FormData();
  formData.append('file', file);

  // Ajout des options comme un objet JSON pour préserver le typage
  const optionsBlob = new Blob(
    [JSON.stringify(options)],
    { type: 'application/json' }
  );
  formData.append('options', optionsBlob);

  const response = await fetch(`${API_URL}/notes/import`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'import de la note');
  }

  return response.json();
};

// Import de plusieurs notes
export const importNotes = async (files: File[], options: ImportOptions) => {
  const formData = new FormData();
  files.forEach(file => formData.append('file', file));

  // Ajout des options comme un objet JSON pour préserver le typage
  const optionsBlob = new Blob(
    [JSON.stringify(options)],
    { type: 'application/json' }
  );
  formData.append('options', optionsBlob);

  const response = await fetch(`${API_URL}/notes/import-bulk`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'import des notes');
  }

  return response.json();
};

export default api; 
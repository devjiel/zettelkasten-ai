import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Divider } from '@mui/material';
import { BookSummaryInput } from '../types';
import { useAgents } from '../contexts/AgentsContext';

interface BookSummaryFormProps {
  onSubmit: (taskId: string) => void;
}

export const BookSummaryForm: React.FC<BookSummaryFormProps> = ({ onSubmit }) => {
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { runBookSummary } = useAgents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookTitle || !bookAuthor) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const input: BookSummaryInput = {
        bookTitle,
        bookAuthor
      };

      const result = await runBookSummary(input);
      onSubmit(result.taskId);
      setBookTitle('');
      setBookAuthor('');
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Agent de résumé de livre
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="body1" paragraph>
        Cet agent vous aide à créer des notes et des flashcards à partir d'un résumé de livre.
        Fournissez le titre et l'auteur pour générer des fiches de notes.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Titre du livre"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Auteur"
          value={bookAuthor}
          onChange={(e) => setBookAuthor(e.target.value)}
          margin="normal"
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? 'Traitement en cours...' : 'Générer des notes'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}; 
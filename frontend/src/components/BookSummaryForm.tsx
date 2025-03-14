import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { BookSummaryInput } from '../types';

interface BookSummaryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: BookSummaryInput) => Promise<void>;
  isSubmitting: boolean;
}

const BookSummaryForm: React.FC<BookSummaryFormProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!bookTitle.trim()) {
      newErrors.bookTitle = 'Le titre du livre est requis';
    }

    if (!bookAuthor.trim()) {
      newErrors.bookAuthor = 'L\'auteur du livre est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit({ 
          title: bookTitle, 
          author: bookAuthor
        });
        handleReset();
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
      }
    }
  };

  const handleReset = () => {
    setBookTitle('');
    setBookAuthor('');
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Créer un résumé de livre</DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          L'agent IA va analyser et créer un résumé complet du livre, ainsi que des flashcards pour aider à mémoriser les concepts clés.
        </Alert>

        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="bookTitle"
            label="Titre du livre"
            name="bookTitle"
            autoFocus
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            error={!!errors.bookTitle}
            helperText={errors.bookTitle}
            disabled={isSubmitting}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="bookAuthor"
            name="bookAuthor"
            label="Auteur du livre"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            error={!!errors.bookAuthor}
            helperText={errors.bookAuthor}
            disabled={isSubmitting}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Traitement en cours...' : 'Créer le résumé'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookSummaryForm; 
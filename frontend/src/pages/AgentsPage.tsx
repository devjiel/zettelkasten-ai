import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import TaskStatusCard from '../components/TaskStatusCard';
import { agentService } from '../services/agentService';
import { useAppContext } from '../contexts/AppContext';
import { Task, BookSummaryInput } from '../types';

const AgentsPage: React.FC = () => {
  const { pendingTasks, refreshTasks } = useAppContext();
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookTitle || !bookAuthor) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const input: BookSummaryInput = {
        bookTitle: bookTitle,
        bookAuthor: bookAuthor
      };

      const result = await agentService.createBookSummary(input);

      setSuccess(`Tâche créée avec succès! ID de la tâche: ${result.taskId}`);
      setBookTitle('');
      setBookAuthor('');

      // Rafraîchir la liste des tâches
      refreshTasks();
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agents IA
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Agent de résumé de livre
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="body1" paragraph>
            Cet agent vous aide à créer des notes et des flashcards à partir d'un résumé de livre.
            Fournissez le titre, l'auteur et un résumé pour générer des fiches de notes.
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

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Tâches en cours
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : pendingTasks.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {pendingTasks.map((task) => (
                <Box key={task.id} sx={{ width: { xs: '100%', md: '48%' } }}>
                  <TaskStatusCard task={task} onRefresh={refreshTasks} />
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              Aucune tâche en cours pour le moment.
            </Alert>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={refreshTasks} color="primary">
              Rafraîchir
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AgentsPage; 
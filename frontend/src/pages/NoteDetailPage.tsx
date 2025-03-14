import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FlashcardView from '../components/FlashcardView';
import NoteForm from '../components/NoteForm';
import { noteService } from '../services/noteService';
import { flashcardService } from '../services/flashcardService';
import { Note, Flashcard } from '../types';
import { formatDate } from '../utils/formatters';
import { useAppContext } from '../contexts/AppContext';

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshNotes, notes } = useAppContext();
  const [note, setNote] = useState<Note | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Extraire tous les tags uniques des notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  useEffect(() => {
    const fetchNoteAndFlashcards = async () => {
      try {
        if (!id) {
          setError('ID de note non valide');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const noteData = await noteService.getNoteById(id);
        setNote(noteData);

        // Récupérer les flashcards associées à cette note
        const flashcardsData = await flashcardService.getFlashcardsByNoteId(id);
        setFlashcards(flashcardsData);
      } catch (err) {
        console.error('Erreur lors du chargement de la note:', err);
        setError('Erreur lors du chargement de la note. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchNoteAndFlashcards();
  }, [id]);

  const handleEdit = () => {
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!note?.id) return;

    try {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?');
      if (confirmed) {
        await noteService.deleteNote(note.id);
        refreshNotes();
        navigate('/');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la note:', err);
      setError('Erreur lors de la suppression de la note. Veuillez réessayer.');
    }
  };

  const handleSaveNote = async (updatedNote: Note) => {
    try {
      if (!updatedNote.id) return;

      await noteService.updateNote(updatedNote.id, updatedNote);
      setNote(updatedNote);
      refreshNotes();
      setFormOpen(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la note:', err);
      setError('Erreur lors de la mise à jour de la note. Veuillez réessayer.');
    }
  };

  const handleReviewFlashcard = async (flashcardId: string, remembered: boolean) => {
    try {
      await flashcardService.updateFlashcardAfterReview(flashcardId, remembered);
      
      // Rafraîchir la liste des flashcards
      if (id) {
        const updatedFlashcards = await flashcardService.getFlashcardsByNoteId(id);
        setFlashcards(updatedFlashcards);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la flashcard:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !note) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Retour aux notes
          </Button>
          <Alert severity="error">{error || 'Note non trouvée'}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {note.title}
          </Typography>
          <Tooltip title="Modifier">
            <IconButton onClick={handleEdit} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {note.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
          
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {note.content}
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">
              {note.updatedAt
                ? `Dernière modification : ${formatDate(note.updatedAt)}`
                : ''}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Flashcards ({flashcards.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {flashcards.length === 0 ? (
            <Alert severity="info">
              Aucune flashcard associée à cette note.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {flashcards.map((flashcard) => (
                <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                  <FlashcardView
                    flashcard={flashcard}
                    onReview={handleReviewFlashcard}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      <NoteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveNote}
        existingNote={note}
        existingTags={allTags}
      />
    </Container>
  );
};

export default NoteDetailPage; 
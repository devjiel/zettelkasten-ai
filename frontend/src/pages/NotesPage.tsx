import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import { useAppContext } from '../contexts/AppContext';
import { noteService } from '../services/noteService';
import { Note } from '../types';
import { useNavigate } from 'react-router-dom';

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { notes, loading, error, refreshNotes } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Filtrer les notes en fonction de la recherche
  const filteredNotes = notes.filter(note => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(lowerCaseQuery) ||
      note.content.toLowerCase().includes(lowerCaseQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    );
  });

  // Extraire tous les tags uniques des notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const handleOpenForm = (note?: Note) => {
    setSelectedNote(note);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedNote(undefined);
  };

  const handleSaveNote = async (noteData: Note) => {
    try {
      if (noteData.id) {
        // Mise à jour d'une note existante
        await noteService.updateNote(noteData.id, noteData);
        setSnackbar({ open: true, message: 'Note mise à jour avec succès', severity: 'success' });
      } else {
        // Création d'une nouvelle note
        await noteService.createNote(noteData);
        setSnackbar({ open: true, message: 'Note créée avec succès', severity: 'success' });
      }
      refreshNotes();
      handleCloseForm();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la note:', err);
      setSnackbar({
        open: true, 
        message: 'Erreur lors de la sauvegarde de la note. Veuillez réessayer.',
        severity: 'error'
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteService.deleteNote(noteId);
      refreshNotes();
      setSnackbar({ open: true, message: 'Note supprimée avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de la suppression de la note:', err);
      setSnackbar({
        open: true, 
        message: 'Erreur lors de la suppression de la note. Veuillez réessayer.',
        severity: 'error'
      });
    }
  };

  const handleNoteClick = (note: Note) => {
    if (note.id) {
      navigate(`/note/${note.id}`);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Mes notes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Nouvelle note
          </Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Rechercher par titre, contenu ou tag..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredNotes.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="textSecondary">
            {searchQuery
              ? 'Aucune note ne correspond à votre recherche'
              : 'Vous n\'avez pas encore de notes. Commencez par en créer une !'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <NoteCard
                note={note}
                onEdit={() => handleOpenForm(note)}
                onDelete={handleDeleteNote}
                onClick={handleNoteClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <NoteForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveNote}
        existingNote={selectedNote}
        existingTags={allTags}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotesPage; 
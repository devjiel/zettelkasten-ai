import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Paper,
  Typography,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Note } from '../types';

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  existingNote?: Note;
  existingTags?: string[];
}

const NoteForm: React.FC<NoteFormProps> = ({
  open,
  onClose,
  onSave,
  existingNote,
  existingTags = [],
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialiser le formulaire avec les valeurs existantes
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setTags(existingNote.tags);
    } else {
      // Réinitialiser le formulaire
      setTitle('');
      setContent('');
      setTags([]);
    }
    setErrors({});
  }, [existingNote, open]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!content.trim()) {
      newErrors.content = 'Le contenu est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const noteData: Note = {
        ...existingNote,
        title,
        content,
        tags,
      };
      onSave(noteData);
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>
        {existingNote ? 'Modifier la note' : 'Ajouter une nouvelle note'}
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Titre"
            name="title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="content"
            name="content"
            label="Contenu"
            multiline
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={!!errors.content}
            helperText={errors.content}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Autocomplete
                freeSolo
                options={existingTags.filter(tag => !tags.includes(tag))}
                inputValue={newTag}
                onInputChange={(_, value) => setNewTag(value)}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Ajouter un tag"
                    size="small"
                    onKeyDown={handleKeyDown}
                  />
                )}
              />
              <Button
                variant="contained"
                onClick={handleAddTag}
                disabled={!newTag}
                sx={{ ml: 1 }}
              >
                Ajouter
              </Button>
            </Box>

            {tags.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1, minHeight: '50px' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave} variant="contained">
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteForm; 
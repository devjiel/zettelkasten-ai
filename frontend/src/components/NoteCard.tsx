import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions,
  Typography, 
  Chip,
  Box,
  IconButton,
  CardActionArea
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Note } from '../types';
import { formatDate } from '../utils/formatters';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onClick?: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onClick }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(note);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && note.id) {
      onDelete(note.id);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(note);
    }
  };

  // Limiter la longueur du contenu pour l'aperçu
  const previewContent = note.content.length > 200 
    ? `${note.content.substring(0, 200)}...` 
    : note.content;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {note.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {previewContent}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {note.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {note.updatedAt ? `Modifié le ${formatDate(note.updatedAt)}` : ''}
        </Typography>
        <Box>
          {onEdit && (
            <IconButton size="small" onClick={handleEdit} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton size="small" onClick={handleDelete} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default NoteCard; 
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
import DownloadIcon from '@mui/icons-material/Download';
import { Note } from '../types';
import { formatDate } from '../utils/formatters';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onExport?: (note: Note) => void;
  onClick?: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onExport, onClick }) => {
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

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExport) {
      onExport(note);
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
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="div" sx={{ p: 2, pb: 0 }}>
          {note.title}
        </Typography>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            {previewContent}
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            mt: 2
          }}>
            {note.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
            {note.tags.length > 3 && (
              <Chip label="..." size="small" />
            )}
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
          {onExport && (
            <IconButton size="small" onClick={handleExport} color="primary">
              <DownloadIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default NoteCard; 
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  LinearProgress,
  Chip 
} from '@mui/material';
import { Task, TaskStatus } from '../types';
import { formatRelativeDate } from '../utils/formatters';

interface TaskStatusCardProps {
  task: Task;
  onRefresh?: () => void;
}

const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ task, onRefresh }) => {
  // Déterminer la couleur en fonction du statut
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'success';
      case TaskStatus.FAILED:
        return 'error';
      case TaskStatus.PROCESSING:
        return 'primary';
      default:
        return 'warning';
    }
  };

  // Traduire le statut en français
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'Terminé';
      case TaskStatus.FAILED:
        return 'Échoué';
      case TaskStatus.PROCESSING:
        return 'En cours';
      default:
        return 'En attente';
    }
  };

  // Extraire les informations de l'agent en fonction du type
  const getAgentInfo = () => {
    switch (task.agentType) {
      case 'book-summary':
        return {
          title: `Résumé de livre : "${task.input.bookTitle}"`,
          subtitle: `par ${task.input.bookAuthor}`,
        };
      default:
        return {
          title: `Tâche ${task.id}`,
          subtitle: `Type : ${task.agentType}`,
        };
    }
  };

  const agentInfo = getAgentInfo();
  const statusColor = getStatusColor(task.status);
  const statusText = getStatusText(task.status);
  const isInProgress = task.status === TaskStatus.PENDING || task.status === TaskStatus.PROCESSING;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip 
            label={statusText} 
            color={statusColor as any} 
            variant="outlined" 
            size="small" 
          />
          <Typography variant="caption" color="text.secondary">
            {formatRelativeDate(task.createdAt)}
          </Typography>
        </Box>

        <Typography variant="h6" component="div" gutterBottom>
          {agentInfo.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {agentInfo.subtitle}
        </Typography>
        
        {isInProgress && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress color={statusColor as any} />
          </Box>
        )}
        
        {task.status === TaskStatus.FAILED && task.output?.error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Erreur : {task.output.error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskStatusCard; 
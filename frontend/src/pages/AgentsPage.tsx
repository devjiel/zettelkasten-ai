import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import TaskStatusCard from '../components/TaskStatusCard';
import { BookSummaryForm } from '../components/BookSummaryForm';
import { WebExtractForm } from '../components/WebExtractForm';
import { useAppContext } from '../contexts/AppContext';

const AgentsPage: React.FC = () => {
  const { pendingTasks, refreshTasks } = useAppContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTaskCreated = () => {
    refreshTasks();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agents IA
        </Typography>

        <BookSummaryForm onSubmit={handleTaskCreated} />
        <WebExtractForm onSubmit={handleTaskCreated} />

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
import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import ThemeContext from '../contexts/ThemeContext';
import { exportAllNotes } from '../services/api';

const SettingsPage: React.FC = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('apiUrl') || 'http://localhost:3001/api';
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [error, setError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleDarkModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleDarkMode();
  };

  const handleApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiUrl(event.target.value);
  };

  const handleSaveApiUrl = () => {
    localStorage.setItem('apiUrl', apiUrl);
    setSnackbar({
      open: true,
      message: 'URL de l\'API sauvegardée',
      severity: 'success',
    });
  };

  const handleResetData = () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.'
    );

    if (confirmed) {
      // TODO: Implement data reset
      setSnackbar({
        open: true,
        message: 'Toutes les données ont été réinitialisées',
        severity: 'success',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExportAllNotes = async () => {
    try {
      setError(null);
      setExportSuccess(false);
      const blob = await exportAllNotes();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zettelkasten_notes.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportSuccess(true);
    } catch (err) {
      setError('Erreur lors de l\'export des notes');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Paramètres
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Apparence
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={handleDarkModeChange}
                  name="darkMode"
                  color="primary"
                />
              }
              label="Mode sombre"
            />
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Changez entre le mode clair et le mode sombre.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuration de l'API
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="URL de l'API"
              value={apiUrl}
              onChange={handleApiUrlChange}
              margin="normal"
              helperText="URL du serveur backend"
            />
            <Button
              variant="outlined"
              onClick={handleSaveApiUrl}
              sx={{ mt: 1 }}
            >
              Enregistrer
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Gestion des données
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              Exportez toutes vos notes au format Markdown dans une archive ZIP.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExportAllNotes}
              sx={{ mt: 1 }}
            >
              Exporter toutes les notes
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {exportSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Export réussi !
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" color="error" gutterBottom>
              Zone de danger
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ces actions sont irréversibles.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes vos données ?')) {
                  // TODO: Implement data deletion
                }
              }}
            >
              Supprimer toutes les données
            </Button>
          </Box>
        </Paper>
      </Box>

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

export default SettingsPage; 
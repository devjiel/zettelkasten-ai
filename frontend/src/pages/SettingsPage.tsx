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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useTheme } from '@mui/material/styles';
import ThemeContext from '../contexts/ThemeContext';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('apiUrl') || 'http://localhost:3000/api';
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' | 'warning' 
  });

  const handleDarkModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleDarkMode();
  };

  const handleApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiUrl(event.target.value);
  };

  const handleSaveApiUrl = () => {
    // Sauvegarde de l'URL de l'API à implémenter plus tard
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
      // À implémenter : réinitialisation des données
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
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Synchronisation
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem
              secondaryAction={
                <Switch
                  edge="end"
                  onChange={() => {}}
                  checked={true}
                />
              }
            >
              <ListItemText
                primary="Synchronisation automatique"
                secondary="Synchronise automatiquement vos données avec le serveur"
              />
            </ListItem>
            
            <ListItem
              secondaryAction={
                <Button
                  variant="outlined"
                  startIcon={<CloudSyncIcon />}
                  onClick={() => {
                    setSnackbar({
                      open: true,
                      message: 'Synchronisation terminée',
                      severity: 'success',
                    });
                  }}
                >
                  Synchroniser
                </Button>
              }
            >
              <ListItemText
                primary="Synchroniser maintenant"
                secondary="Force une synchronisation immédiate avec le serveur"
              />
            </ListItem>
          </List>
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Données
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Button
            variant="outlined"
            color="error"
            onClick={handleResetData}
          >
            Réinitialiser toutes les données
          </Button>
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Attention : Cette action supprimera toutes vos notes, flashcards et autres données. Cette action est irréversible.
          </Typography>
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
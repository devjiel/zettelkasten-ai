import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import NotesPage from './pages/NotesPage';
import NoteDetailPage from './pages/NoteDetailPage';
import FlashcardsPage from './pages/FlashcardsPage';
import AgentsPage from './pages/AgentsPage';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { useContext } from 'react';
import ThemeContext from './contexts/ThemeContext';

// Wrapper component to use the theme context
const AppWithTheme: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);
  
  // Create a theme instance based on dark mode preference
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  }), [darkMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<NotesPage />} />
            <Route path="/note/:id" element={<NoteDetailPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppWithTheme />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;

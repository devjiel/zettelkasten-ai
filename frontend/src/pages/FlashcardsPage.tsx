import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import FlashcardView from '../components/FlashcardView';
import { useAppContext } from '../contexts/AppContext';
import { flashcardService } from '../services/flashcardService';
import { Flashcard } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`flashcards-tabpanel-${index}`}
      aria-labelledby={`flashcards-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const FlashcardsPage: React.FC = () => {
  const { flashcards: allFlashcards, loading: initialLoading, error: initialError, refreshFlashcards } = useAppContext();
  const [tabValue, setTabValue] = useState(0);
  const [reviewFlashcards, setReviewFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les flashcards à réviser
  useEffect(() => {
    const fetchFlashcardsForReview = async () => {
      try {
        setLoading(true);
        const data = await flashcardService.getFlashcardsForReview();
        setReviewFlashcards(data);
      } catch (err) {
        console.error('Erreur lors du chargement des flashcards à réviser:', err);
        setError('Erreur lors du chargement des flashcards à réviser');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardsForReview();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReviewFlashcard = async (flashcardId: string, remembered: boolean) => {
    try {
      await flashcardService.updateFlashcardAfterReview(flashcardId, remembered);
      
      // Mettre à jour les listes après la révision
      const updatedReviewFlashcards = reviewFlashcards.filter(fc => fc.id !== flashcardId);
      setReviewFlashcards(updatedReviewFlashcards);
      
      refreshFlashcards();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la flashcard:', err);
    }
  };

  // Groupe les flashcards par tag
  const getFlashcardsByTag = () => {
    const tagGroups: { [key: string]: Flashcard[] } = {};
    
    allFlashcards.forEach(flashcard => {
      flashcard.tags.forEach(tag => {
        if (!tagGroups[tag]) {
          tagGroups[tag] = [];
        }
        tagGroups[tag].push(flashcard);
      });
    });
    
    return tagGroups;
  };

  const flashcardsByTag = getFlashcardsByTag();

  const isLoading = initialLoading || loading;
  const error_ = initialError || error;

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Flashcards
        </Typography>
        
        {error_ && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error_}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="flashcards tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="À réviser" />
            <Tab label="Toutes les flashcards" />
            {Object.keys(flashcardsByTag).map((tag, index) => (
              <Tab key={tag} label={tag} />
            ))}
          </Tabs>
        </Box>

        {/* Tab Panel: Flashcards à réviser */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Flashcards à réviser ({reviewFlashcards.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {reviewFlashcards.length === 0 ? (
            <Alert severity="success">
              Félicitations ! Vous avez terminé toutes vos révisions pour aujourd'hui.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {reviewFlashcards.map((flashcard) => (
                <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                  <FlashcardView
                    flashcard={flashcard}
                    onReview={handleReviewFlashcard}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Tab Panel: Toutes les flashcards */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Toutes les flashcards ({allFlashcards.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {allFlashcards.length === 0 ? (
            <Alert severity="info">
              Aucune flashcard disponible. Créez des notes avec l'agent de résumé de livre pour générer des flashcards.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {allFlashcards.map((flashcard) => (
                <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                  <FlashcardView
                    flashcard={flashcard}
                    onReview={handleReviewFlashcard}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Tab Panels pour chaque tag */}
        {Object.entries(flashcardsByTag).map(([tag, tagFlashcards], index) => (
          <TabPanel value={tabValue} index={index + 2} key={tag}>
            <Typography variant="h6" gutterBottom>
              {tag} ({tagFlashcards.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              {tagFlashcards.map((flashcard) => (
                <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                  <FlashcardView
                    flashcard={flashcard}
                    onReview={handleReviewFlashcard}
                  />
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        ))}
      </Box>
    </Container>
  );
};

export default FlashcardsPage; 
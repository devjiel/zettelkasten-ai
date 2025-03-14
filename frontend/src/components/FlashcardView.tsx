import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Box,
  Chip 
} from '@mui/material';
import { Flashcard } from '../types';
import { formatDate } from '../utils/formatters';

interface FlashcardViewProps {
  flashcard: Flashcard;
  onReview?: (flashcardId: string, remembered: boolean) => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcard, onReview }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleRemembered = () => {
    if (onReview && flashcard.id) {
      onReview(flashcard.id, true);
      setShowAnswer(false);
    }
  };

  const handleForgotten = () => {
    if (onReview && flashcard.id) {
      onReview(flashcard.id, false);
      setShowAnswer(false);
    }
  };

  return (
    <Card sx={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        {!showAnswer ? (
          <>
            <Typography variant="h6" component="div" gutterBottom>
              Question
            </Typography>
            <Typography variant="body1" sx={{ my: 2 }}>
              {flashcard.question}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" component="div" gutterBottom>
              Réponse
            </Typography>
            <Typography variant="body1" sx={{ my: 2 }}>
              {flashcard.answer}
            </Typography>
          </>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mt: 'auto' }}>
          {flashcard.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: 1 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          fullWidth
          onClick={handleFlip}
        >
          {showAnswer ? 'Voir la question' : 'Voir la réponse'}
        </Button>
        
        {showAnswer && onReview && (
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button 
              variant="contained" 
              color="error" 
              sx={{ flex: 1 }} 
              onClick={handleForgotten}
            >
              Je ne savais pas
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              sx={{ flex: 1 }} 
              onClick={handleRemembered}
            >
              Je savais
            </Button>
          </Box>
        )}
        
        {flashcard.lastReviewed && (
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-start', mt: 1 }}>
            Dernière révision : {formatDate(flashcard.lastReviewed)}
          </Typography>
        )}
      </CardActions>
    </Card>
  );
};

export default FlashcardView; 
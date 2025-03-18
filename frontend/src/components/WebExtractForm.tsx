import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useAgents } from '../contexts/AgentsContext';
import { WebExtractInput } from '../types';

interface WebExtractFormProps {
    onSubmit: () => void;
}

export const WebExtractForm: React.FC<WebExtractFormProps> = ({ onSubmit }) => {
    const { runWebExtract } = useAgents();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const input: WebExtractInput = {
                title,
                content
            };
            await runWebExtract(input);
            setTitle('');
            setContent('');
            onSubmit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Résumer un texte
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Titre"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        error={!!error}
                        helperText={error}
                        required
                        fullWidth
                        placeholder="Enter a title"
                    />
                    <TextField
                        label="Contenu"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        multiline
                        rows={10}
                        required
                        fullWidth
                        placeholder="Paste the content to summarize here"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Summarize'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
}; 
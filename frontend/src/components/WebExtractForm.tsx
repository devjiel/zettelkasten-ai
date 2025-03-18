import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { WebExtractInput } from '../types';
import { useAgents } from '../contexts/AgentsContext';

interface WebExtractFormProps {
    onSubmit: (taskId: string) => void;
}

export const WebExtractForm: React.FC<WebExtractFormProps> = ({ onSubmit }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { runWebExtract } = useAgents();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Valider l'URL
            new URL(url);

            const input: WebExtractInput = { url };
            const result = await runWebExtract(input);
            onSubmit(result.taskId);
            setUrl('');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Une erreur s'est produite");
            }
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Importer depuis le web
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="URL de la page"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        error={!!error}
                        helperText={error}
                        fullWidth
                        required
                        placeholder="https://example.com/article"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!url}
                    >
                        Extraire le contenu
                    </Button>
                </Box>
            </form>
        </Paper>
    );
}; 
import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Tooltip,
    FormControlLabel,
    Switch,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImport: (files: File[], options: ImportOptions) => Promise<void>;
}

interface ImportOptions {
    overwrite: boolean;
    skipDuplicates: boolean;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onImport }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState<ImportOptions>({
        overwrite: false,
        skipDuplicates: true,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setFiles([]);
        }
    }, [open]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        const markdownFiles = selectedFiles.filter(file =>
            file.type === 'text/markdown' || file.name.endsWith('.md')
        );

        if (markdownFiles.length !== selectedFiles.length) {
            setError('Certains fichiers ont été ignorés car ils ne sont pas au format Markdown (.md)');
        }

        setFiles(prevFiles => [...prevFiles, ...markdownFiles]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleImport = async () => {
        if (files.length === 0) {
            setError('Veuillez sélectionner au moins un fichier');
            return;
        }

        try {
            setImporting(true);
            setError(null);
            await onImport(files, options);
            onClose();
        } catch (err) {
            setError('Une erreur est survenue lors de l\'import');
        } finally {
            setImporting(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        const markdownFiles = droppedFiles.filter(file =>
            file.type === 'text/markdown' || file.name.endsWith('.md')
        );

        if (markdownFiles.length !== droppedFiles.length) {
            setError('Certains fichiers ont été ignorés car ils ne sont pas au format Markdown (.md)');
        }

        setFiles(prevFiles => [...prevFiles, ...markdownFiles]);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <Dialog
            open={open}
            onClose={!importing ? onClose : undefined}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Importer des notes</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Sélectionnez les fichiers Markdown (.md) à importer.
                    </Typography>
                    <Box
                        sx={{
                            border: '2px dashed #ccc',
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: 'background.default',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'primary.main',
                            },
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".md"
                            multiple
                            style={{ display: 'none' }}
                        />
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography>
                            Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={options.skipDuplicates}
                                onChange={(e) => setOptions({ ...options, skipDuplicates: e.target.checked })}
                            />
                        }
                        label="Ignorer les doublons"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={options.overwrite}
                                onChange={(e) => setOptions({ ...options, overwrite: e.target.checked })}
                                disabled={options.skipDuplicates}
                            />
                        }
                        label="Écraser les notes existantes"
                    />
                </Box>

                {files.length > 0 && (
                    <List>
                        {files.map((file, index) => (
                            <ListItem
                                key={index}
                                secondaryAction={
                                    <Tooltip title="Supprimer">
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleRemoveFile(index)}
                                            disabled={importing}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                }
                            >
                                <ListItemIcon>
                                    <CheckCircleIcon color="success" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.name}
                                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {importing && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={importing}>
                    Annuler
                </Button>
                <Button
                    onClick={handleImport}
                    variant="contained"
                    disabled={files.length === 0 || importing}
                >
                    Importer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportDialog; 
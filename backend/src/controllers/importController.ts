import { Request, Response } from 'express';
import { z } from 'zod';
import { noteService } from '../services/NoteService';
import { MarkdownService } from '../services/MarkdownService';
import { Note } from '../types/note';
import multer from 'multer';

// Configuration de multer pour le stockage temporaire des fichiers
const storage = multer.memoryStorage();
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accepter uniquement les fichiers .md
    if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 10 // Maximum 10 fichiers à la fois
    }
}).any();

// Middleware de gestion des erreurs Multer
export const handleMulterError = (err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Fichier trop volumineux. Taille maximale : 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Trop de fichiers. Maximum : 10 fichiers'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Champ de fichier inattendu. Utilisez le champ "file" pour l\'upload de fichiers'
            });
        }
        return res.status(400).json({
            message: 'Erreur lors de l\'upload du fichier',
            error: err.message
        });
    }
    next(err);
};

// Schéma de validation des options d'import
const ImportOptionsSchema = z.object({
    overwrite: z.boolean().default(false),
    skipDuplicates: z.boolean().default(true)
});

type ImportOptions = z.infer<typeof ImportOptionsSchema>;

// Fonction utilitaire pour parser les options
const parseImportOptions = (req: Request): ImportOptions => {
    try {
        const optionsJson = req.body.options;
        if (!optionsJson) {
            return ImportOptionsSchema.parse({});
        }
        const options = JSON.parse(optionsJson);
        return ImportOptionsSchema.parse(options);
    } catch (error) {
        console.error('Erreur lors du parsing des options:', error);
        return ImportOptionsSchema.parse({});
    }
};

const markdownService = MarkdownService.getInstance();

// Import d'une seule note
export const importNote = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        const file = req.files[0];
        const options = parseImportOptions(req);
        const fileContent = file.buffer.toString('utf-8');
        const parsedNote = markdownService.parseMarkdown(fileContent);

        // Vérifier si une note avec le même titre existe déjà
        const existingNote = await noteService.findNoteByTitle(parsedNote.title);

        if (existingNote) {
            if (options.skipDuplicates) {
                return res.status(200).json({
                    message: 'Note ignorée (doublon)',
                    note: existingNote
                });
            }
            if (!options.overwrite) {
                return res.status(409).json({
                    message: 'Une note avec ce titre existe déjà'
                });
            }
            // Mise à jour de la note existante
            const updatedNote = await noteService.updateNote(existingNote.id, parsedNote);
            return res.status(200).json({
                message: 'Note mise à jour avec succès',
                note: updatedNote
            });
        }

        // Création d'une nouvelle note
        const newNote = await noteService.createNote(parsedNote);
        res.status(201).json({
            message: 'Note importée avec succès',
            note: newNote
        });
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        res.status(500).json({
            message: 'Erreur lors de l\'import de la note',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Import de plusieurs notes
export const importMultipleNotes = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files)) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        const options = parseImportOptions(req);
        const results = {
            success: 0,
            skipped: 0,
            failed: 0,
            notes: [] as Note[]
        };

        for (const file of req.files) {
            try {
                const fileContent = file.buffer.toString('utf-8');
                const parsedNote = markdownService.parseMarkdown(fileContent);

                // Vérifier si une note avec le même titre existe déjà
                const existingNote = await noteService.findNoteByTitle(parsedNote.title);

                if (existingNote) {
                    if (options.skipDuplicates) {
                        results.skipped++;
                        continue;
                    }
                    if (!options.overwrite) {
                        results.failed++;
                        continue;
                    }
                    // Mise à jour de la note existante
                    const updatedNote = await noteService.updateNote(existingNote.id, parsedNote);
                    if (updatedNote) {
                        results.success++;
                        results.notes.push(updatedNote);
                    }
                } else {
                    // Création d'une nouvelle note
                    const newNote = await noteService.createNote(parsedNote);
                    results.success++;
                    results.notes.push(newNote);
                }
            } catch (error) {
                console.error(`Erreur lors de l'import du fichier ${file.originalname}:`, error);
                results.failed++;
            }
        }

        res.status(200).json({
            message: 'Import terminé',
            summary: results
        });
    } catch (error) {
        console.error('Erreur lors de l\'import multiple:', error);
        res.status(500).json({
            message: 'Erreur lors de l\'import des notes',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export default {
    importNote,
    importMultipleNotes,
    upload,
    handleMulterError
}; 
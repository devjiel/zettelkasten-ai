import { Request, Response } from 'express';
import { z } from 'zod';
import { MarkdownService } from '../services/MarkdownService';
import { NoteRepository } from '../storage/NoteRepository';
import { FlashcardRepository } from '../storage/FlashcardRepository';
import archiver from 'archiver';

const markdownService = MarkdownService.getInstance();
const noteRepo = NoteRepository.getInstance();
const flashcardRepo = FlashcardRepository.getInstance();

// Validation schema for bulk export request
const BulkExportSchema = z.object({
    noteIds: z.array(z.string())
});

export const exportController = {
    /**
     * Export a single note as Markdown
     * GET /api/notes/:id/export
     */
    async exportNote(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const note = await noteRepo.getNoteById(id);

            if (!note) {
                return res.status(404).json({
                    message: 'Note introuvable'
                });
            }

            const flashcards = await flashcardRepo.getFlashcardsByNoteId(id);
            const { markdown, filename } = markdownService.toMarkdown(note, flashcards);

            res.setHeader('Content-Type', 'text/markdown');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(markdown);
        } catch (error) {
            console.error('Erreur lors de l\'export de la note:', error);
            res.status(500).json({
                message: 'Erreur lors de l\'export de la note',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    /**
     * Export multiple notes as a zip file
     * POST /api/notes/export
     */
    async exportMultipleNotes(req: Request, res: Response) {
        try {
            const { noteIds } = BulkExportSchema.parse(req.body);

            // Get all requested notes
            const notes = await Promise.all(
                noteIds.map(id => noteRepo.getNoteById(id))
            );

            // Filter out any null values (notes not found)
            const validNotes = notes.filter((note): note is NonNullable<typeof note> => note !== null);

            if (validNotes.length === 0) {
                return res.status(404).json({ error: 'Aucune note valide trouvée' });
            }

            // Get flashcards for all notes
            const flashcardsMap = new Map();
            await Promise.all(
                validNotes.map(async note => {
                    const flashcards = await flashcardRepo.getFlashcardsByNoteId(note.id);
                    flashcardsMap.set(note.id, flashcards);
                })
            );

            // Export all notes
            const exports = markdownService.exportNotes(validNotes, flashcardsMap);

            // Create zip archive
            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression
            });

            // Set response headers
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="notes-export.zip"');

            // Pipe archive to response
            archive.pipe(res);

            // Add each note to the archive
            for (const [filename, content] of exports) {
                archive.append(content, { name: filename });
            }

            // Finalize archive
            await archive.finalize();
        } catch (error) {
            console.error('Erreur lors de l\'export des notes:', error);
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Format de requête invalide' });
            }
            return res.status(500).json({ error: 'Échec de l\'export des notes' });
        }
    },

    async exportAllNotes(req: Request, res: Response) {
        try {
            const notes = await noteRepo.getAllNotes();

            if (notes.length === 0) {
                return res.status(404).json({
                    message: 'Aucune note trouvée'
                });
            }

            // Get flashcards for all notes
            const flashcardsMap = new Map();
            await Promise.all(
                notes.map(async note => {
                    const flashcards = await flashcardRepo.getFlashcardsByNoteId(note.id);
                    flashcardsMap.set(note.id, flashcards);
                })
            );

            const markdown = markdownService.toMarkdownCollection(notes, flashcardsMap);

            res.setHeader('Content-Type', 'text/markdown');
            res.setHeader('Content-Disposition', 'attachment; filename="all_notes.md"');
            res.send(markdown);
        } catch (error) {
            console.error('Erreur lors de l\'export des notes:', error);
            res.status(500).json({
                message: 'Erreur lors de l\'export des notes',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}; 
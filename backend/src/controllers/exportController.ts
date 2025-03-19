import { Request, Response } from 'express';
import { z } from 'zod';
import { MarkdownExportService } from '../services/MarkdownExportService';
import { NoteRepository } from '../storage/NoteRepository';
import archiver from 'archiver';

const exportService = MarkdownExportService.getInstance();
const noteRepo = NoteRepository.getInstance();

// Validation schema for bulk export request
const BulkExportSchema = z.object({
    noteIds: z.array(z.string())
});

export const exportController = {
    /**
     * Export a single note as Markdown
     * GET /api/notes/:id/export
     */
    async exportSingleNote(req: Request, res: Response) {
        try {
            const noteId = req.params.id;
            const note = await noteRepo.getNoteById(noteId);

            if (!note) {
                return res.status(404).json({ error: 'Note introuvable' });
            }

            const markdown = await exportService.exportNote(note);
            const filename = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';

            res.setHeader('Content-Type', 'text/markdown');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(markdown);
        } catch (error) {
            console.error('Erreur lors de l\'export de la note:', error);
            return res.status(500).json({ error: 'Échec de l\'export de la note' });
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
            const validNotes = notes.filter(note => note !== null);

            if (validNotes.length === 0) {
                return res.status(404).json({ error: 'Aucune note valide trouvée' });
            }

            // Export all notes
            const exports = await exportService.exportNotes(validNotes);

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

    /**
     * Export all notes as a zip file
     * GET /api/notes/export-all
     */
    async exportAllNotes(req: Request, res: Response) {
        try {
            // Get all notes
            const notes = await noteRepo.getAllNotes();

            if (notes.length === 0) {
                return res.status(404).json({ error: 'Aucune note trouvée' });
            }

            // Export all notes
            const exports = await exportService.exportNotes(notes);

            // Create zip archive
            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression
            });

            // Set response headers
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="all-notes-export.zip"');

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
            return res.status(500).json({ error: 'Échec de l\'export des notes' });
        }
    }
}; 
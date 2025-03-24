import { Note } from '../types/note'
import { FlashcardRepository, Flashcard } from '../storage/FlashcardRepository'
import yaml from 'yaml';
import { NoteRepository } from '../storage/NoteRepository';

export class MarkdownExportService {
    private static instance: MarkdownExportService;
    private noteRepo: NoteRepository;
    private flashcardRepo: FlashcardRepository;

    private constructor() {
        this.noteRepo = NoteRepository.getInstance();
        this.flashcardRepo = FlashcardRepository.getInstance();
    }

    public static getInstance(): MarkdownExportService {
        if (!MarkdownExportService.instance) {
            MarkdownExportService.instance = new MarkdownExportService();
        }
        return MarkdownExportService.instance;
    }

    private formatFrontMatter(note: Note): string {
        const frontMatter: Record<string, any> = {
            title: note.title,
            tags: note.tags,
            createdAt: note.metadata?.createdAt || new Date().toISOString(),
            updatedAt: note.metadata?.updatedAt || new Date().toISOString(),
            ...note.metadata
        };

        // On retire ces champs car ils sont déjà au premier niveau
        if ('createdAt' in frontMatter) delete frontMatter.createdAt;
        if ('updatedAt' in frontMatter) delete frontMatter.updatedAt;

        return yaml.stringify(frontMatter).trim();
    }

    private createFilename(note: Note): string {
        return note.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '.md';
    }

    private formatFlashcards(flashcards: Flashcard[]): string {
        if (flashcards.length === 0) {
            return '';
        }

        return flashcards.map(fc => (
            `### Question\n${fc.question}\n\n### Réponse\n${fc.answer}`
        )).join('\n\n');
    }

    public async exportNote(noteId: string): Promise<{ markdown: string; filename: string }> {
        const note = await this.noteRepo.getNoteById(noteId);
        if (!note) {
            throw new Error('Note non trouvée');
        }

        const flashcards = await this.flashcardRepo.getFlashcardsByNoteId(noteId);
        const markdown = this.formatNote(note, flashcards);
        const filename = this.createFilename(note);

        return { markdown, filename };
    }

    public async exportAllNotes(): Promise<string> {
        const notes = await this.noteRepo.getAllNotes();
        if (notes.length === 0) {
            throw new Error('Aucune note trouvée');
        }

        const exports = await Promise.all(
            notes.map(async note => {
                const flashcards = await this.flashcardRepo.getFlashcardsByNoteId(note.id);
                return this.formatNote(note, flashcards);
            })
        );

        return exports.join('\n\n---\n\n');
    }

    private formatNote(note: Note, flashcards: Flashcard[]): string {
        const sections = [
            '---',
            this.formatFrontMatter(note),
            '---',
            '',
            '# ' + note.title,
            ''
        ];

        // Ajouter les tags s'il y en a
        if (note.tags.length > 0) {
            sections.push('## Tags');
            sections.push('');
            sections.push(note.tags.map(tag => `- ${tag}`).join('\n'));
            sections.push('');
        }

        // Ajouter le contenu principal
        sections.push('## Contenu');
        sections.push('');
        sections.push(note.content.trim());

        // Ajouter les flashcards s'il y en a
        if (flashcards.length > 0) {
            sections.push('');
            sections.push('## Flashcards');
            sections.push('');
            sections.push(this.formatFlashcards(flashcards));
        }

        // Ajouter les métadonnées
        sections.push('');
        sections.push('## Métadonnées');
        sections.push('');
        sections.push(`- Date de création : ${note.metadata?.createdAt || new Date().toISOString()}`);
        sections.push(`- Dernière modification : ${note.metadata?.updatedAt || new Date().toISOString()}`);

        // Ajouter les autres métadonnées s'il y en a
        const otherMetadata = { ...note.metadata };
        delete otherMetadata.createdAt;
        delete otherMetadata.updatedAt;

        if (Object.keys(otherMetadata).length > 0) {
            Object.entries(otherMetadata).forEach(([key, value]) => {
                sections.push(`- ${key} : ${value}`);
            });
        }

        return sections.join('\n');
    }

    public async exportNotes(notes: Note[]): Promise<Map<string, string>> {
        const exports = new Map<string, string>();

        for (const note of notes) {
            const flashcards = await this.flashcardRepo.getFlashcardsByNoteId(note.id);
            const content = this.formatNote(note, flashcards);
            const filename = this.createFilename(note);
            exports.set(filename, content);
        }

        return exports;
    }
} 
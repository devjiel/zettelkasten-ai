import { Note } from '../types/note'
import { FlashcardRepository, Flashcard } from '../storage/FlashcardRepository'

export class MarkdownExportService {
    private static instance: MarkdownExportService;
    private flashcardRepo: FlashcardRepository;

    private constructor() {
        this.flashcardRepo = FlashcardRepository.getInstance();
    }

    public static getInstance(): MarkdownExportService {
        if (!MarkdownExportService.instance) {
            MarkdownExportService.instance = new MarkdownExportService();
        }
        return MarkdownExportService.instance;
    }

    private generateYAMLFrontmatter(note: Note): string {
        const frontmatter = {
            title: note.title,
            tags: note.tags,
            created_at: note.metadata?.createdAt || new Date().toISOString(),
            updated_at: note.metadata?.updatedAt || new Date().toISOString(),
            ...note.metadata
        };

        const yamlLines = Object.entries(frontmatter)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
                }
                return `${key}: "${value}"`;
            });

        return ['---', ...yamlLines, '---'].join('\n');
    }

    private formatContent(content: string): string {
        // Supprime les espaces et sauts de ligne inutiles
        return content.trim()
            .replace(/\n{3,}/g, '\n\n') // Remplace les multiples sauts de ligne par deux
            .replace(/\s+$/gm, ''); // Supprime les espaces en fin de ligne
    }

    private createFilename(note: Note): string {
        // Crée un nom de fichier sécurisé basé sur le titre
        return note.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères non alphanumériques par des tirets
            .replace(/^-+|-+$/g, '') // Supprime les tirets au début et à la fin
            + '.md';
    }

    private async formatFlashcards(flashcards: Flashcard[]): Promise<string> {
        if (flashcards.length === 0) {
            return '';
        }

        const lines = [
            '\n## Flashcards\n',
            ...flashcards.map((fc, index) => [
                `### Flashcard ${index + 1}`,
                '**Question:**',
                fc.question,
                '',
                '**Réponse:**',
                fc.answer,
                ''
            ].join('\n'))
        ];

        return lines.join('\n');
    }

    public async exportNote(note: Note): Promise<string> {
        // Récupérer les flashcards associées à la note
        const flashcards = await this.flashcardRepo.getFlashcardsByNoteId(note.id!);

        const parts = [
            this.generateYAMLFrontmatter(note),
            '',
            this.formatContent(note.content)
        ];

        // Ajouter les flashcards si elles existent
        if (flashcards.length > 0) {
            parts.push(await this.formatFlashcards(flashcards));
        }

        return parts.join('\n');
    }

    public async exportNotes(notes: Note[]): Promise<Map<string, string>> {
        const exports = new Map<string, string>();

        for (const note of notes) {
            const content = await this.exportNote(note);
            const filename = this.createFilename(note);
            exports.set(filename, content);
        }

        return exports;
    }
} 
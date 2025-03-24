import { Note } from '../types/note';
import { Flashcard } from '../storage/FlashcardRepository';
import matter from 'gray-matter';
import yaml from 'yaml';

// Structure d'une section Markdown
interface MarkdownSection {
    title: string;
    content: string;
}

export class MarkdownService {
    private static instance: MarkdownService;

    private constructor() { }

    public static getInstance(): MarkdownService {
        if (!MarkdownService.instance) {
            MarkdownService.instance = new MarkdownService();
        }
        return MarkdownService.instance;
    }

    // Méthodes d'export
    public toMarkdown(note: Note, flashcards: Flashcard[]): { markdown: string; filename: string } {
        const markdown = this.noteToMarkdown(note, flashcards);
        const filename = this.createFilename(note);

        return { markdown, filename };
    }

    public toMarkdownCollection(notes: Note[], flashcardsMap: Map<string, Flashcard[]>): string {
        if (notes.length === 0) {
            throw new Error('Aucune note fournie');
        }

        const exports = notes.map(note => {
            const flashcards = flashcardsMap.get(note.id) || [];
            return this.noteToMarkdown(note, flashcards);
        });

        return exports.join('\n\n---\n\n');
    }

    public exportNotes(notes: Note[], flashcardsMap: Map<string, Flashcard[]>): Map<string, string> {
        const exports = new Map<string, string>();

        for (const note of notes) {
            const flashcards = flashcardsMap.get(note.id) || [];
            const content = this.noteToMarkdown(note, flashcards);
            const filename = this.createFilename(note);
            exports.set(filename, content);
        }

        return exports;
    }

    // Méthodes d'import
    public parseMarkdown(content: string): Omit<Note, 'id'> {
        const { data, content: markdownContent } = matter(content);
        const sections = this.parseMarkdownSections(markdownContent);

        // Extraire les tags de la section dédiée s'ils existent
        const tagsSection = sections.find(s => s.title === 'Tags');
        const tags = tagsSection
            ? this.parseListItems(tagsSection.content)
            : (Array.isArray(data.tags) ? data.tags : []);

        // Extraire le contenu principal
        const contentSection = sections.find(s => s.title === 'Contenu');
        const mainContent = contentSection ? contentSection.content : markdownContent;

        // Extraire les métadonnées
        const metadataSection = sections.find(s => s.title === 'Métadonnées');
        const metadata = this.parseMetadata(metadataSection?.content || '', data);

        return {
            title: data.title || sections[0]?.content || 'Sans titre',
            content: mainContent.trim(),
            tags,
            metadata
        };
    }

    // Méthodes privées pour l'export
    private noteToMarkdown(note: Note, flashcards: Flashcard[]): string {
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

    private formatFrontMatter(note: Note): string {
        const frontMatter: Record<string, unknown> = {
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

    private formatFlashcards(flashcards: Flashcard[]): string {
        if (flashcards.length === 0) return '';

        return flashcards.map(fc => (
            `### Question\n${fc.question}\n\n### Réponse\n${fc.answer}`
        )).join('\n\n');
    }

    private createFilename(note: Note): string {
        return note.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '.md';
    }

    // Méthodes privées pour l'import
    private parseMarkdownSections(content: string): MarkdownSection[] {
        const sections: MarkdownSection[] = [];
        const lines = content.split('\n');
        let currentSection: MarkdownSection | null = null;

        for (const line of lines) {
            if (line.startsWith('## ')) {
                if (currentSection) {
                    sections.push({
                        title: currentSection.title,
                        content: currentSection.content.trim()
                    });
                }
                currentSection = {
                    title: line.substring(3).trim(),
                    content: ''
                };
            } else if (currentSection) {
                currentSection.content += line + '\n';
            }
        }

        if (currentSection) {
            sections.push({
                title: currentSection.title,
                content: currentSection.content.trim()
            });
        }

        return sections;
    }

    private parseListItems(content: string): string[] {
        return content
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.substring(line.indexOf('-') + 1).trim());
    }

    private parseMetadata(content: string, frontmatter: any): Record<string, any> {
        const metadata: Record<string, any> = {
            createdAt: frontmatter.createdAt || new Date().toISOString(),
            updatedAt: frontmatter.updatedAt || new Date().toISOString()
        };

        // Parser les métadonnées de la section dédiée
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.includes(':')) {
                const [key, value] = line.split(':').map(s => s.trim());
                if (key.startsWith('- ')) {
                    const cleanKey = key.substring(2);
                    metadata[cleanKey] = value;
                }
            }
        }

        // Ajouter les autres métadonnées du frontmatter
        for (const [key, value] of Object.entries(frontmatter)) {
            if (!['title', 'tags', 'createdAt', 'updatedAt'].includes(key)) {
                metadata[key] = value;
            }
        }

        return metadata;
    }
} 
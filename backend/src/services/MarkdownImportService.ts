import { Note } from '../types/note';
import { Flashcard } from '../storage/FlashcardRepository';
import { MarkdownParseResult, MarkdownParseError, MarkdownImportResult } from '../types/markdown';
import { v4 as uuidv4 } from 'uuid';
import yaml from 'yaml';

export class MarkdownImportService {
    private static instance: MarkdownImportService;

    private constructor() { }

    public static getInstance(): MarkdownImportService {
        if (!MarkdownImportService.instance) {
            MarkdownImportService.instance = new MarkdownImportService();
        }
        return MarkdownImportService.instance;
    }

    /**
     * Parse le contenu d'un fichier Markdown et extrait les données
     */
    public parseMarkdown(content: string): MarkdownParseResult {
        const errors: MarkdownParseError[] = [];
        let currentLine = 1;

        try {
            // Vérifier si le contenu commence par un frontmatter YAML
            if (!content.startsWith('---')) {
                errors.push({
                    line: 1,
                    message: 'Le fichier doit commencer par un frontmatter YAML (---)',
                    type: 'error'
                });
                return { success: false, errors };
            }

            // Extraire le frontmatter
            const frontmatterMatch = content.match(/^---([\s\S]*?)---/);
            if (!frontmatterMatch) {
                errors.push({
                    line: 1,
                    message: 'Frontmatter YAML invalide ou manquant',
                    type: 'error'
                });
                return { success: false, errors };
            }

            // Parser le frontmatter
            const frontmatter = yaml.parse(frontmatterMatch[1]);
            currentLine = frontmatterMatch[0].split('\n').length;

            // Valider les champs requis
            if (!frontmatter.title) {
                errors.push({
                    line: currentLine,
                    message: 'Le titre est requis dans le frontmatter',
                    type: 'error'
                });
            }

            // Extraire le contenu principal
            const mainContent = content.slice(frontmatterMatch[0].length).trim();
            const sections = this.parseSections(mainContent);
            currentLine += mainContent.split('\n').length;

            // Créer la note
            const note: Note = {
                id: uuidv4(),
                title: frontmatter.title,
                content: sections.content,
                tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
                metadata: {
                    createdAt: frontmatter.created_at || new Date().toISOString(),
                    updatedAt: frontmatter.updated_at || new Date().toISOString(),
                    ...frontmatter
                }
            };

            // Parser les flashcards
            const flashcards = this.parseFlashcards(sections.flashcards, note.id);

            if (errors.length > 0) {
                return {
                    success: false,
                    errors,
                    data: { note, flashcards }
                };
            }

            return {
                success: true,
                errors: [],
                data: { note, flashcards }
            };

        } catch (error: any) {
            errors.push({
                line: currentLine,
                message: `Erreur lors du parsing: ${error.message}`,
                type: 'error'
            });
            return { success: false, errors };
        }
    }

    /**
     * Parse les différentes sections du contenu Markdown
     */
    private parseSections(content: string): { content: string, flashcards: string } {
        const flashcardsIndex = content.indexOf('## Flashcards');

        if (flashcardsIndex === -1) {
            return {
                content: content.trim(),
                flashcards: ''
            };
        }

        return {
            content: content.slice(0, flashcardsIndex).trim(),
            flashcards: content.slice(flashcardsIndex).trim()
        };
    }

    /**
     * Parse la section des flashcards et crée les objets correspondants
     */
    private parseFlashcards(content: string, noteId: string): Flashcard[] {
        if (!content) return [];

        const flashcards: Flashcard[] = [];
        const flashcardBlocks = content.split(/(?=### Flashcard \d+)/);

        for (const block of flashcardBlocks) {
            if (!block.trim()) continue;

            const questionMatch = block.match(/\*\*Question:\*\*\s*([\s\S]*?)(?=\*\*Réponse:\*\*|$)/);
            const answerMatch = block.match(/\*\*Réponse:\*\*\s*([\s\S]*?)(?=### Flashcard|\s*$)/);

            if (questionMatch && answerMatch) {
                flashcards.push({
                    id: uuidv4(),
                    question: questionMatch[1].trim(),
                    answer: answerMatch[1].trim(),
                    tags: [],
                    sourceNoteId: noteId,
                    reviewCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        return flashcards;
    }

    /**
     * Valide le format d'un fichier Markdown
     */
    public validateMarkdown(content: string): MarkdownParseError[] {
        const errors: MarkdownParseError[] = [];
        let currentLine = 1;

        // Vérifier la présence du frontmatter
        if (!content.startsWith('---')) {
            errors.push({
                line: 1,
                message: 'Le fichier doit commencer par un frontmatter YAML (---)',
                type: 'error'
            });
        }

        // Vérifier la structure du frontmatter
        const frontmatterMatch = content.match(/^---([\s\S]*?)---/);
        if (!frontmatterMatch) {
            errors.push({
                line: 1,
                message: 'Frontmatter YAML invalide ou manquant',
                type: 'error'
            });
            return errors;
        }

        try {
            const frontmatter = yaml.parse(frontmatterMatch[1]);
            currentLine = frontmatterMatch[0].split('\n').length;

            // Vérifier les champs requis
            if (!frontmatter.title) {
                errors.push({
                    line: currentLine,
                    message: 'Le titre est requis dans le frontmatter',
                    type: 'error'
                });
            }

            if (!frontmatter.tags || !Array.isArray(frontmatter.tags)) {
                errors.push({
                    line: currentLine,
                    message: 'Les tags doivent être un tableau',
                    type: 'warning'
                });
            }

            // Vérifier les dates
            if (frontmatter.created_at && isNaN(Date.parse(frontmatter.created_at))) {
                errors.push({
                    line: currentLine,
                    message: 'Le format de created_at est invalide',
                    type: 'warning'
                });
            }

            if (frontmatter.updated_at && isNaN(Date.parse(frontmatter.updated_at))) {
                errors.push({
                    line: currentLine,
                    message: 'Le format de updated_at est invalide',
                    type: 'warning'
                });
            }
        } catch (error: any) {
            errors.push({
                line: currentLine,
                message: `Erreur de parsing YAML: ${error.message}`,
                type: 'error'
            });
        }

        return errors;
    }
} 
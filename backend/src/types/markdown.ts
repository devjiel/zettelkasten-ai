import { Note } from './note';
import { Flashcard } from '../storage/FlashcardRepository';

export interface MarkdownImportResult {
    note: Note;
    flashcards: Flashcard[];
}

export interface MarkdownParseError {
    line: number;
    message: string;
    type: 'error' | 'warning';
}

export interface MarkdownParseResult {
    success: boolean;
    data?: MarkdownImportResult;
    errors: MarkdownParseError[];
} 
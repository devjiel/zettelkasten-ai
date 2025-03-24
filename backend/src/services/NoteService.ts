import { Note } from '../types/note';
import { NoteRepository } from '../storage/NoteRepository';

class NoteService {
    private static instance: NoteService;
    private noteRepo: NoteRepository;

    private constructor() {
        this.noteRepo = NoteRepository.getInstance();
    }

    public static getInstance(): NoteService {
        if (!NoteService.instance) {
            NoteService.instance = new NoteService();
        }
        return NoteService.instance;
    }

    async createNote(note: Omit<Note, 'id'>): Promise<Note> {
        return this.noteRepo.createNote(note);
    }

    async updateNote(id: string, note: Partial<Note>): Promise<Note | null> {
        return this.noteRepo.updateNote(id, note);
    }

    async findNoteByTitle(title: string): Promise<Note | null> {
        const notes = await this.noteRepo.searchNotes(title);
        return notes.find(note => note.title.toLowerCase() === title.toLowerCase()) || null;
    }
}

export const noteService = NoteService.getInstance(); 
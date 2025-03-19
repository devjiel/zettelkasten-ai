import { InMemoryStorage } from './InMemoryStorage';
import { Note } from '../types/note';

/**
 * Repository pour les notes
 */
export class NoteRepository {
  private static instance: NoteRepository;
  private storage: InMemoryStorage<Note>;

  private constructor() {
    this.storage = new InMemoryStorage<Note>('notes');
  }

  /**
   * Obtenir l'instance unique du repository (pattern Singleton)
   */
  public static getInstance(): NoteRepository {
    if (!NoteRepository.instance) {
      NoteRepository.instance = new NoteRepository();
    }
    return NoteRepository.instance;
  }

  /**
  * Obtenir accès au stockage interne (pour la migration future)
  */
  public getStorage(): InMemoryStorage<Note> {
    return this.storage;
  }

  /**
   * Créer une nouvelle note
   */
  public async createNote(noteData: Omit<Note, 'id'>): Promise<Note> {
    const now = new Date().toISOString();
    const note: Note = {
      ...noteData,
      id: Math.random().toString(36).substring(2, 15),
      metadata: {
        ...noteData.metadata,
        createdAt: now,
        updatedAt: now
      }
    };
    return this.storage.create(note);
  }

  /**
   * Récupérer toutes les notes
   */
  public async getAllNotes(): Promise<Note[]> {
    return this.storage.findAll();
  }

  /**
   * Récupérer une note par son ID
   */
  public async getNoteById(id: string): Promise<Note | null> {
    return this.storage.findById(id);
  }

  /**
   * Mettre à jour une note
   */
  public async updateNote(id: string, noteData: Partial<Omit<Note, 'id'>>): Promise<Note | null> {
    const existingNote = await this.storage.findById(id);
    if (!existingNote) {
      return null;
    }

    const updatedNote: Note = {
      ...existingNote,
      ...noteData,
      metadata: {
        ...existingNote.metadata,
        ...noteData.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    return this.storage.updateById(id, updatedNote);
  }

  /**
   * Supprimer une note
   */
  public async deleteNote(id: string): Promise<boolean> {
    return this.storage.deleteById(id);
  }

  /**
   * Rechercher des notes par mots-clés
   */
  public async searchNotes(searchTerm: string): Promise<Note[]> {
    const allNotes = await this.storage.findAll();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allNotes.filter(note => {
      return (
        note.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        note.content.toLowerCase().includes(lowerCaseSearchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))
      );
    });
  }

  /**
   * Récupérer des notes par tag
   */
  public async getNotesByTag(tag: string): Promise<Note[]> {
    const allNotes = await this.storage.findAll();
    return allNotes.filter(note => note.tags.includes(tag));
  }
} 
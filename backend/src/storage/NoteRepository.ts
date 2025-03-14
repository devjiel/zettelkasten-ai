import { InMemoryStorage, StorageItem } from './InMemoryStorage';

/**
 * Interface pour les notes
 */
export interface Note extends StorageItem {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  references?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Repository pour les notes
 */
export class NoteRepository {
  private storage: InMemoryStorage<Note>;
  private static instance: NoteRepository;

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
  async createNote(note: Note): Promise<Note> {
    return this.storage.create(note);
  }

  /**
   * Récupérer une note par son ID
   */
  async getNoteById(id: string): Promise<Note | null> {
    return this.storage.findById(id);
  }

  /**
   * Récupérer toutes les notes
   */
  async getAllNotes(): Promise<Note[]> {
    return this.storage.findAll();
  }

  /**
   * Rechercher des notes par mots-clés
   */
  async searchNotes(searchTerm: string): Promise<Note[]> {
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
  async getNotesByTag(tag: string): Promise<Note[]> {
    const allNotes = await this.storage.findAll();
    return allNotes.filter(note => note.tags.includes(tag));
  }

  /**
   * Mettre à jour une note
   */
  async updateNote(id: string, noteUpdate: Partial<Note>): Promise<Note | null> {
    return this.storage.updateById(id, noteUpdate);
  }

  /**
   * Supprimer une note
   */
  async deleteNote(id: string): Promise<boolean> {
    return this.storage.deleteById(id);
  }
} 
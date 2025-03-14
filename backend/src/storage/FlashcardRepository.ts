import { InMemoryStorage, StorageItem } from './InMemoryStorage';

/**
 * Interface pour les flashcards
 */
export interface Flashcard extends StorageItem {
  id?: string;
  question: string;
  answer: string;
  tags: string[];
  sourceNoteId: string;
  lastReviewed?: Date;
  reviewCount: number;
  nextReviewDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Repository pour les flashcards
 */
export class FlashcardRepository {
  private storage: InMemoryStorage<Flashcard>;
  private static instance: FlashcardRepository;

  private constructor() {
    this.storage = new InMemoryStorage<Flashcard>('flashcards');
  }

  /**
   * Obtenir l'instance unique du repository (pattern Singleton)
   */
  public static getInstance(): FlashcardRepository {
    if (!FlashcardRepository.instance) {
      FlashcardRepository.instance = new FlashcardRepository();
    }
    return FlashcardRepository.instance;
  }

  /**
   * Obtenir accès au stockage interne (pour la migration future)
   */
  public getStorage(): InMemoryStorage<Flashcard> {
    return this.storage;
  }

  /**
   * Créer une nouvelle flashcard
   */
  async createFlashcard(flashcard: Flashcard): Promise<Flashcard> {
    const newFlashcard = {
      ...flashcard,
      reviewCount: flashcard.reviewCount || 0
    };
    return this.storage.create(newFlashcard);
  }

  /**
   * Créer plusieurs flashcards en une fois
   */
  async createFlashcards(flashcards: Flashcard[]): Promise<Flashcard[]> {
    const createdFlashcards: Flashcard[] = [];
    
    for (const flashcard of flashcards) {
      const createdFlashcard = await this.createFlashcard(flashcard);
      createdFlashcards.push(createdFlashcard);
    }
    
    return createdFlashcards;
  }

  /**
   * Récupérer une flashcard par son ID
   */
  async getFlashcardById(id: string): Promise<Flashcard | null> {
    return this.storage.findById(id);
  }

  /**
   * Récupérer toutes les flashcards
   */
  async getAllFlashcards(): Promise<Flashcard[]> {
    return this.storage.findAll();
  }

  /**
   * Récupérer les flashcards d'une note spécifique
   */
  async getFlashcardsByNoteId(noteId: string): Promise<Flashcard[]> {
    const allFlashcards = await this.storage.findAll();
    return allFlashcards.filter(flashcard => flashcard.sourceNoteId === noteId);
  }

  /**
   * Récupérer les flashcards à réviser aujourd'hui
   */
  async getFlashcardsForReview(): Promise<Flashcard[]> {
    const allFlashcards = await this.storage.findAll();
    const now = new Date();
    
    return allFlashcards.filter(flashcard => {
      if (!flashcard.nextReviewDate) {
        return true; // Jamais révisée
      }
      return new Date(flashcard.nextReviewDate) <= now;
    });
  }

  /**
   * Mettre à jour une flashcard après révision
   */
  async updateFlashcardAfterReview(id: string, remembered: boolean): Promise<Flashcard | null> {
    const flashcard = await this.storage.findById(id);
    
    if (!flashcard) {
      return null;
    }
    
    // Système de répétition espacée simplifié
    const reviewCount = flashcard.reviewCount + 1;
    const now = new Date();
    
    let nextReviewDays = 1;
    if (remembered) {
      // Formule simple: 2^n jours si la carte est bien mémorisée
      nextReviewDays = Math.pow(2, Math.min(reviewCount, 10));
    }
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(now.getDate() + nextReviewDays);
    
    return this.storage.updateById(id, {
      lastReviewed: now,
      reviewCount,
      nextReviewDate
    });
  }

  /**
   * Mettre à jour une flashcard
   */
  async updateFlashcard(id: string, update: Partial<Flashcard>): Promise<Flashcard | null> {
    return this.storage.updateById(id, update);
  }

  /**
   * Supprimer une flashcard
   */
  async deleteFlashcard(id: string): Promise<boolean> {
    return this.storage.deleteById(id);
  }

  /**
   * Supprimer toutes les flashcards liées à une note
   */
  async deleteFlashcardsByNoteId(noteId: string): Promise<number> {
    const flashcards = await this.getFlashcardsByNoteId(noteId);
    let deletedCount = 0;
    
    for (const flashcard of flashcards) {
      if (await this.deleteFlashcard(flashcard.id!)) {
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
} 
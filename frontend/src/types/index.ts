// Types pour les notes
export interface Note {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  references?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les flashcards
export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  tags: string[];
  sourceNoteId: string;
  lastReviewed?: string;
  reviewCount: number;
  nextReviewDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Statut des tâches
export enum TaskStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

// Type pour les tâches d'agent
export interface Task {
  id?: string;
  agentType: string;
  input: any;
  output?: any;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Input pour le résumé de livre
export interface BookSummaryInput {
  bookTitle: string;
  bookAuthor: string;
}

// Type pour le résumé de livre
export interface BookSummaryResult {
  bookTitle: string;
  bookAuthor: string;
  summary: string;
  keyPoints: string[];
  flashcards: {
    question: string;
    answer: string;
  }[];
} 
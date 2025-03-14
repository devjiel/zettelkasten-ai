import { InMemoryStorage, StorageItem } from './InMemoryStorage';
import { TaskStatus } from '../types/common';

/**
 * Interface pour les tâches des agents
 */
export interface Task extends StorageItem {
  agentType: string;
  input: any;
  output?: any;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Repository pour les tâches des agents
 */
export class TaskRepository {
  private storage: InMemoryStorage<Task>;
  private static instance: TaskRepository;

  private constructor() {
    this.storage = new InMemoryStorage<Task>('tasks');
  }

  /**
   * Obtenir l'instance unique du repository (pattern Singleton)
   */
  public static getInstance(): TaskRepository {
    if (!TaskRepository.instance) {
      TaskRepository.instance = new TaskRepository();
    }
    return TaskRepository.instance;
  }

  /**
   * Obtenir accès au stockage interne (pour la migration future)
   */
  public getStorage(): InMemoryStorage<Task> {
    return this.storage;
  }

  /**
   * Créer une nouvelle tâche
   */
  async createTask(agentType: string, input: any): Promise<Task> {
    const task: Task = {
      agentType,
      input,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return this.storage.create(task);
  }

  /**
   * Récupérer une tâche par son ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    return this.storage.findById(id);
  }

  /**
   * Récupérer toutes les tâches
   */
  async getAllTasks(): Promise<Task[]> {
    return this.storage.findAll();
  }

  /**
   * Récupérer les tâches en cours
   */
  async getPendingAndProcessingTasks(): Promise<Task[]> {
    const allTasks = await this.storage.findAll();
    return allTasks.filter(task => 
      task.status === TaskStatus.PENDING || 
      task.status === TaskStatus.PROCESSING
    );
  }

  /**
   * Mettre à jour le statut d'une tâche
   */
  async updateTaskStatus(id: string, status: TaskStatus, output?: any): Promise<Task | null> {
    const update: Partial<Task> = {
      status,
      updatedAt: new Date()
    };
    
    if (output) {
      update.output = output;
    }
    
    if (status === TaskStatus.COMPLETED) {
      update.completedAt = new Date();
    }
    
    return this.storage.updateById(id, update);
  }

  /**
   * Mettre à jour une tâche
   */
  async updateTask(id: string, update: Partial<Task>): Promise<Task | null> {
    return this.storage.updateById(id, update);
  }

  /**
   * Supprimer une tâche
   */
  async deleteTask(id: string): Promise<boolean> {
    return this.storage.deleteById(id);
  }

  /**
   * Nettoyer les tâches anciennes et terminées
   */
  async cleanupCompletedTasks(olderThanDays: number = 7): Promise<number> {
    const allTasks = await this.storage.findAll();
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - olderThanDays));
    
    let deletedCount = 0;
    
    for (const task of allTasks) {
      if (
        (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) &&
        task.updatedAt && new Date(task.updatedAt) < cutoffDate
      ) {
        if (await this.deleteTask(task.id!)) {
          deletedCount++;
        }
      }
    }
    
    return deletedCount;
  }
} 
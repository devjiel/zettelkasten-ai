import { v4 as uuidv4 } from 'uuid';
import { PersistenceService } from './PersistenceService';

/**
 * Generic interface for stored objects
 */
export interface StorageItem {
  id?: string;
  [key: string]: any;
}

/**
 * In-memory storage class with persistence
 */
export class InMemoryStorage<T extends StorageItem> {
  private items: Map<string, T>;
  private collectionName: string;
  private persistenceService: PersistenceService;

  constructor(collectionName: string) {
    this.items = new Map<string, T>();
    this.collectionName = collectionName;
    this.persistenceService = PersistenceService.getInstance();
    
    // Charger les données depuis le stockage persistant
    this.loadFromStorage();
    
    console.log(`Collection ${collectionName} initialized in memory`);
  }

  /**
   * Charge les données depuis le stockage persistant
   */
  private loadFromStorage(): void {
    const persistedItems = this.persistenceService.loadData<T>(this.collectionName);
    
    if (persistedItems.length > 0) {
      // Convertir la liste en Map
      persistedItems.forEach(item => {
        if (item.id) {
          this.items.set(item.id, item);
        }
      });
      console.log(`${persistedItems.length} éléments chargés dans la collection ${this.collectionName}`);
    }
  }

  /**
   * Enregistre les données dans le stockage persistant
   */
  public saveToStorage(): void {
    const itemsArray = Array.from(this.items.values());
    this.persistenceService.saveData(this.collectionName, itemsArray);
  }

  /**
   * Adds an item to the collection
   */
  async create(item: T): Promise<T> {
    const id = item.id || uuidv4();
    const timestamp = new Date();
    
    const newItem = {
      ...item,
      id,
      createdAt: item.createdAt || timestamp,
      updatedAt: timestamp
    } as T;
    
    this.items.set(id, newItem);
    console.log(`Item added to collection ${this.collectionName} with ID ${id}`);
    
    // Sauvegarder les changements
    this.saveToStorage();
    
    return newItem;
  }

  /**
   * Retrieves an item by its ID
   */
  async findById(id: string): Promise<T | null> {
    const item = this.items.get(id);
    return item || null;
  }

  /**
   * Retrieves all items from the collection
   */
  async findAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  /**
   * Searches for items matching the specified criteria
   */
  async find(criteria: Partial<T>): Promise<T[]> {
    return Array.from(this.items.values()).filter(item => {
      return Object.entries(criteria).every(([key, value]) => {
        // Handling object and array comparisons
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(item[key]) === JSON.stringify(value);
        }
        return item[key] === value;
      });
    });
  }

  /**
   * Updates an item by its ID
   */
  async updateById(id: string, update: Partial<T>): Promise<T | null> {
    const item = this.items.get(id);
    
    if (!item) {
      return null;
    }
    
    const updatedItem = {
      ...item,
      ...update,
      id,
      updatedAt: new Date()
    } as T;
    
    this.items.set(id, updatedItem);
    console.log(`Item ${id} updated in collection ${this.collectionName}`);
    
    // Sauvegarder les changements
    this.saveToStorage();
    
    return updatedItem;
  }

  /**
   * Deletes an item by its ID
   */
  async deleteById(id: string): Promise<boolean> {
    const result = this.items.delete(id);
    
    if (result) {
      console.log(`Item ${id} deleted from collection ${this.collectionName}`);
      
      // Sauvegarder les changements
      this.saveToStorage();
    }
    
    return result;
  }

  /**
   * Clears the entire collection (useful for testing)
   */
  async clear(): Promise<void> {
    this.items.clear();
    console.log(`Collection ${this.collectionName} cleared`);
    
    // Sauvegarder les changements
    this.saveToStorage();
  }
} 
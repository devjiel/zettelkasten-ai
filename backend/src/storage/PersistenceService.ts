import fs from 'fs';
import path from 'path';

/**
 * Service de persistance pour sauvegarder et charger les données en mémoire
 * Solution temporaire avant l'implémentation d'une base de données
 */
export class PersistenceService {
  private static instance: PersistenceService;
  private dataDir: string;
  
  private constructor() {
    // Créer un dossier 'data' à la racine du projet
    this.dataDir = path.join(process.cwd(), 'data');
    
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log(`Dossier de données créé: ${this.dataDir}`);
    }
  }
  
  /**
   * Obtenir l'instance unique du service
   */
  public static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }
  
  /**
   * Sauvegarder des données dans un fichier JSON
   * @param collectionName Nom de la collection
   * @param data Données à sauvegarder
   */
  public saveData<T>(collectionName: string, data: T[]): void {
    try {
      const filePath = path.join(this.dataDir, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Collection ${collectionName} sauvegardée dans ${filePath}`);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${collectionName}:`, error);
    }
  }
  
  /**
   * Charger des données depuis un fichier JSON
   * @param collectionName Nom de la collection
   * @returns Données chargées ou tableau vide si le fichier n'existe pas
   */
  public loadData<T>(collectionName: string): T[] {
    try {
      const filePath = path.join(this.dataDir, `${collectionName}.json`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`Aucune donnée existante pour ${collectionName}`);
        return [];
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(data) as T[];
      console.log(`Collection ${collectionName} chargée depuis ${filePath}`);
      
      return parsedData;
    } catch (error) {
      console.error(`Erreur lors du chargement de ${collectionName}:`, error);
      return [];
    }
  }
} 
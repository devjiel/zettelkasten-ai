// Web Streams Polyfill pour le support du streaming avec Claude
import 'web-streams-polyfill';

// Polyfill pour fetch API
import fetch from 'cross-fetch';
globalThis.fetch = fetch as any;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';

// Configuration
dotenv.config();
console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY?.length);

// Routes
import notesRoutes from './routes/notes';
import agentsRoutes from './routes/agents';
import flashcardsRoutes from './routes/flashcards';

// Initialisation des repositories
import { NoteRepository } from './storage/NoteRepository';
import { FlashcardRepository } from './storage/FlashcardRepository';
import { TaskRepository } from './storage/TaskRepository';
import { InMemoryStorage } from './storage/InMemoryStorage';

const app = express();
const PORT = process.env.PORT || 3000;
let server: http.Server;

// Middlewares
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001', // URL de votre frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache préflight pour 24 heures
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/notes', notesRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/flashcards', flashcardsRoutes);

// Initialisation du stockage en mémoire
console.log('Initialisation du stockage en mémoire...');
const noteRepo = NoteRepository.getInstance();
const flashcardRepo = FlashcardRepository.getInstance();
const taskRepo = TaskRepository.getInstance();

// Fonction pour sauvegarder toutes les données avant la fermeture
const saveAllData = () => {
  console.log('Sauvegarde des données avant fermeture...');

  // Utiliser les getters pour accéder au stockage
  const noteStorage = noteRepo.getStorage();
  const flashcardStorage = flashcardRepo.getStorage();
  const taskStorage = taskRepo.getStorage();

  // Sauvegarder les données
  noteStorage.saveToStorage();
  flashcardStorage.saveToStorage();
  taskStorage.saveToStorage();

  console.log('Sauvegarde terminée');
};

// Démarrer le serveur
server = app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
  console.log(`API accessible à l'adresse: http://localhost:${PORT}`);
  console.log('Stockage en mémoire initialisé');
});

// Gestion de la fermeture propre du serveur
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, fermeture du serveur...');
  saveAllData();
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, fermeture du serveur...');
  saveAllData();
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
  saveAllData();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});

// Pour les tests
export default app; 
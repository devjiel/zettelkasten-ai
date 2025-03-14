import express from 'express';
import * as agentsController from '../controllers/agentsController';

const router = express.Router();

// Route pour lister les agents disponibles
router.get('/', agentsController.getAvailableAgents);

// Route pour exécuter l'agent de résumé de livre
router.post('/book-summary', agentsController.runBookSummaryAgent);

// Route pour obtenir le statut d'une tâche d'agent
router.get('/tasks/:taskId', agentsController.getTaskStatus);

// Route pour lister les tâches en cours
router.get('/tasks', agentsController.getPendingTasks);

// Route pour interroger la base de connaissances (RAG)
router.post('/query', agentsController.queryKnowledgeBase);

export default router; 
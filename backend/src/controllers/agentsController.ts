import { Request, Response } from 'express';
import { AgentOrchestrator, AgentType } from '../agents/AgentOrchestrator';
import { TaskRepository } from '../storage/TaskRepository';

const agentOrchestrator = AgentOrchestrator.getInstance();
const taskRepository = TaskRepository.getInstance();

/**
 * Get the list of available agents
 */
export const getAvailableAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const agentTypes = agentOrchestrator.getAvailableAgentTypes();

    const agents = agentTypes.map(type => {
      // Additional information for each agent type
      switch (type) {
        case AgentType.BOOK_SUMMARY:
          return {
            id: type,
            name: 'Book Summary Agent',
            description: 'Creates book summaries and flashcards',
            parameters: ['bookTitle', 'bookAuthor']
          };
        case AgentType.RAG_QUERY:
          return {
            id: type,
            name: 'RAG Query Agent',
            description: 'Answers questions based on stored knowledge',
            parameters: ['query']
          };
        case AgentType.WEB_EXTRACTOR:
          return {
            id: type,
            name: 'Web Extractor Agent',
            description: 'Extracts and processes content from web pages',
            parameters: ['url']
          };
        default:
          return {
            id: type,
            name: type,
            description: 'Generic agent',
            parameters: []
          };
      }
    });

    res.json(agents);
  } catch (error) {
    console.error('Error retrieving available agents:', error);
    res.status(500).json({ error: 'Error retrieving available agents' });
  }
};

/**
 * Execute the book summary agent
 */
export const runBookSummaryAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookTitle, bookAuthor } = req.body;

    if (!bookTitle || !bookAuthor) {
      res.status(400).json({ error: 'Book title and author are required' });
      return;
    }

    const result = await agentOrchestrator.runAgent(
      AgentType.BOOK_SUMMARY,
      { bookTitle, bookAuthor }
    );

    res.status(202).json({
      taskId: result.taskId,
      message: `Summary of book "${bookTitle}" by ${bookAuthor} is being processed`,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error executing the book summary agent:', error);
    res.status(500).json({ error: 'Error executing the book summary agent' });
  }
};

/**
 * Get the status of a task
 */
export const getTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    const task = await taskRepository.getTaskById(taskId);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error(`Error retrieving status of task ${req.params.taskId}:`, error);
    res.status(500).json({ error: 'Error retrieving task status' });
  }
};

/**
 * Get the list of pending tasks
 */
export const getPendingTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await taskRepository.getPendingAndProcessingTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error retrieving pending tasks:', error);
    res.status(500).json({ error: 'Error retrieving pending tasks' });
  }
};

/**
 * Query the knowledge base with RAG
 */
export const queryKnowledgeBase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    // Note: The RAG agent is not yet implemented
    res.status(501).json({
      message: 'RAG agent not yet implemented',
      query
    });
  } catch (error) {
    console.error('Error querying the knowledge base:', error);
    res.status(500).json({ error: 'Error querying the knowledge base' });
  }
};

/**
 * Extract content from a web page
 */
export const extractWebContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const result = await agentOrchestrator.runAgent(
      AgentType.WEB_EXTRACTOR,
      { url }
    );

    res.status(202).json({
      taskId: result.taskId,
      message: `Content extraction from "${url}" is being processed`,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error extracting web content:', error);
    res.status(500).json({ error: 'Error extracting web content' });
  }
}; 
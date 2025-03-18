import { Agent } from "./Agent";
import { BookSummaryAgent } from "./BookSummaryAgent";
import { WebSummarizerAgent } from "./WebSummarizerAgent";
import { TaskStatus } from "../types/common";
import { TaskRepository } from "../storage/TaskRepository";

/**
 * Interface for supported agent types
 */
export enum AgentType {
  BOOK_SUMMARY = "book-summary",
  RAG_QUERY = "rag-query",
  WEB_EXTRACTOR = "web-extractor"
}

/**
 * Orchestrator that manages the fleet of AI agents
 */
export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private agents: Map<AgentType, Agent>;
  private taskRepository: TaskRepository;

  /**
   * Private constructor (Singleton pattern)
   */
  private constructor() {
    this.agents = new Map();
    this.taskRepository = TaskRepository.getInstance();

    // Initialize agents
    this.registerAgent(AgentType.BOOK_SUMMARY, new BookSummaryAgent());
    this.registerAgent(AgentType.WEB_EXTRACTOR, new WebSummarizerAgent());

    // To implement: add other agents
    // this.registerAgent(AgentType.RAG_QUERY, new RAGQueryAgent());

    console.log("Agent orchestrator initialized");
  }

  /**
   * Get the unique instance of the orchestrator
   */
  public static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  /**
   * Register a new agent
   */
  private registerAgent(type: AgentType, agent: Agent): void {
    this.agents.set(type, agent);
    console.log(`Agent "${agent.getName()}" registered as ${type}`);
  }

  /**
   * Get an agent by its type
   */
  public getAgent(type: AgentType): Agent | undefined {
    return this.agents.get(type);
  }

  /**
   * Execute a task with a specific agent
   */
  public async runAgent(
    agentType: AgentType,
    input: any,
    callbackFn?: (chunk: string) => void
  ): Promise<{ taskId: string }> {
    const agent = this.getAgent(agentType);

    if (!agent) {
      throw new Error(`Agent of type "${agentType}" not found`);
    }

    // Create a task in storage
    const task = await this.taskRepository.createTask(agentType, input);
    const taskId = task.id!;

    // Execute the agent in the background
    setTimeout(async () => {
      try {
        // Update status to "processing"
        await this.taskRepository.updateTaskStatus(taskId, TaskStatus.PROCESSING);

        // Execute the agent with taskId included in input
        const result = await agent.run({ ...input, taskId }, callbackFn);

        // Update status to "completed"
        await this.taskRepository.updateTaskStatus(taskId, TaskStatus.COMPLETED, result);
      } catch (error) {
        console.error(`Error during execution of agent ${agentType}:`, error);
        await this.taskRepository.updateTaskStatus(taskId, TaskStatus.FAILED, { error: String(error) });
      }
    }, 0);

    return { taskId };
  }

  /**
   * Get the status of a task
   */
  public async getTaskStatus(taskId: string): Promise<any> {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    return task;
  }

  /**
   * Update the status of a task
   */
  public async updateTaskStatus(taskId: string, status: TaskStatus, result?: any): Promise<void> {
    await this.taskRepository.updateTaskStatus(taskId, status, result);
  }

  /**
   * Get the list of available agent types
   */
  public getAvailableAgentTypes(): AgentType[] {
    return Array.from(this.agents.keys());
  }
} 
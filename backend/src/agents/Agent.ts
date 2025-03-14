import { ChatAnthropic } from "@langchain/anthropic";
import { BaseMessage } from "@langchain/core/messages";
import { ZodSchema } from "zod";
import { TaskStatus } from "../types/common";

/**
 * Base class for all agents
 */
export abstract class Agent {
  protected model: ChatAnthropic;
  protected name: string;
  
  constructor(name: string, modelName: string = "claude-3-7-sonnet-20250219") {
    this.name = name;
    this.model = new ChatAnthropic({ 
      modelName,
      temperature: 0.3,
      // Disable streaming to avoid ReadableStream error
      streaming: false,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  /**
   * Abstract method to be implemented by each specific agent type
   * @param input Input data
   * @param callbackFn Callback function for streaming
   */
  abstract run(input: any, callbackFn?: (chunk: string) => void): Promise<any>;
  
  /**
   * Validates inputs according to a Zod schema
   * @param input Input data
   * @param schema Zod schema
   */
  protected validateInput<T>(input: any, schema: ZodSchema<T>): T {
    return schema.parse(input);
  }
  
  /**
   * Updates the status of a task
   * @param taskId Task ID
   * @param status New status
   * @param result Optional result
   */
  protected async updateTaskStatus(taskId: string, status: TaskStatus, result?: any): Promise<void> {
    // To implement: update the task status in storage
    console.log(`Task ${taskId}: ${status}`);
  }
  
  /**
   * Gets the agent name
   */
  getName(): string {
    return this.name;
  }
} 
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Agent } from "./Agent";
import { BookSummaryResult, TaskStatus } from "../types/common";
import { NoteRepository } from "../storage/NoteRepository";
import { Note } from "../types/note";
import { FlashcardRepository, Flashcard } from "../storage/FlashcardRepository";

// Validation schema for inputs
const bookSummaryInputSchema = z.object({
  bookTitle: z.string().min(1, "Book title is required"),
  bookAuthor: z.string().min(1, "Book author is required"),
});

type BookSummaryInput = z.infer<typeof bookSummaryInputSchema>;

/**
 * Agent specialized in book summarization and flashcard creation
 */
export class BookSummaryAgent extends Agent {
  private noteRepository: NoteRepository;
  private flashcardRepository: FlashcardRepository;

  constructor() {
    super("BookSummaryAgent");
    this.noteRepository = NoteRepository.getInstance();
    this.flashcardRepository = FlashcardRepository.getInstance();
  }

  /**
   * Generates a summary and flashcards for a book
   */
  async run(input: BookSummaryInput, callbackFn?: (chunk: string) => void): Promise<{ taskId: string }> {
    try {
      // Validate inputs
      const validatedInput = this.validateInput(input, bookSummaryInputSchema);

      // Create a task ID
      const taskId = uuidv4();

      // Update initial status
      await this.updateTaskStatus(taskId, TaskStatus.PENDING);

      // Launch the task in background
      this.processBookSummary(taskId, validatedInput, callbackFn).catch(console.error);

      // Return the task ID
      return { taskId };
    } catch (error) {
      console.error("Error while processing the summary request:", error);
      throw error;
    }
  }

  /**
   * Asynchronous processing of the book summary
   */
  private async processBookSummary(
    taskId: string,
    input: BookSummaryInput,
    callbackFn?: (chunk: string) => void
  ): Promise<void> {
    try {
      // Update status
      await this.updateTaskStatus(taskId, TaskStatus.PROCESSING);

      // Build the prompt
      const prompt = this.buildPrompt(input);

      // Call the LLM model without streaming option
      const response = await this.model.invoke(prompt);

      // Parse the response
      // For Claude's response format
      let responseText = '';
      if (typeof response.content === 'string') {
        responseText = response.content;
      } else if (Array.isArray(response.content)) {
        // Handle array of content parts
        responseText = response.content
          .map(part => typeof part === 'string' ? part : JSON.stringify(part))
          .join('');
      } else {
        // Handle object format - convert to JSON string
        responseText = JSON.stringify(response.content);
      }

      const result = this.parseResponse(responseText, input);

      // Create a note for the summary
      const note: Note = {
        id: uuidv4(),
        title: `Summary: ${input.bookTitle} - ${input.bookAuthor}`,
        content: `
# Book Summary: "${input.bookTitle}" by ${input.bookAuthor}

${result.summary}

## Key Points
${result.keyPoints.map(point => `- ${point}`).join('\n')}
        `,
        tags: ['summary', 'book', input.bookAuthor.toLowerCase()],
      };

      const savedNote = await this.noteRepository.createNote(note);

      // Create the flashcards
      const flashcards: Flashcard[] = result.flashcards.map(fc => ({
        question: fc.question,
        answer: fc.answer,
        tags: ['book', input.bookAuthor.toLowerCase()],
        sourceNoteId: savedNote.id!,
        reviewCount: 0
      }));

      await this.flashcardRepository.createFlashcards(flashcards);

      // Update final status
      await this.updateTaskStatus(taskId, TaskStatus.COMPLETED, {
        ...result,
        noteId: savedNote.id,
        flashcardCount: flashcards.length
      });
    } catch (error) {
      console.error(`Error while processing task ${taskId}:`, error);
      await this.updateTaskStatus(taskId, TaskStatus.FAILED);
    }
  }

  /**
   * Builds the prompt for the LLM
   */
  private buildPrompt(input: BookSummaryInput): string {
    const { bookTitle, bookAuthor } = input;

    let bookInfo = `"${bookTitle}" by ${bookAuthor}`;

    return `I have not read ${bookInfo}. I would like you to create a summary and flashcards of the most important elements of the book. With the content you produce, I want to have knowledge and understanding of the book as if I had read it myself.

Please write your response entirely in French.

Organize your response as follows:
1. Résumé global du livre (500-800 mots)
2. Points clés et idées principales (liste de 5-10 points)
3. Fiches mémo (minimum 10 paires question/réponse) au format suivant:
Q: [Question]
R: [Réponse]`;
  }

  /**
   * Parses the LLM response
   */
  private parseResponse(responseText: string, input: BookSummaryInput): BookSummaryResult {
    // Recherche du résumé (en français ou en anglais)
    const summaryMatch = responseText.match(/(Résumé global du livre|Global summary of the book)[:\s]*([\s\S]*?)(?=(Points clés|Key points)|$)/i);

    // Recherche des points clés (en français ou en anglais)
    const keyPointsMatch = responseText.match(/(Points clés|Key points)[^:]*:[:\s]*([\s\S]*?)(?=(Fiches mémo|Flashcards)|$)/i);

    // Extract flashcards
    const flashcardMatches = Array.from(responseText.matchAll(/Q:\s*(.*?)\s*\n\s*R:\s*([\s\S]*?)(?=Q:|$)/gi));

    const flashcards = flashcardMatches.map(match => ({
      question: match[1].trim(),
      answer: match[2].trim()
    }));

    // Extract key points
    let keyPoints: string[] = [];
    if (keyPointsMatch && keyPointsMatch[2]) {
      keyPoints = keyPointsMatch[2]
        .split(/\n\s*[-•*]\s*/)
        .filter(point => point.trim().length > 0)
        .map(point => point.trim());
    }

    return {
      bookTitle: input.bookTitle,
      bookAuthor: input.bookAuthor,
      summary: summaryMatch ? summaryMatch[2].trim() : "Summary not available",
      keyPoints,
      flashcards
    };
  }
} 
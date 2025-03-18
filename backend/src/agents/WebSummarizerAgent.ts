import { z } from "zod";
import { Agent } from "./Agent";
import { TaskStatus } from "../types/common";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatAnthropic } from "@langchain/anthropic";
import { NoteRepository } from "../storage/NoteRepository";
import { JsonOutputParser } from "@langchain/core/output_parsers";

// Input validation schema
const WebSummarizerInput = z.object({
    content: z.string(),
    title: z.string().max(150),
    taskId: z.string().optional(),
});

type WebSummarizerInput = z.infer<typeof WebSummarizerInput>;

// Output validation schema
const WebSummarizerOutput = z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    metadata: z.record(z.string().optional())
});

type WebSummarizerOutput = z.infer<typeof WebSummarizerOutput>;

interface SummaryResponse {
    summary: string;
    tags: string[];
}

export class WebSummarizerAgent extends Agent {
    private noteRepo: NoteRepository;
    private parser: JsonOutputParser<SummaryResponse>;

    constructor() {
        super("WebSummarizerAgent");
        this.noteRepo = NoteRepository.getInstance();
        this.parser = new JsonOutputParser<SummaryResponse>();
    }

    private async generateSummaryAndTags(content: string): Promise<{ summary: string; tags: string[] }> {
        const formatInstructions = "Respond with a valid JSON object containing two fields: 'summary' (a concise and informative summary) and 'tags' (an array of 3 to 5 relevant tags).";

        const prompt = ChatPromptTemplate.fromTemplate(
            "Analysez le texte suivant et fournissez un résumé ainsi que des tags pertinents.\n{format_instructions}\nTexte à analyser : {content}"
        );

        try {
            const chain = prompt
                .pipe(this.model)
                .pipe(this.parser);

            const result = await chain.invoke({
                format_instructions: formatInstructions,
                content: content
            });

            return result;
        } catch (error) {
            console.error("Error during generation:", error);
            return {
                summary: content.substring(0, 500) + "...",
                tags: ["uncategorized"]
            };
        }
    }

    async run(input: WebSummarizerInput): Promise<WebSummarizerOutput> {
        const validatedInput = this.validateInput(input, WebSummarizerInput);

        if (!validatedInput.taskId) {
            throw new Error("taskId is required but was not provided by the orchestrator");
        }

        let partialOutput: Partial<WebSummarizerOutput> = {
            title: validatedInput.title,
            content: validatedInput.content,
            tags: ["uncategorized"],
        };

        try {
            await this.updateTaskStatus(validatedInput.taskId, TaskStatus.PROCESSING);

            // Generate summary and tags
            console.log("Generating summary and tags...");
            const { summary, tags } = await this.generateSummaryAndTags(validatedInput.content);
            partialOutput.summary = summary;
            partialOutput.tags = tags;

            partialOutput.metadata = {
                processedAt: new Date().toISOString(),
                processingStatus: "complete"
            };

        } catch (error: any) {
            console.error("Error during processing:", error);
            partialOutput = {
                ...partialOutput,
                summary: "Summary not available",
                tags: ["uncategorized"],
                metadata: {
                    processingStatus: "partial",
                    error: error.message
                }
            };
        }

        // Save the note
        try {
            console.log("Saving note...");
            await this.noteRepo.createNote({
                title: partialOutput.title!,
                content: `# ${partialOutput.title}

                ## Summary
                ${partialOutput.summary}

                ## Tags
                ${(partialOutput.tags || ["uncategorized"]).map(tag => `#${tag}`).join(' ')}`,
                tags: partialOutput.tags || ["uncategorized"],
                metadata: {
                    ...partialOutput.metadata,
                    savedAt: new Date().toISOString()
                }
            });

            await this.updateTaskStatus(
                validatedInput.taskId,
                partialOutput.metadata?.processingStatus === "complete" ? TaskStatus.COMPLETED : TaskStatus.FAILED,
                partialOutput
            );

            return partialOutput as WebSummarizerOutput;

        } catch (error) {
            console.error("Error while saving:", error);
            await this.updateTaskStatus(validatedInput.taskId, TaskStatus.FAILED, error);
            throw error;
        }
    }
} 
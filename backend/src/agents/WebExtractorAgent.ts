import { z } from "zod";
import { Agent } from "./Agent";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { TaskStatus } from "../types/common";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Schéma de validation pour l'entrée
const WebExtractorInput = z.object({
    url: z.string().url(),
    taskId: z.string().optional(),  // Rendre taskId optionnel car il sera ajouté par l'orchestrateur
});

type WebExtractorInput = z.infer<typeof WebExtractorInput>;

// Schéma de validation pour la sortie
const WebExtractorOutput = z.object({
    title: z.string(),
    url: z.string(),
    content: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    keyPoints: z.array(z.string()),
    flashcards: z.array(z.object({
        question: z.string(),
        answer: z.string()
    })),
    metadata: z.record(z.string().optional())
});

type WebExtractorOutput = z.infer<typeof WebExtractorOutput>;

export class WebExtractorAgent extends Agent {
    constructor() {
        super("web_extractor");
    }

    async run(input: WebExtractorInput, callbackFn?: (chunk: string) => void): Promise<WebExtractorOutput> {
        // Valider l'entrée
        const validatedInput = this.validateInput(input, WebExtractorInput);

        // Vérifier que le taskId est présent (il devrait être ajouté par l'orchestrateur)
        if (!validatedInput.taskId) {
            throw new Error("taskId is required but was not provided by the orchestrator");
        }

        try {
            // Mettre à jour le statut
            await this.updateTaskStatus(validatedInput.taskId, TaskStatus.PROCESSING);

            // 1. Charger et extraire le contenu de la page
            const loader = new CheerioWebBaseLoader(validatedInput.url);
            const docs = await loader.load();

            // 2. Découper le contenu en morceaux gérables
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 2000,
                chunkOverlap: 200,
            });
            const splitDocs = await splitter.splitDocuments(docs);

            // 3. Analyser le contenu avec Claude pour extraire les informations pertinentes
            console.log("Préparation de l'analyse du contenu...");
            const analysisPrompt = ChatPromptTemplate.fromTemplate(`
        Analyse le contenu web suivant et extrait les informations importantes.
        Tu dois retourner UNIQUEMENT un objet JSON valide, sans backticks (\`\`\`) ni marqueur de langage.
        
        Format de sortie attendu :
        {{
          "title": "Titre de la page",
          "summary": "Résumé concis du contenu (environ 200 mots)",
          "keyPoints": ["Point clé 1", "Point clé 2", "..."],
          "tags": ["tag1", "tag2"],
          "flashcards": [
            {{
              "question": "Question sur un concept important",
              "answer": "Réponse détaillée"
            }}
          ],
          "metadata": {{
            "author": "auteur si disponible",
            "publishedDate": "date si disponible",
            "lastModified": "date de dernière modification si disponible"
          }}
        }}

        Génère au moins 3 flashcards pertinentes et 5 points clés.
        Les flashcards doivent couvrir les concepts les plus importants du contenu.
        Les points clés doivent résumer les idées principales.
        IMPORTANT: Retourne UNIQUEMENT le JSON, sans aucun texte avant ou après.

        Contenu :
        {input}
      `);

            console.log("Création de la chaîne de traitement...");
            const chain = analysisPrompt.pipe(this.model).pipe(new StringOutputParser());

            console.log("Début de l'analyse avec le LLM...");
            const analysis = await chain.invoke({
                input: splitDocs[0].pageContent,
            });
            console.log("Réponse brute du LLM:", analysis);

            // Nettoyer la sortie
            console.log("Nettoyage de la sortie JSON...");
            const cleanedAnalysis = analysis
                .replace(/^```json\s*/, '') // Supprimer ```json au début
                .replace(/^```\s*/, '')     // Supprimer ``` au début
                .replace(/\s*```$/, '')     // Supprimer ``` à la fin
                .trim();                    // Supprimer les espaces inutiles

            try {
                const parsedAnalysis = JSON.parse(cleanedAnalysis);

                // 4. Construire la sortie
                const output: WebExtractorOutput = {
                    title: parsedAnalysis.title,
                    url: validatedInput.url,
                    content: splitDocs.map(doc => doc.pageContent).join("\n"),
                    summary: parsedAnalysis.summary,
                    tags: parsedAnalysis.tags,
                    keyPoints: parsedAnalysis.keyPoints,
                    flashcards: parsedAnalysis.flashcards,
                    metadata: parsedAnalysis.metadata,
                };

                // Mettre à jour le statut final
                await this.updateTaskStatus(validatedInput.taskId, TaskStatus.COMPLETED, output);

                return output;
            } catch (error) {
                console.error("Erreur lors du parsing JSON:", cleanedAnalysis);
                if (error instanceof Error) {
                    throw new Error(`Erreur lors du parsing de la sortie JSON: ${error.message}`);
                }
                throw new Error("Erreur inconnue lors du parsing de la sortie JSON");
            }
        } catch (error) {
            if (validatedInput.taskId) {
                await this.updateTaskStatus(validatedInput.taskId, TaskStatus.FAILED, error);
            }
            throw error;
        }
    }
} 
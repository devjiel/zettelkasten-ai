# Zettelkasten AI

An AI-powered note-taking application based on the Zettelkasten method.

## Features

- **Automatic Book Summarization**: Ask AI to generate detailed summaries and flashcards for any book
- **Web Content Extraction**: Import and summarize web articles directly into your knowledge base
- **Zettelkasten Note-Taking**: Organize your ideas using the Zettelkasten method with interconnected notes
- **Integrated Flashcards**: Create and review flashcards directly linked to your notes
- **Smart Search (RAG)**: Ask questions about your knowledge base and get contextual answers

## Architecture

The application consists of two main components:

- **Backend**: Node.js/TypeScript API using LangChain to orchestrate AI agents
- **Frontend**: React user interface for interacting with notes and AI agents

### AI Agents

The application uses a multi-agent architecture where each agent specializes in a specific task:

- **Book Summary Agent**: Generates summaries and flashcards from book titles
- **Web Summarizer Agent**: Extracts and summarizes content from web articles
- **RAG Agent**: Answers questions based on stored notes
- **Orchestrator**: Coordinates agents and manages asynchronous tasks

## Installation

### Prerequisites

- Node.js 18+
- MongoDB
- Anthropic API Key

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Then modify environment variables
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Usage

### Book Summary

You can request the application to generate a book summary using a format like this:

```json
{
  "bookTitle": "Propaganda",
  "bookAuthor": "Edward Bernays"
}
```

The application will generate a comprehensive summary, key points, and flashcards.

### Web Content Extraction

Extract and summarize web content by providing the URL and optional title:

```json
{
  "url": "https://example.com/article",
  "title": "Optional Custom Title"
}
```

The Web Summarizer Agent will:
- Extract the main content
- Generate a concise summary
- Suggest relevant tags
- Save the content as a note in your knowledge base

### Knowledge Base Querying

Once you have accumulated notes and summaries, you can query your knowledge base using natural language questions. The application uses RAG (Retrieval Augmented Generation) technology to find relevant information and formulate answers.

## Future Development

- Integration with additional external sources (PDFs, academic papers, etc.)
- Note and flashcard export
- Mobile application
- AI agent customization
- Advanced tagging and categorization system

## License

MIT 
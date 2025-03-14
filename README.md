# Zettelkasten AI

Application de prise de notes basée sur la méthode Zettelkasten et pilotée par l'intelligence artificielle.

## Fonctionnalités

- **Résumé automatique de livres** : Demandez à l'IA de générer un résumé détaillé et des flashcards pour n'importe quel livre
- **Prise de notes Zettelkasten** : Organisez vos idées selon la méthode Zettelkasten avec des liens entre les notes
- **Flashcards intégrées** : Créez et révisez des flashcards directement liées à vos notes
- **Recherche intelligente (RAG)** : Posez des questions sur votre base de connaissances et obtenez des réponses contextuelles

## Architecture

L'application est constituée de deux composants principaux :

- **Backend** : API Node.js/TypeScript utilisant LangChain pour orchestrer les agents IA
- **Frontend** : Interface utilisateur React pour interagir avec les notes et les agents IA

### Agents IA

L'application utilise une architecture multi-agents où chaque agent est spécialisé dans une tâche spécifique :

- **Agent de résumé de livre** : Génère des résumés et des flashcards à partir de titres de livres
- **Agent RAG** : Répond aux questions basées sur les notes stockées
- **Orchestrateur** : Coordonne les agents et gère les tâches asynchrones

## Installation

### Prérequis

- Node.js 18+
- MongoDB
- Clé API OpenAI

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Puis modifiez les variables d'environnement
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Utilisation

### Résumé de livre

Vous pouvez demander à l'application de générer un résumé de livre en utilisant un format comme celui-ci :

> Je n'ai pas lu Edward Bernays, Propaganda, Zones, 2007. Je voudrais que tu me réalise un résumé ainsi que des flash card des éléments les plus importants du livre. Avec le contenu que tu auras produits je veux avoir une connaissance et compréhension du livre comme si je l'avais moi même lu.

L'application traitera cette demande en envoyant une requête à l'API avec un contenu JSON simple :

```json
{
  "bookTitle": "Propaganda",
  "bookAuthor": "Edward Bernays"
}
```

L'application générera alors un résumé complet, des points clés et des flashcards.

### Interrogation de la base de connaissances

Une fois que vous avez accumulé des notes et des résumés, vous pouvez interroger votre base de connaissances en posant des questions en langage naturel. L'application utilisera la technologie RAG (Retrieval Augmented Generation) pour trouver les informations pertinentes et formuler une réponse.

## Développement futur

- Intégration avec des sources externes (articles, PDF, etc.)
- Export des notes et flashcards
- Application mobile
- Personnalisation des agents IA

## Licence

MIT 
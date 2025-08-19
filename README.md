# IceBrAIker - AI-Powered Conversation Starters

IceBrAIker is a sophisticated RAG (Retrieval-Augmented Generation) application that helps you create personalized conversation starters by analyzing public profile information and generating contextually relevant icebreakers.

## Features

- 🧠 **Smart Context Analysis**: Uses Tavily API to search and analyze public profile information
- 💬 **AI-Powered Generation**: Leverages Google Gemini AI for natural, personalized icebreakers  
- 🎯 **Vector Search**: Implements pgvector for semantic similarity matching
- 💾 **Favorites System**: Save and organize your best conversation starters
- 🎨 **Beautiful UI**: Modern, responsive design with gradient themes
- 🔍 **Advanced Filtering**: Search and filter saved icebreakers by tone and keywords

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (Postgres + pgvector) + Edge Functions
- **AI Services**: 
  - Google Gemini (gemini-1.5-pro for generation, text-embedding-004 for embeddings)
  - Tavily API for web search
- **Database**: PostgreSQL with pgvector extension for vector similarity search

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
npm run dev
```

### 2. API Keys Configuration

The application requires two API keys that are already configured in your Supabase project:

- **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Tavily API Key**: Get from [Tavily Dashboard](https://tavily.com/)

Both keys have been securely added to your Supabase project's secrets management.

### 3. Database Schema

The application automatically created the following database structure:

- `sources`: Stores chunked content with 768-dimensional vector embeddings
- `drafts`: Stores generated icebreakers and user favorites  
- `match_sources()`: RPC function for vector similarity search using cosine distance

## How It Works

### RAG Pipeline

1. **Content Retrieval**: Enter a profile URL or keywords:
   - App checks for existing sources in database
   - If not found, uses Tavily API to fetch fresh web content

2. **Content Processing**: 
   - Chunks content into ~800-1000 token segments
   - Generates embeddings using Gemini's text-embedding-004 model
   - Stores in Supabase with pgvector extension

3. **Query Processing**:
   - Converts user query + goal into an embedding
   - Performs vector similarity search (cosine distance)
   - Retrieves top 6 most relevant content chunks

4. **Generation**:
   - Constructs prompt with retrieved context, user goal, and tone
   - Uses Gemini 1.5 Pro to generate 2-3 sentence icebreaker
   - Returns both the icebreaker and source snippets used

### Architecture Flow

```
User Input → Tavily Search → Content Chunking → Embeddings (Gemini) 
    ↓
Vector Storage (pgvector) → Similarity Search → Context Retrieval
    ↓  
Prompt Construction → Generation (Gemini) → Icebreaker Output
```

## Pages & Features

- **Home Page**: Main interface for generating icebreakers with tone selection
- **Favorites Page**: View, search, filter, and manage saved icebreakers
- **Real-time Processing**: See which sources were used for each generation
- **Copy & Regenerate**: Easily copy results or generate alternatives

## Prompt Template

The AI uses this carefully crafted prompt:

```
Write a warm, specific 2–3 sentence icebreaker using the context.
Rules: mention 1–2 concrete details, avoid clichés and generic praise, match the requested tone, end with a gentle question.
Context: {{CONTEXT}}
User goal: {{GOAL}}
Tone: {{TONE}}
```

## Security & Ethics

- ⚠️ **Responsible Use**: Designed for analyzing public information only
- 🔒 **Privacy**: Respects website Terms of Service and robots.txt
- 🛡️ **Data Protection**: API keys securely stored in Supabase secrets
- 📋 **Row-Level Security**: Database policies ensure proper data isolation

## Deployment

Ready for deployment on Lovable or any platform supporting:
- Static site hosting (Netlify, Vercel, etc.)
- Supabase backend integration
- Environment variable management

Click **Share → Publish** in your [Lovable Project](https://lovable.dev/projects/6492930d-f5c2-4667-b1f8-7f85417943f9) to deploy instantly.

## Extension Ideas

- Sentiment analysis for supportive tone adjustment
- Bulk processing for multiple profiles
- Integration with LinkedIn or other platforms
- Custom tone presets and user preferences
- Analytics dashboard for usage tracking

## License

MIT License - Use this as a learning resource or foundation for your own RAG applications.

# 🎓 Learn RAG — Interactive Pipeline Simulator

An interactive, dark-themed educational web application designed to teach students how **Retrieval-Augmented Generation (RAG)** works by exposing and animating every layer of the pipeline in real-time.

---

## 🛠️ Project Requirements

### Prerequisites
*   **Runtime:** Node.js v18.0.0 or higher
*   **Package Manager:** npm v9.0.0 or higher
*   **Relational Database:** SQLite (configured locally out-of-the-box, no standalone setup required)
*   **AI Services (Optional):**
    *   **Google Gemini API Key** (for embedding chunks and generating LLM responses)
    *   **Pinecone Account & Index** (for vector storage and similarity search)

> [!TIP]
> **Zero-Config Development Fallback:** If you do not have active API credentials, you can leave the fields blank in `.env.local`. The application will automatically trigger a **local mock engine** (which builds 768-dimensional vectors from character hashes and performs local cosine similarity searches in RAM), allowing you to interact with the sandbox offline.

---

## 🏗️ Folder Structure

```text
learn-rag/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Premium credentials login form
│   │   └── register/page.tsx        # New user registration form
│   ├── api/
│   │   ├── auth/[...nextauth]/      # NextAuth.js v5 route handlers
│   │   ├── auth/register/           # Hashing and SQLite registration API
│   │   ├── session/                 # CRUD for user tracking workspaces
│   │   ├── upload/                  # Decodes raw files (.txt and .pdf)
│   │   ├── rag-pipeline/            # Triggers LangGraph RAG steps
│   │   └── resume/                  # Resumes paused execution (HITL controls)
│   ├── dashboard/page.tsx           # User workspaces & session history
│   ├── learn/[sessionId]/page.tsx   # Interactive simulator sandbox
│   ├── globals.css                  # Slate-dark styles & animations
│   └── layout.tsx                   # Global wrapping & fonts setup
├── components/
│   ├── PipelineVisualizer.tsx       # Horizontal nodes showing active pipeline stage
│   ├── EmbeddingInspector.tsx       # Live bar-chart preview of vector dimensions
│   ├── ChunkInspector.tsx           # Rank-ordered semantic search chunk cards
│   ├── ParameterPanel.tsx           # Sliders to configure chunkSize, overlap, and top-k
│   └── DocumentUploader.tsx         # Drag-and-drop text/pdf file handler
├── lib/
│   ├── langgraph/
│   │   ├── state.ts                 # Unified LangGraph schema definition
│   │   ├── supervisor.ts            # Programmatic state router (no LLM calls)
│   │   ├── ingestion-agent.ts       # Text segmentation and embedding (optimized parallel paths)
│   │   ├── retrieval-agent.ts       # Query embedding & similarity lookup agent
│   │   └── generation-agent.ts      # Prompt compiler & LLM invoker
│   ├── auth.ts                      # Credentials provider logic
│   ├── gemini.ts                    # Google GenAI model settings & custom embeddings
│   ├── pinecone.ts                  # Pinecone database client & cosine fallback
│   ├── prisma.ts                    # SQLite database client
│   └── session-store.ts             # Memory cache for active graph traces
├── prisma/
│   ├── dev.db                       # Active SQLite local file (gitignored)
│   └── schema.prisma                # Relational user and workspace schemas
├── types/
│   └── rag.ts                       # Shared TypeScript interface definitions
├── .env                             # Database url setting for Prisma CLI
└── .env.local                       # Environment credentials (gitignored)
```

---

## 🚀 Installation & Local Run

Follow these steps to run the application on your machine:

### 1. Clone the repository and install dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Open [`.env.local`](file:///d:/AI_workshop/RAGpipe_Web/.env.local) and input your credentials:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-generated-random-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="learn-rag"
```

### 3. Sync Database Tables
Create the local SQLite file and sync schemas via Prisma:
```bash
npx prisma db push
```

### 4. Start the Development Server
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser to start learning RAG!

---

## ⚡ Technical Architecture Details

*   **Framework:** Next.js 15 (App Router) + React 19
*   **State Machine:** `@langchain/langgraph` to construct state annotations, routing edges, and modular agents.
*   **Vector Ingestion Optimization:** Documents are chunked and resolved in parallel batches using `Promise.all`, bypassing sequential API network bottlenecks.
*   **Design Language:** Crafted entirely in Vanilla CSS utilizing slate-dark background tones, glassmorphism boundaries, interactive sliders, and Framer Motion micro-animations.

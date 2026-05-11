# StudyBuddy.AI - Complete Setup & Run Guide

## Prerequisites
- Node.js 18+ (tested on v25.6.0)
- Python 3.9+
- Anthropic API Key (https://console.anthropic.com)

---

## Quick Start (if dependencies are pre-installed)

### 1. Set API Key
```bash
echo "ANTHROPIC_API_KEY=your-key-here" > backend/.env
```

### 2. Start Backend
```bash
cd backend
python3 main.py
```
Backend runs at http://localhost:5005

### 3. Start Frontend
```bash
npm run dev
```
Frontend runs at http://localhost:3000

### 4. Open Browser
Navigate to http://localhost:3000

---

## Full Installation (from scratch)

### Step 1: Frontend Dependencies
```bash
cd studybuddy.ai
npm install
```

### Step 2: Python Dependencies
```bash
cd backend
pip3 install -r requirements.txt
```

requirements.txt includes:
- flask>=3.0
- flask-cors>=4.0
- anthropic>=0.40
- python-dotenv>=1.0
- sqlalchemy>=2.0
- edge-tts>=7.0
- chromadb>=0.4
- sentence-transformers>=2.2

### Step 3: Download Embedding Model (first run auto-downloads)
```bash
python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2'); print('Model ready')"
```
This downloads the all-MiniLM-L6-v2 model (~80MB) for RAG embeddings.

### Step 4: Configure Environment
```bash
echo "ANTHROPIC_API_KEY=your-key-here" > backend/.env
```

### Step 5: Start Services
Terminal 1 - Backend:
```bash
cd backend
python3 main.py
```

Terminal 2 - Frontend:
```bash
npm run dev
```

---

## Demo Workflow

1. Open http://localhost:3000
2. Click **+ Add Source** and upload a PDF
3. System processes document into sections with AI
4. Agent welcomes you and introduces the material
5. Read sections, click **Done with this section** to progress
6. Camera starts automatically for focus tracking
7. If focus drops, the agent suggests switching content format
8. Open **Study Assistant** chat (bottom right)
9. Toggle between **Quick** (summary-based) and **Deep Search** (RAG with source citations)
10. Ask questions - Deep Search shows inline citations [1], [2] with hover previews
11. Click source cards to navigate to referenced sections
12. Use quick commands: `quiz me`, `flashcards`, `next section`, `mind map`
13. View session analytics and knowledge graph in the sidebar

---

## RAG Evaluation

### Run from CLI
```bash
cd backend

# Generate test cases for a document
python3 eval_harness.py generate <document_id>

# Run full RAG vs Full-Context evaluation
python3 eval_harness.py run <document_id>

# List past evaluation runs
python3 eval_harness.py list <document_id>

# View detailed results
python3 eval_harness.py detail <run_id>
```

### Run from API
```bash
# Re-index existing document for RAG
curl -X POST http://localhost:5005/api/rag/reindex/<document_id>

# Generate test cases
curl -X POST http://localhost:5005/api/eval/generate-tests/<document_id>

# Run evaluation
curl -X POST http://localhost:5005/api/eval/run/<document_id>

# View results
curl http://localhost:5005/api/eval/runs/<document_id>
curl http://localhost:5005/api/eval/detail/<run_id>
```

---

## Project Structure
```
studybuddy.ai/
  app/                          # Next.js frontend
    dashboard/                  # Main dashboard page
    lib/
      focus-detection/          # MediaPipe engine, signal processor, predictor
      adaptive-engine/          # State machine, types, React hook
    services/                   # API clients (content, session, agent)
    ui/
      agent/                    # Chat with RAG toggle + citation tooltips
      main-display/             # Content renderers (text, quiz, flashcard, mindmap, game)
      modal/                    # Upload modal
      sidebar/                  # Sources, section progress, knowledge graph
      studio-panel/             # Camera feed, focus display, focus chart
      session/                  # Session report
  backend/
    main.py                     # Flask API endpoints
    database.py                 # SQLAlchemy models (12 tables)
    document_processor.py       # PDF/text processing via Claude Vision
    study_agent.py              # LLM chat agent (full-context + RAG)
    agent_engine.py             # Deterministic decision engine
    rag_pipeline.py             # Chunking, embedding, ChromaDB, retrieval
    eval_harness.py             # RAG evaluation framework
    knowledge_graph.py          # Concept extraction
  models/                       # Pre-downloaded ML models
    all-MiniLM-L6-v2/          # Sentence transformer (384-dim embeddings)
```

## Tech Stack
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- Backend: Python, Flask, SQLAlchemy, SQLite
- LLM: Anthropic Claude API (Sonnet 4)
- Embeddings: sentence-transformers (all-MiniLM-L6-v2)
- Vector DB: ChromaDB (persistent, file-based)
- Focus Detection: MediaPipe FaceMesh (WASM, client-side)
- TTS: Edge TTS (Microsoft neural voices)

## Authors
Mahesh Cheekuri, Puneeth Regonda, Siri Chandana Uppula, Sunil Vurandur
MS Software Engineering, San Jose State University, May 2026

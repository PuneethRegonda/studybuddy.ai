# Target Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Next.js 15)                          │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    Focus Detection Engine                      │   │
│  │  MediaPipe Face Mesh (WASM) → EAR + Gaze + Blink + Presence  │   │
│  │  Web Worker for computation │ EMA Smoothing │ Calibration     │   │
│  └──────────────────────────┬─────────────────────────────────────┘   │
│                              │ focus signal (every 2s)                 │
│                              ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    Adaptive State Machine                      │   │
│  │  States: READING│VISUAL│RECALL│TESTING│GAME│MICRO│BREAK│RECOVERY│  │
│  │  Transition rules │ Anti-thrashing │ Effectiveness memory      │   │
│  └──────────────────────────┬─────────────────────────────────────┘   │
│                              │ state changes                           │
│                              ▼                                         │
│  ┌─────────┐  ┌──────────────────┐  ┌─────────────────────────┐      │
│  │ Sidebar  │  │   Main Display    │  │     Studio Panel        │      │
│  │ Sources  │  │                   │  │                         │      │
│  │ K-Graph  │  │  Text Content     │  │  Focus Score + Status   │      │
│  │ Progress │  │  Mindmap          │  │  Distraction Counter    │      │
│  │ History  │  │  Flashcards (SM2) │  │  Real-time Chart        │      │
│  │          │  │  Quiz             │  │  Camera Feed            │      │
│  │          │  │  Mini Game        │  │  Agent Chat             │      │
│  │          │  │  Micro-Learning   │  │  Session Analytics      │      │
│  │          │  │  Podcast Player   │  │                         │      │
│  └─────────┘  └──────────────────┘  └─────────────────────────┘      │
│                              │                                         │
│                    REST API calls                                       │
└──────────────────────────────┼─────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                               │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐    │
│  │ Auth Module   │  │ Document     │  │ Content Generation       │    │
│  │ JWT + OAuth   │  │ Processing   │  │                          │    │
│  │ User CRUD     │  │ PDF Extract  │  │ Quiz (difficulty-scaled) │    │
│  │ Session mgmt  │  │ Chunking     │  │ Flashcards               │    │
│  └──────────────┘  │ Concept Ext  │  │ Mindmap                  │    │
│                     │ K-Graph Build│  │ Micro-learning cards     │    │
│  ┌──────────────┐  └──────────────┘  │ Podcast script           │    │
│  │ Analytics    │                     │ Distraction recap        │    │
│  │ Engine       │  ┌──────────────┐  └──────────────────────────┘    │
│  │ Session stats│  │ Study Agent  │                                   │
│  │ Trends       │  │ Tool calling │  ┌──────────────────────────┐    │
│  │ Patterns     │  │ Context mgmt │  │ Gemini API               │    │
│  └──────────────┘  │ Auto-triggers│  │ Content generation       │    │
│                     └──────────────┘  │ Concept extraction       │    │
│                                       │ Agent reasoning          │    │
│                                       └──────────────────────────┘    │
│                               │                                        │
│                     ┌─────────┴──────────┐                            │
│                     ▼                    ▼                             │
│              ┌─────────────┐    ┌──────────────┐                      │
│              │ PostgreSQL   │    │ Redis         │                      │
│              │ Users        │    │ Session cache │                      │
│              │ Documents    │    │ Content cache │                      │
│              │ Sessions     │    │ Rate limiting │                      │
│              │ Focus events │    └──────────────┘                      │
│              │ K-Graph      │                                          │
│              │ Quiz attempts│                                          │
│              │ Card reviews │                                          │
│              │ Analytics    │                                          │
│              └─────────────┘                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### 1. Focus Detection in Browser, Not Server
All computer vision runs client-side via MediaPipe WASM. No video frames cross the network. This eliminates the Socket.IO video pipeline, removes a backend server, reduces latency to zero, and preserves user privacy. The browser sends only computed focus scores (a single number) to the backend for storage.

### 2. Single Backend Server (FastAPI)
The current two-server architecture (Flask on 5000, Flask-SocketIO on 5002) collapses into one FastAPI server. Focus detection moved to browser, so the Socket.IO server is eliminated. All API endpoints live under one service. WebSocket is only needed if real-time features are added later (collaborative study).

### 3. State Machine Lives in the Browser
The adaptive state machine runs client-side. It consumes the focus signal directly (no network hop), manages content transitions, and sends transition records to the backend for persistence. This keeps the UX responsive — content switching happens instantly, not after a round-trip.

### 4. Agent Runs Server-Side
The study agent lives on the backend. It needs access to the database (document content, quiz history, knowledge graph, session data) and the Gemini API (for tool responses). The frontend sends agent requests via REST. Agent responses include both text and optional actions (switch content mode, generate quiz, etc.) that the frontend executes.

### 5. PostgreSQL for Everything
One relational database for all persistence. The knowledge graph is stored as nodes and edges tables, not a graph database — the graph is small enough (hundreds of nodes per document) that SQL queries with recursive CTEs handle prerequisite traversal efficiently. This avoids adding another database technology.

### 6. Redis for Caching and Rate Limiting
Generated content (quizzes, flashcards, mindmaps) is cached in Redis keyed by document_id + content_type + difficulty_level. Repeated requests for the same content type on the same document hit cache instead of calling Gemini. Redis also handles rate limiting counters.

---

## API Design

### Auth
```
POST   /api/auth/register        — Create account
POST   /api/auth/login            — Get JWT token
POST   /api/auth/refresh          — Refresh token
GET    /api/auth/me               — Get current user
```

### Documents
```
POST   /api/documents/upload      — Upload PDF, trigger processing pipeline
GET    /api/documents             — List user's documents
GET    /api/documents/:id         — Get document with sections and concepts
GET    /api/documents/:id/graph   — Get knowledge graph for document
DELETE /api/documents/:id         — Delete document and all related data
```

### Content Generation
```
POST   /api/generate/summary      — Generate section summaries
POST   /api/generate/quiz         — Generate quiz (with difficulty, target concepts)
POST   /api/generate/flashcards   — Generate flashcards (with target concepts)
POST   /api/generate/mindmap      — Generate mindmap
POST   /api/generate/micro        — Generate micro-learning cards
POST   /api/generate/podcast      — Generate podcast script
POST   /api/generate/recap        — Generate distraction recovery recap
```

### Sessions
```
POST   /api/sessions              — Start a new study session
PATCH  /api/sessions/:id          — Update session (end time, summary)
GET    /api/sessions              — List user's sessions
GET    /api/sessions/:id          — Get session with all events
POST   /api/sessions/:id/focus    — Record batch of focus events
POST   /api/sessions/:id/distraction — Record distraction event
POST   /api/sessions/:id/quiz     — Record quiz attempt
POST   /api/sessions/:id/card     — Record flashcard review
POST   /api/sessions/:id/transition — Record content transition
```

### Analytics
```
GET    /api/analytics/session/:id — Get session analytics
GET    /api/analytics/trends      — Get cross-session trends
GET    /api/analytics/patterns    — Get distraction patterns
GET    /api/analytics/concepts    — Get concept mastery overview
```

### Agent
```
POST   /api/agent/chat            — Send message to agent, get response with actions
POST   /api/agent/trigger         — Trigger autonomous agent action (distraction recovery, focus intervention)
GET    /api/agent/history/:sessionId — Get agent conversation history for session
```

---

## Data Flow: Complete Study Session

```
1. Student logs in → JWT token issued
2. Student uploads PDF
   → Backend: extract text, chunk sections, extract concepts, build knowledge graph
   → Response: document with sections, concepts, and graph

3. Student starts study session
   → Backend: create session record
   → Frontend: start focus detection (calibration → continuous monitoring)
   → Agent (auto): generate study plan based on document structure and deadline

4. Student reads text content
   → Focus detection: continuous EAR/gaze/blink computation
   → State machine: monitors focus signal, manages transitions
   → Frontend: sends focus events to backend in batches (every 30s)

5. Focus drops → State machine triggers transition
   → Check effectiveness memory: which transition works best for this user?
   → Switch to recommended content type
   → Frontend: requests content generation from backend (or serves from cache)
   → Record transition event

6. Student gets distracted (face disappears)
   → Focus engine detects absence
   → Content auto-pauses, timer starts
   → Distraction event recorded

7. Student returns
   → State machine enters RECOVERY state
   → Agent (auto-trigger): generate recap of where they were
   → Show recap + comprehension question + distraction stats
   → Student answers → record quiz attempt
   → Resume content

8. Session ends (student closes or timeout)
   → Agent (auto): generate session summary
   → Backend: compute session analytics
   → Frontend: show session report
   → All data persisted for cross-session trends
```

---

## Deployment Architecture

### Development
```
docker-compose up
  → frontend:  Next.js dev server (port 3000)
  → backend:   FastAPI with uvicorn (port 8000)
  → postgres:  PostgreSQL 16 (port 5432)
  → redis:     Redis 7 (port 6379)
```

### Production
```
Frontend:  Vercel (Next.js optimized hosting)
Backend:   Railway / Fly.io / Render (FastAPI container)
Database:  Neon / Supabase (managed PostgreSQL)
Cache:     Upstash (managed Redis)
Storage:   S3 / Cloudflare R2 (PDF storage)
```

---

## Technology Stack

| Layer | Current | Target |
|-------|---------|--------|
| Frontend | Next.js 15, React 19, Tailwind | Same + MediaPipe JS, TensorFlow.js (Phase 8) |
| UI Components | shadcn/ui (partial) | shadcn/ui (complete) |
| State Management | useState scattered | Zustand or Context for global state |
| Focus Detection | Python MediaPipe (fake) | Browser MediaPipe WASM (real) |
| Backend Framework | Flask (2 servers) | FastAPI (1 server) |
| Database | None | PostgreSQL |
| Cache | None | Redis |
| Auth | None | NextAuth.js + JWT |
| AI/LLM | google-generativeai (direct) | Gemini API with function calling (agent) |
| Deployment | None | Docker + Vercel + Railway |

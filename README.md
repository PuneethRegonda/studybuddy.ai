# StudyBuddy.AI — Adaptive Learning Assistant

An attention-aware adaptive learning platform that combines **real-time focus tracking** with **AI-driven content generation** to deliver personalized study sessions. Built as a capstone project for MS Software Engineering at San Jose State University.

---

## Problem Statement

Students frequently lose focus during self-study, yet traditional learning tools offer no awareness of engagement levels. StudyBuddy.AI addresses this by monitoring attention in real time and dynamically adapting content format to re-engage the learner — all while keeping biometric data entirely on-device.

## Key Features

### 1. Document Upload and Intelligent Sectioning
Upload any **PDF, text, or markdown** file. The system uses Claude Vision API to read the document (including images, diagrams, and tables), then breaks it into structured study sections with extracted concepts, prerequisites, and a knowledge graph.

### 2. Real-Time Focus Detection (Privacy-First)
Focus tracking runs **entirely in the browser** using MediaPipe FaceMesh (WebAssembly). No video frames ever leave the device.

Signals computed:
- **Eye Aspect Ratio (EAR)** — detects drowsiness and blink rate
- **Gaze direction** — tracks where the user is looking via iris landmarks
- **Head pose estimation** — detects looking away from the screen
- **Composite focus score** — weighted combination with EMA smoothing
- **Focus predictor** — linear regression with 30-second lookahead to anticipate drops

### 3. Adaptive Content Switching
When focus drops, the AI agent suggests switching formats to re-engage:
- **Text reading** with natural TTS (Edge TTS neural voices)
- **Flashcards** focused on key definitions and terminology
- **Quizzes** testing understanding and application
- **Mind maps** showing concept relationships
- **Drag-and-drop matching games**

The adaptive state machine includes anti-thrashing logic (minimum dwell time, cooldowns, max transitions) and effectiveness memory that learns which format transitions work best for each user.

### 4. AI Study Agent
A conversational agent that:
- Welcomes users and introduces the material
- Suggests content format changes based on focus state
- Manages section progression and prerequisites
- Provides recap when returning from distractions
- Answers free-form questions about the material (LLM-backed chat)
- Supports quick commands: `quiz me`, `flashcards`, `explain`, `next section`

### 5. Section-Based Progress Tracking
Each section tracks mastery through stages: **Not Started -> Reading -> Read -> Tested -> Mastered**. Quiz results update concept-level mastery. The knowledge graph visualization shows which concepts you've learned and which remain.

### 6. Distraction Recovery
When the user leaves the screen (face absence or tab switch), the system detects it. On return, the agent tells the user where they left off with a one-click continue.

---

## Architecture

```
Browser (Next.js 15)
+-- Focus Detection Engine (MediaPipe WASM)
|   +-- EAR computation
|   +-- Gaze direction (iris landmarks)
|   +-- Blink rate detection
|   +-- Head pose estimation
|   +-- Composite score with EMA smoothing
|   +-- Focus predictor (linear regression, 30s lookahead)
+-- Adaptive State Machine
|   +-- States: READING -> VISUAL -> RECALL -> TESTING -> GAME -> BREAK
|   +-- Anti-thrashing (min dwell time, cooldown, max transitions)
|   +-- Effectiveness memory (learns which transitions work)
+-- Activity Tracker
|   +-- Tab visibility (document.visibilityState)
|   +-- Inactivity detection (no scroll/click for 60s)
+-- UI Components
    +-- Section progress sidebar
    +-- Content type tabs
    +-- Agent inline cards
    +-- Chat with quick action commands
    +-- Knowledge graph concept dots
    +-- Floating camera widget (minimizable)
    +-- Break screen with breathing timer

Backend (Flask + SQLite)
+-- Document Processor
|   +-- PDF -> Claude Vision API (reads images, diagrams, text)
|   +-- Text/MD -> Claude text API
|   +-- Splits into structured sections with concepts
+-- Agent Decision Engine (deterministic, no LLM)
|   +-- Welcome/resume decisions
|   +-- Focus drop suggestions
|   +-- Section completion flow
|   +-- Quiz result handling
|   +-- Prerequisite checking
+-- Content Generation (cached per section)
|   +-- Flashcards (terminology-focused prompts)
|   +-- Quizzes (understanding/application prompts)
|   +-- Mind maps
|   +-- Mini-games
+-- Knowledge Graph Extraction
+-- TTS (Edge TTS neural voices)
+-- Session Analytics
+-- Agent Chat (LLM-backed for free-form questions)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| UI Components | shadcn/ui, ReactFlow, Recharts, Framer Motion |
| Focus Detection | MediaPipe Face Mesh (WASM), Web Workers |
| Backend | Python, Flask, SQLAlchemy |
| Database | SQLite (documents, sections, progress, sessions, focus events, chat) |
| LLM | Anthropic Claude API (Sonnet 4) |
| TTS | Edge TTS (Microsoft neural voices) |
| PDF Processing | Claude Vision API (multimodal) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Anthropic API key

### Frontend

```bash
cd studybuddy.ai
npm install
npm run dev
```

Opens at http://localhost:3000

### Backend

```bash
cd backend
pip3 install -r requirements.txt
```

Create `backend/.env`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

```bash
python3 main.py
```

Runs at http://localhost:5001

### Demo Workflow

1. Open http://localhost:3000
2. Click **+ Add Source** and upload a PDF
3. The system processes it into sections — the agent welcomes you
4. Read the first section, click **Done with this section**
5. The agent suggests a quiz or next section
6. Camera starts automatically — focus tracking runs in background
7. If focus drops, the agent suggests switching content format
8. Chat with the assistant using quick commands: `quiz me`, `flashcards`, `next section`
9. View session analytics and knowledge graph progress in the sidebar

---

## Database Schema

```
documents          -- uploaded files with summaries and knowledge graphs
document_sections  -- structured sections with concepts and prerequisites
section_progress   -- per-section mastery tracking
sessions           -- study sessions with timestamps
focus_events       -- focus score time series
quiz_attempts      -- quiz answers with correctness
content_transitions-- content format switches with focus before/after
distraction_events -- absence durations
generated_content  -- cached flashcards/quizzes/mindmaps per section
chat_messages      -- agent conversation history per session
```

## Project Structure

```
app/
  dashboard/          -- main dashboard page + view
  lib/
    focus-detection/  -- MediaPipe engine, signal processor, predictor, activity tracker
    adaptive-engine/  -- state machine, types, React hook
  services/           -- API clients (content, session, agent)
  ui/
    agent/            -- inline agent card + chat
    main-display/     -- content renderers (text, quiz, flashcard, mindmap, game)
    modal/            -- upload modal
    sidebar/          -- sources, section progress, knowledge graph
    studio-panel/     -- camera feed, focus display, focus chart
    session/          -- session report
backend/
  main.py             -- all API endpoints
  database.py         -- SQLAlchemy models
  document_processor.py -- PDF/text sectioning via Claude
  agent_engine.py     -- deterministic decision engine
  knowledge_graph.py  -- concept extraction
  study_agent.py      -- LLM chat agent
plans/                -- architecture docs and roadmap
```

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Client-side focus detection | Privacy — no video data leaves the browser |
| Deterministic agent engine | Predictable behavior, low latency, no API cost for routine decisions |
| LLM only for content generation and chat | Cost-effective — expensive calls are cached per section |
| Section-based architecture | Enables granular progress tracking and prerequisite ordering |
| SQLite | Simple deployment, sufficient for single-user study sessions |
| Edge TTS | Free, high-quality neural voices without API keys |

## Authors

**Team StudyBuddy.AI** — Mahesh Cheekuri, Puneeth Regonda, Siri Chandana Uppula, Sunil Vurandur

San Jose State University, MS Software Engineering, May 2026

## License

MIT License — see `LICENSE` for details.

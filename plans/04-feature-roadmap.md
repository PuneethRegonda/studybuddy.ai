# Feature Roadmap — Build Order

## Dependency Graph

```
Phase 1: Focus Detection (Browser CV)
    ↓
Phase 2: Distraction Detection + Recovery Agent
    ↓
Phase 3: Adaptive State Machine
    ↓
Phase 4: Database + Persistence + Auth
    ↓
Phase 5: Document Processing Pipeline + Knowledge Graph
    ↓
Phase 6: Session Analytics Engine
    ↓
Phase 7: Agentic Study Assistant (Full)
    ↓
Phase 8: Focus Prediction (ML)
    ↓
Phase 9: TikTok Micro-Learning Mode
    ↓
Phase 10: Voice Podcast Mode
```

Each phase builds on the previous. Each is independently demoable and adds visible product value.

---

## Phase 1: Focus Detection (Browser CV)

**Goal:** Replace `random.randint` with real computer vision running in the browser.

**Deliverables:**
- MediaPipe Face Mesh integration in the browser (WASM)
- EAR (Eye Aspect Ratio) computation from eye landmarks
- Gaze direction estimation from iris landmarks
- Blink rate detection
- Composite focus score with configurable weights
- Exponential moving average smoothing
- Per-user calibration flow (5-second baseline)
- Removal of `focus_server.py` and all Socket.IO video frame infrastructure

**Eliminates:** `backend/focus_server.py`, Socket.IO dependency for video, base64 frame encoding, all server-side CV processing.

**Technical skills demonstrated:** Computer vision, signal processing, WebAssembly, Web Workers, sensor fusion.

---

## Phase 2: Distraction Detection + Recovery Agent

**Goal:** Detect when the student leaves and provide intelligent re-engagement when they return.

**Deliverables:**
- Face presence monitoring (using focus detection pipeline)
- Auto-pause when face disappears for >5 seconds
- Distraction event logging (start time, end time, duration)
- Tab visibility detection (`document.visibilityState` API)
- Recovery overlay on return:
  - Contextual recap of where the student left off (Gemini-generated)
  - Quick comprehension question on pre-distraction material
  - Distraction count display with session comparison
- Distraction event storage (in-memory initially, database later)

**Depends on:** Phase 1 (face presence detection).

**Technical skills demonstrated:** Event-driven state management, LLM context injection, behavioral event detection.

---

## Phase 3: Adaptive State Machine

**Goal:** Replace if/else threshold logic with a formal state machine that learns.

**Deliverables:**
- State machine with defined states (READING, VISUAL, RECALL, TESTING, GAME, MICRO, BREAK, RECOVERY)
- Transition rules with conditions (focus threshold + duration, performance, time-in-state)
- Anti-thrashing constraints (minimum dwell time, cooldown, max transitions per window)
- Transition effectiveness recording (from_state, to_state, focus_before, focus_after)
- Per-user transition preference learning (select best transition based on historical effectiveness)
- Visual state indicator in the UI showing current mode and why it switched

**Depends on:** Phase 1 (real focus signal), Phase 2 (distraction/recovery states).

**Technical skills demonstrated:** Finite state machines, adaptive algorithms, personalization through data.

---

## Phase 4: Database + Persistence + Auth

**Goal:** Make everything persistent. Add user accounts.

**Deliverables:**
- PostgreSQL schema: users, documents, sessions, focus_events, generated_content, quiz_attempts, flashcard_reviews, distraction_events, content_effectiveness
- Backend rewrite: Flask → FastAPI with async support, Pydantic models, dependency injection
- Authentication: NextAuth.js on frontend, JWT validation on backend
- Document storage: uploaded PDFs stored (S3 or local filesystem), summaries and generated content cached in database
- Session persistence: focus data, quiz scores, flashcard confidence all survive page refresh
- API endpoints: CRUD for documents, sessions, generated content

**Depends on:** Phase 1-3 (generates the data that needs to be stored).

**Technical skills demonstrated:** Database design, API design, authentication, async Python, ORM (SQLAlchemy).

---

## Phase 5: Document Processing Pipeline + Knowledge Graph

**Goal:** Transform uploaded documents into structured, interconnected knowledge.

**Deliverables:**
- PDF text extraction with section detection (headings, page breaks)
- Section-level summarization (not one giant summary)
- Concept extraction per section (Gemini: structured JSON output)
- Prerequisite relationship detection between concepts (Gemini: graph edges)
- Knowledge graph storage in database (nodes = concepts, edges = prerequisites)
- Knowledge graph visualization (extend existing ReactFlow mindmap component)
- Concept mastery tracking (untouched → in-progress → mastered based on quiz/flashcard performance)
- Content generation targeting: generate quizzes for unmastered concepts, prioritize prerequisites

**Depends on:** Phase 4 (database for graph storage and mastery tracking).

**Technical skills demonstrated:** NLP/information extraction, graph algorithms, LLM-powered structured data extraction, prerequisite-aware learning path optimization.

---

## Phase 6: Session Analytics Engine

**Goal:** Show students their real learning patterns — the data mirror.

**Deliverables:**
- Real-time session metrics: focused time, distraction count, current streak
- Focus-per-content-type breakdown (live updating bar chart)
- Post-session summary generation:
  - Time breakdown (focused vs distracted)
  - Content effectiveness ranking
  - Weak/strong concepts (from quiz and flashcard data)
  - Distraction pattern analysis ("you lose focus every ~7 minutes during text")
  - Actionable recommendation
- Cross-session trend tracking: focus duration improvement, distraction reduction, concept mastery growth
- Replace the current static attention chart with real data visualization
- Session history page showing past sessions with summaries

**Depends on:** Phase 4 (database for historical data), Phase 1-3 (generates the data being analyzed).

**Technical skills demonstrated:** Data visualization, time-series analysis, behavioral pattern detection, statistical aggregation.

---

## Phase 7: Agentic Study Assistant (Full)

**Goal:** Build a real agent — with tools, context, and autonomous triggers — not just a chatbot.

**Deliverables:**
- Agent UI: chat panel in the sidebar or overlay
- Agent context injection: current document section, focus history, quiz performance, knowledge graph position, distraction events, deadline (if set)
- Agent tools (Gemini function calling):
  - `search_document(query)` — find relevant sections in the uploaded document
  - `generate_explanation(concept, level)` — explain a concept at the right complexity
  - `generate_quiz(concepts, difficulty)` — targeted quiz generation
  - `generate_flashcards(concepts)` — targeted flashcard generation
  - `get_prerequisites(concept)` — look up the knowledge graph
  - `get_student_performance(concept)` — check mastery data
  - `suggest_study_plan(time_remaining)` — create a time-boxed study plan
  - `create_recap(section)` — generate recap for distraction recovery
  - `switch_content_mode(mode)` — trigger content type change
- Autonomous triggers:
  - Distraction recovery (auto-activates on return)
  - Focus intervention (auto-suggests when focus sustained low)
  - Comprehension checkpoint (auto-asks after each section)
  - Session start planning (auto-generates study plan if deadline is set)
  - Session end summary (auto-generates session report)
- Conversation history persistence in database

**Depends on:** Phase 4 (database), Phase 5 (knowledge graph for prerequisite tools), Phase 6 (analytics for performance tools).

**Technical skills demonstrated:** Agentic AI architecture, LLM function calling, context management, autonomous agent triggers, tool orchestration.

---

## Phase 8: Focus Prediction (ML)

**Goal:** Predict attention drops before they happen. Proactive, not reactive.

**Deliverables:**
- Feature engineering: 30-second windows of focus score (mean, variance, trend), time-in-state, time-since-break, content type, distraction count
- Model option A (MVP): Holt's exponential smoothing on focus time series — implementable in TypeScript, runs in browser, no ML library needed
- Model option B (advanced): Small LSTM/GRU trained on accumulated user sessions, exported to TensorFlow.js for browser inference
- Prediction output: estimated focus score 2 minutes ahead + probability of distraction
- Integration with adaptive state machine: trigger proactive transitions when predicted focus will drop below threshold
- Integration with agent: "Your focus is starting to drift — want a quick quiz?"

**Depends on:** Phase 4 (historical session data for training), Phase 3 (state machine integration).

**Technical skills demonstrated:** Time series forecasting, feature engineering, ML model training and deployment (TensorFlow.js), browser-side inference.

---

## Phase 9: TikTok Micro-Learning Mode

**Goal:** Ultra-short-form content for when attention capacity is critically low.

**Deliverables:**
- Concept atomization: break document concepts into single-idea units
- Per-concept content generation: hook + explanation + analogy + retention question
- Vertical card UI with large text and auto-advance
- Browser TTS with word-by-word highlighting (karaoke style)
- Swipe gestures: skip, replay, "I know this," bookmark
- Integration with adaptive state machine as the MICRO state
- Progress tracking: which concepts were covered in micro mode, retention question results

**Depends on:** Phase 5 (concept extraction for atomization), Phase 3 (state machine integration).

**Technical skills demonstrated:** Content transformation pipeline, TTS synchronization, gesture-based interaction, progressive content delivery.

---

## Phase 10: Voice Podcast Mode

**Goal:** Audio-first learning with embedded comprehension checks.

**Deliverables:**
- Conversational script generation from document summary (Gemini)
- Comprehension checkpoint insertion every 2-3 minutes
- Browser SpeechSynthesis playback with pause/resume/speed controls
- Interactive checkpoint UI: pause audio, show question, validate answer
- Re-explanation flow on incorrect answers (branch back, re-explain, then continue)
- Progress tracking: which sections were covered, checkpoint accuracy

**Depends on:** Phase 5 (structured document data for script generation), Phase 4 (persistence).

**Technical skills demonstrated:** Audio UX, conversational content generation, branching interactive media, TTS integration.

---

## Infrastructure (Parallel Track)

These can be worked on alongside any phase:

- Replace `requirements.txt` with minimal, pinned dependencies
- Create `.env.example` with all required variables
- Create Dockerfiles (frontend + backend)
- Create `docker-compose.yml` for local development
- Set up CI/CD (GitHub Actions: lint, type check, build)
- Configure production CORS, rate limiting, request size limits
- Add error boundary and error state UI throughout frontend
- Fix all React bugs identified in code review (hooks violations, dependency arrays, memory leaks)
- Delete dead code (upload_service.py, react-embed-component/, commented-out code, brainRot.mp4)
- Update metadata (package name, page titles, descriptions)

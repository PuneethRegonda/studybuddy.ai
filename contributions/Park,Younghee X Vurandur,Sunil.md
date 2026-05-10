# CMPE 295B, Project Contribution Report

## Project Info

**Project Title:** StudyBuddy.AI - Adaptive Learning Assistant
**Project Advisor:** Dr. Younghee Park

---

## Team Member 1 (self)

**Name:** Sunil Vurandur
**Rating:** 1

### Contribution Description

Built the entire Backend Infrastructure across both CMPE 295A and CMPE 295B. In 295A, initialized the project repository and configured the build pipeline with PostCSS integration, Tailwind CSS v4, TypeScript compilation settings, and dependency management. Designed and implemented the SQLAlchemy database models for documents, study sessions, focus events, distraction events, generated content, and chat messages, using SQLite for development with migration-ready schema design. Implemented all Flask REST API endpoints for document upload with file validation, content generation (flashcards, quizzes, mindmaps), session management, analytics, and health checks.

In CMPE 295B, added the document processor with section-based architecture for splitting documents into structured sections with file type detection supporting PDF and plain text. Updated the database schema for section-based storage with document sections table, section progress tracking with mastery scores, and content caching per section. Engineered the complete database persistence layer for session restoration on page refresh, quiz mastery score persistence across sessions, and content variety management to prevent repetitive interventions. Added Edge TTS neural voice audio narration backend with server-side speech synthesis endpoints and temporary audio file management. Configured backend gitignore for generated assets. Improved the backend document processor with multi-format file type detection. Maintained backend endpoint organization and route cleanup. Updated the README for report submission. Built report generation utilities including DOCX generation, ERD diagram creation from database schema, and flowchart visualization scripts for the final project documentation.

---

## Team Member 2

**Name:** Puneeth Regonda
**Rating:** 1

### Contribution Description

Led the development of the RAG Pipeline, Agentic Chat System, and Study Agent across both CMPE 295A and CMPE 295B. In 295A, established the project README and initial documentation. Built the study agent module integrating the Anthropic Claude API for contextual question answering grounded in uploaded material, distraction recovery prompts triggered by the decision engine, and section progression guidance based on mastery signals. Developed the knowledge graph extraction pipeline that identifies concepts, prerequisites, and relationships from documents and returns structured JSON for frontend visualization. Created the frontend API service layer for agent communication and session management. Authored architecture plans covering system design, product gap analysis, technical depth assessment, feature roadmap, and ADHD user analysis.

In CMPE 295B, implemented agentic progression with agent-driven section transitions where the agent proactively suggests moving to the next section based on mastery, along with chat commands (/next, /quiz, /explain, /summarize) and quick action chips for streamlined student interactions. Designed and built the complete RAG pipeline using ChromaDB as a persistent vector database and the sentence-transformers all-MiniLM-L6-v2 model for 384-dimensional embeddings. The pipeline chunks each document section into 300-token segments with 50-token overlap at paragraph boundaries, embeds them, and retrieves the top-5 most relevant chunks via cosine similarity for grounded question answering with source citations using bracket notation. Engineered the dual-pipeline architecture with a pipeline parameter on the /api/agent/chat endpoint allowing toggling between full-context summarization and RAG-augmented generation. Built the RAG-augmented chat endpoint integrating study agent context with retrieved document chunks. Authored the comprehensive project report, RAG pipeline documentation, and team presentation speaking notes.

---

## Team Member 3

**Name:** Mahesh Cheekuri
**Rating:** 1

### Contribution Description

Developed the entire Frontend Layer (Web Client) across both CMPE 295A and CMPE 295B. In 295A, built the dashboard page with responsive layout and navigation routing including the main study viewport and collapsible sidebar. Created the document upload modal with drag-and-drop support. Built the main display system with pluggable content rendering for quizzes, flashcards, text, and interactive components. Developed the agent chat interface, session report component, and sidebar navigation. Created the React embed component and data visualizer with dynamic component rendering from a JSON-to-TSX utility.

In CMPE 295B, updated all content components (text viewer, flashcards, quiz, mindmap) to support section-based navigation with progress tracking. Added section progress sidebar and mindmap content component. Implemented mini-game content with drag-and-drop matching and agent action cards for structured intervention delivery. Redesigned modal components with improved UX. Built the section completion flow with smart content sizing that adapts viewport layout based on content length. Polished sidebar section progress display and knowledge graph rendering. Built the RAG frontend integration including a toggle switch between full-context and RAG-augmented chat, expandable source citation cards with section references, similarity scores, and click-to-navigate functionality that takes students to the referenced section in the reader.

---

## Team Member 4

**Name:** Siri Chandana Uppula
**Rating:** 1

### Contribution Description

Directed the implementation of the Focus Detection System, Attention Scoring, and Adaptive Decision Engine across both CMPE 295A and CMPE 295B. In 295A, implemented the client-side focus detection module using MediaPipe FaceMesh running entirely in the browser via WebAssembly. Engineered the signal processor that computes Eye Aspect Ratio (EAR) from six facial landmarks per eye, gaze deviation via iris center positions (landmarks 468, 473), head pose estimation via nose-cheek-forehead geometry, and blink rate detection using a 60-second sliding window, combining all signals into a weighted composite focus score with asymmetric EMA smoothing at 5 Hz or higher. Built the studio panel with camera feed and real-time attention scoring charts, focus display, and focus score visualizations. Implemented the threshold-based adaptive decision engine state machine with configurable intervention triggers, cooldown periods, minimum dwell times, anti-thrashing logic, and effectiveness memory that tracks which format transitions work best.

In CMPE 295B, integrated the decision engine with section-based focus scoring for context-aware intervention selection based on section content and mastery level. Built the focus predictor module using linear regression on the last 30 seconds of focus history to predict attention levels 30 seconds ahead, enabling proactive intervention before focus drops below threshold. Developed the activity tracker monitoring keyboard, mouse, and scroll interactions to supplement camera-based focus detection. Added knowledge graph visualization to the focus scoring sidebar. Engineered the break screen with countdown timer for structured focus recovery periods. Built the floating focus panel widget with minimize support for non-intrusive monitoring. Fixed MediaPipe guard conditions, dark scrollbar styling, and focus scoring edge cases. Updated the README for project report submission.

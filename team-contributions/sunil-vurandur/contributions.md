# Sunil Vurandur — Project Contributions

## CMPE 295B, Project Contribution Report

**Project Title:** StudyBuddy.AI - Adaptive Learning Assistant
**Project Advisor:** Dr. Younghee Park

---

## Role: Pure Backend — Flask, Database, API Endpoints, Infrastructure

### Video Demo Talking Points

**Introduction (30s)**
- "Hi, I'm Sunil Vurandur. I built the entire backend infrastructure for StudyBuddy.AI."
- "My work covers the Flask API server, SQLAlchemy database layer, document processing pipeline, and deployment configuration."

**CMPE 295A Contributions (1-2 min)**
- Initialized the project repository and configured the build pipeline:
  - Next.js build configuration with PostCSS and Tailwind CSS v4
  - TypeScript compilation settings and dependency management
  - ESLint and code quality tooling setup
- Designed and implemented the SQLAlchemy database models:
  - Documents table: id, filename, summary, content metadata
  - Study sessions: session tracking with timestamps and document associations
  - Focus events: real-time focus score persistence
  - Distraction events: absence detection with duration tracking
  - Generated content: cached flashcards, quizzes, mindmaps per section
  - Chat messages: full conversation history per session
  - SQLite for development with migration-ready schema design
- Implemented all Flask REST API endpoints:
  - Document upload with file validation and storage
  - Content generation endpoints (flashcards, quizzes, mindmaps)
  - Session management and analytics endpoints
  - Health check and status endpoints

**CMPE 295B Contributions (2-3 min)**
- Added document processor with section-based architecture:
  - Backend pipeline for splitting documents into structured sections
  - File type detection supporting PDF and plain text
- Updated database schema for section-based storage:
  - Document sections table with ordering, titles, and summaries
  - Section progress tracking with mastery scores
  - Content caching per section for efficient retrieval
- Engineered complete database persistence layer:
  - Session restoration on page refresh from SQLite
  - Quiz mastery score persistence across sessions
  - Content variety management to prevent repetitive interventions
- Added Edge TTS neural voice audio narration backend:
  - Server-side speech synthesis endpoints
  - Temporary audio file management and cleanup
  - Backend gitignore configuration for generated assets
- Improved backend document processor with multi-format file type detection
- Maintained backend endpoint organization and route cleanup
- Updated README for report submission
- Built report generation utilities:
  - DOCX generation script for final report formatting
  - ERD diagram creation from database schema
  - Flowchart visualization for RAG pipeline architecture

**Key Metrics to Mention**
- SQLite database supports full session persistence with sub-millisecond reads
- 8 entity types in schema with proper foreign key relationships
- Session restoration works across page refreshes and browser restarts
- 20-page PDF processing handled reliably end-to-end

---

## Pitch Deck Talking Points

### Slide: Backend Architecture
- "The backend is a single Flask service hosting all REST endpoints — document processing, content generation, session management, and the agent chat API."
- "SQLAlchemy ORM with SQLite for dev, migration-ready for PostgreSQL in production."

### Slide: Database Design
- "Every session, focus event, chat message, and generated content piece is persisted. Students pick up exactly where they left off."

### Slide: Document Processing
- "Documents go through a backend pipeline — file type detection, section splitting, and content generation. Edge TTS adds audio narration."

### Slide: Demo
- Show document upload → backend processing
- Show session persistence: close tab → reopen → restored
- Show database entries being created
- Show content caching (instant load on revisit)

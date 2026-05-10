# Mahesh Cheekuri — Project Contributions

## CMPE 295B, Project Contribution Report

**Project Title:** StudyBuddy.AI - Adaptive Learning Assistant
**Project Advisor:** Dr. Younghee Park

---

## Role: Pure Frontend — All UI Components

### Video Demo Talking Points

**Introduction (30s)**
- "Hi, I'm Mahesh Cheekuri. I developed the entire frontend for StudyBuddy.AI."
- "My work covers every user-facing component — from the dashboard and study viewport to the content rendering system and RAG chat UI."

**CMPE 295A Contributions (1-2 min)**
- Built the dashboard page with responsive layout and navigation routing:
  - Main study viewport with collapsible sidebar
  - Document list with upload status indicators
  - Session management controls
- Created the document upload modal with drag-and-drop support
- Built the main display system with pluggable content rendering:
  - Quiz content component with multiple-choice interaction
  - Default display with welcome state and upload prompts
  - Content type switching based on adaptive engine decisions
- Developed the agent chat interface, session report component, and sidebar navigation
- Built the React embed component and data visualizer:
  - Dynamic component rendering from JSON-to-TSX utility
  - Sample visualizer data pipeline for concept diagrams

**CMPE 295B Contributions (2-3 min)**
- Updated all content components for section-based navigation:
  - Text viewer with section-aware scrolling and progress tracking
  - Flashcard component with flip animation and mastery scoring
  - Quiz component with persistent mastery state across sessions
  - Mindmap content with interactive concept visualization
- Added section progress sidebar and mindmap content component
- Implemented mini-game content and agent action cards:
  - Drag-and-drop matching game for concept-definition pairing
  - Agent action cards for structured intervention delivery
- Redesigned modal components with improved UX
- Built section completion flow with smart content sizing
- Polished sidebar section progress display and knowledge graph rendering
- Built the RAG frontend integration:
  - Toggle switch between full-context and RAG-augmented chat
  - Expandable source citation cards with section references
  - Similarity scores displayed for each retrieved chunk
  - Clicking a source card navigates to that section in the reader

**Key Metrics to Mention**
- 6 content modality types: text, quiz, flashcard, mindmap, mini-game, audio
- Responsive design across desktop, tablet, and mobile
- Section completion handles documents with 20+ sections

---

## Pitch Deck Talking Points

### Slide: User Interface
- "The frontend is built with Next.js 15 and React 19, using Tailwind CSS v4 for responsive styling."
- "The dashboard gives students a clean workspace — document viewer, adaptive content center, and agent chat."

### Slide: Content Modalities
- "When the adaptive engine decides to intervene, the main display transitions between content types — quizzes, flashcards, concept maps, mini-games, or audio narration."

### Slide: RAG Chat UI
- "Students can toggle between full-context and RAG mode. In RAG mode, each response shows expandable source cards with the exact passages used."

### Slide: Demo
- Show dashboard layout and responsive design
- Show content type transitions (quiz → flashcard → mindmap)
- Show section completion flow
- Show RAG toggle and source citation cards

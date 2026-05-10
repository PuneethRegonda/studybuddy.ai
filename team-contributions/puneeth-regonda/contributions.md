# Puneeth Regonda — Project Contributions

## CMPE 295B, Project Contribution Report

**Project Title:** StudyBuddy.AI - Adaptive Learning Assistant
**Project Advisor:** Dr. Younghee Park

---

## Role: RAG Pipeline, Agent & Chat Lead

### Video Demo Talking Points

**Introduction (30s)**
- "Hi, I'm Puneeth Regonda. I led the RAG pipeline, agentic chat system, and study agent for StudyBuddy.AI."
- "My work covers the AI intelligence layer — from the conversational study agent to retrieval-augmented question answering with source citations."

**CMPE 295A Contributions (1-2 min)**
- Established the project README and initial documentation
- Built the study agent module integrating the Anthropic Claude API:
  - Contextual question answering grounded in uploaded material
  - Distraction recovery prompts triggered by the decision engine
  - Section progression guidance based on mastery signals
- Developed the knowledge graph extraction pipeline:
  - Identifies concepts, prerequisites, and relationships from documents
  - Returns structured JSON for frontend visualization
- Created the frontend API service layer for agent communication and session management
- Authored architecture plans covering system design, product gap analysis, technical depth assessment, feature roadmap, and ADHD user analysis

**CMPE 295B Contributions (2-3 min)**
- Implemented agentic progression with agent-driven section transitions:
  - Agent proactively suggests moving to next section based on mastery
  - Chat commands for quick actions (next section, quiz me, explain, summarize)
  - Quick action chips in the chat interface for streamlined interactions
- Designed and built the complete RAG pipeline:
  - ChromaDB as persistent vector database (backend/chroma_db/)
  - sentence-transformers all-MiniLM-L6-v2 model (384-dimensional embeddings)
  - 300-token chunks with 50-token overlap at paragraph boundaries
  - Top-5 cosine similarity retrieval per query
  - Source citations with bracket notation [1], [2], etc.
- Engineered the dual-pipeline architecture:
  - Full-context pipeline: sends document summary to Claude
  - RAG pipeline: retrieves relevant chunks, sends to Claude with source metadata
  - Pipeline parameter on /api/agent/chat endpoint for toggling
- Built the RAG-augmented chat endpoint with study agent integration
- Authored the comprehensive project report and RAG pipeline documentation
- Added team presentation speaking notes

**Key Metrics to Mention**
- RAG achieves 89% accuracy vs 82% for full-context (+7%)
- Groundedness improves by 17% with RAG (0.92 vs 0.75)
- RAG uses fewer input tokens per query (~1,800 vs ~3,500)

---

## Pitch Deck Talking Points

### Slide: Agentic Chat
- "The study agent isn't a passive chatbot — it proactively guides students through sections, suggests when to move on, and provides distraction recovery when focus drops."
- "Chat commands like /next, /quiz, /explain give students quick access to agent actions."

### Slide: RAG Pipeline
- "When a student asks a question, we embed the query, retrieve the 5 most relevant chunks from ChromaDB, and send them to Claude with instructions to cite sources."
- "This gives us better accuracy AND source attribution — students can verify answers against the original text."

### Slide: Demo
- Show agent chat → ask a question → see RAG response with source citations
- Toggle between RAG and full-context to show difference
- Demonstrate chat commands and quick action chips
- Show agentic progression suggesting next section

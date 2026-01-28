# Agent-Driven Architecture — The Real Product

## The Problem

Everything is disconnected. The knowledge graph exists but nobody uses it. The DB stores data but nothing reads it back smartly. The agent is a chatbot. Content switches silently. There's no concept of progress, sections, or learning order. The student has no idea what's happening or why.

## The Core Principle

**The agent runs the session. The student just studies.**

The agent is not a feature — it's the orchestrator. It decides:
- What section to show
- When to switch content format
- What to recap after a distraction
- What prerequisites are missing
- When to take a break
- What to review next session

## Document Processing Pipeline

### Current: One Giant Blob
```
PDF → Claude → one big markdown summary → dump on screen
```

### New: Sectioned, Structured, Tracked
```
PDF → Claude → structured sections:
[
  {
    "id": "section-1",
    "title": "Introduction to Virtual Memory",
    "summary": "markdown content for this section...",
    "concepts": ["virtual-memory", "address-space"],
    "order": 1,
    "estimated_read_time_min": 3
  },
  {
    "id": "section-2",
    "title": "Paging",
    "summary": "markdown content...",
    "concepts": ["paging", "page-table", "page-fault"],
    "prerequisites": ["virtual-memory"],
    "order": 2,
    "estimated_read_time_min": 5
  },
  ...
]
```

Each section:
- Has its own summary content
- Links to specific concepts from the knowledge graph
- Lists prerequisites (other sections/concepts needed first)
- Has an estimated read time
- Tracks mastery status per student: NOT_STARTED → IN_PROGRESS → READ → TESTED → MASTERED

## Database Schema Changes

```sql
-- Sections within a document
document_sections (
  id          TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id),
  title       TEXT,
  content     TEXT,           -- markdown summary for this section
  concepts    JSON,           -- concept IDs covered in this section
  prerequisites JSON,         -- section IDs or concept IDs needed first
  section_order INTEGER,
  estimated_read_min FLOAT,
  created_at  DATETIME
)

-- Student progress per section
section_progress (
  id          INTEGER PRIMARY KEY,
  document_id TEXT,
  section_id  TEXT,
  status      TEXT,           -- not_started, in_progress, read, tested, mastered
  read_at     DATETIME,
  quiz_score  FLOAT,          -- best quiz score on this section's concepts
  time_spent_sec FLOAT,
  last_accessed DATETIME
)

-- Generated content is now per-section, not per-document
generated_content (
  id            INTEGER PRIMARY KEY,
  document_id   TEXT,
  section_id    TEXT,          -- NEW: content tied to a section
  content_type  TEXT,
  content_json  JSON,
  created_at    DATETIME
)
```

## Agent Decision Engine

The agent makes decisions based on this data:

```
INPUTS:
  - Current section and its progress status
  - Focus score (real-time from CV)
  - Knowledge graph (concepts + prerequisites)
  - Section progress for all sections (which are mastered, which aren't)
  - Quiz performance per concept
  - Distraction history this session
  - Time in current section

DECISIONS:
  1. WHAT section to show next
     → Check prerequisites: are they mastered?
     → If not: redirect to prerequisite section first
     → If yes: show next unmastered section in order

  2. WHAT format to show it in
     → New section: start with text (reading)
     → Focus dropping: switch to flashcards or quiz for current section
     → Section read + focus ok: quiz to verify comprehension
     → Quiz passed (>70%): mark mastered, move to next section
     → Quiz failed: generate targeted flashcards for weak concepts

  3. WHEN to intervene
     → Focus low for 10+ seconds: suggest format switch
     → Section read but not tested: prompt quiz
     → Student returns from distraction: recap current section
     → Prerequisites missing: redirect before continuing
     → 25+ minutes continuous: suggest break

  4. WHAT to say
     → All messages appear as an inline notification in the content area
     → Not a chat bubble — a contextual card that appears when relevant
     → Student can dismiss or act on it
```

## Agent Message Types

```
WELCOME (session start):
  "Welcome back. Last time you covered Sections 1-3.
   Section 4 (Page Replacement) is next.
   It builds on Paging — you scored 80% on that. Ready to go."
  [Start Section 4] [Review Paging First]

SECTION_COMPLETE:
  "You've read through Paging. Let me check what stuck."
  [Take Quiz] [Continue to Next Section]

FOCUS_DROP:
  "This section's getting dense. Want me to break it into flashcards?"
  [Switch to Flashcards] [Keep Reading]

QUIZ_RESULT:
  "4/5 on Paging. Page Tables need more work.
   I'll add those to your review cards."
  [Review Weak Concepts] [Move to Next Section]

PREREQUISITE_MISSING:
  "Page Replacement builds on Virtual Memory Addressing.
   You haven't covered that yet. Quick primer first?"
  [Learn Prerequisite] [Skip Ahead Anyway]

DISTRACTION_RETURN:
  "You were reading about TLB in Section 3.
   Quick recap: TLB is a cache for page table entries..."
  [Continue]

BREAK_SUGGEST:
  "20 minutes in. You've covered 3 sections.
   Good time for a break?"
  [Take a Break] [Keep Going]

SESSION_END:
  "Today: 4 sections covered, 2 mastered.
   Next time: start with Page Replacement.
   12 flashcards queued for review."
```

## UX Flow — What the Student Sees

### First Visit (New PDF)
```
1. Upload PDF
2. Loading: "Processing your material..." (sections being extracted)
3. Agent welcome card appears in content area:
   "I've organized your material into 8 sections.
    Starting with Section 1: Introduction to Virtual Memory.
    I'll track your progress and switch things up if needed."
4. Section 1 text content loads below the agent card
5. Studio panel slides in (camera + focus tracking)
```

### Continuing (Return Visit)
```
1. Open app → Sources show in sidebar
2. Click a source → Agent card appears:
   "Welcome back. You've mastered 3/8 sections.
    Section 4: Page Replacement is next.
    It requires Paging (you scored 80%). Ready?"
   [Continue] [Review Previous]
3. Click Continue → Section 4 loads
4. Studio panel slides in
```

### During Study
```
1. Reading Section 4...
2. Focus drops → Agent card slides in at top of content:
   "Want to try flashcards for this section?"
   [Switch] [Keep Reading]
3. Student clicks Switch → Flashcards for Section 4 concepts only
4. After flashcards → Agent: "Quick quiz on what you learned?"
5. Quiz: 3/5 → Agent: "Page Fault handling needs work.
   I'll add it to your review. Moving to Section 5."
6. Section 5 loads
```

### Distraction Recovery
```
1. Student leaves (face gone 30+ seconds)
2. Content dims, soft bar: "Still there?" [I'm here] [Break]
3. No response → auto-pause
4. Student returns → Agent card:
   "You were in Section 4, reading about Page Fault handling.
    Quick recap: When a page isn't in memory, the OS..."
   [Continue]
5. One click → back to exact spot
```

## Agent Inline Card Component

The agent doesn't live in a chat window. It appears as a card at the top of the content area when it has something to say:

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Agent Avatar]  Section 3 complete. 4/5 on the quiz.   │ │
│ │                 Page Tables need more work.             │ │
│ │                                                         │ │
│ │ [Review Page Tables]  [Next Section]  [Dismiss]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              Section 4: Page Replacement                │ │
│ │              (content below)                            │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Reading] [Flashcards] [Quiz] [Mind Map] [Game]             │
└─────────────────────────────────────────────────────────────┘
```

The chat window still exists but it's secondary — accessible from a small icon. For when the student wants to ask "explain this concept differently" or "what's the difference between X and Y."

## Section Progress Sidebar

The sidebar transforms when a document is active:

```
Sources
─────────
+ Add Source

Your materials
  [x] lecture11.pdf (active)

Sections                    Progress
─────────                   ────────
1. Intro to Virtual Memory  [mastered]
2. Paging                   [mastered]
3. Page Tables              [tested - 80%]
4. Page Replacement         [reading...] ← current
5. Demand Paging            [not started]
6. TLB                      [not started]
7. Page Fault Handling      [not started]
8. Memory Protection        [not started]

Overall: 3/8 mastered
```

## Implementation Order

1. **Document sectioning** — Change the upload prompt to return structured sections instead of one blob. Store sections in DB.

2. **Section progress tracking** — DB table + API endpoints for tracking which sections are read/tested/mastered.

3. **Agent decision engine** — Server-side logic that takes (section progress, focus score, quiz results, knowledge graph) and returns the next agent action.

4. **Agent inline card** — Frontend component that shows agent messages in the content area with action buttons.

5. **Section-level content generation** — Flashcards/quiz generated per section, not entire document.

6. **Section progress sidebar** — Show progress through sections in the sidebar.

7. **Resume flow** — On return, agent checks progress and suggests where to continue.

## What This Means Technically

- **Backend**: New prompt for sectioned summarization, new DB tables, agent decision endpoint
- **Frontend**: Agent card component, section progress in sidebar, section-level content switching
- **The agent becomes a server-side decision engine** — not just a chat wrapper around an LLM. It reads from the DB, checks prerequisites, tracks progress, and returns structured decisions. The LLM is called only for generating explanations and content, not for making decisions.

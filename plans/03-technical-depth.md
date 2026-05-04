# Technical Depth — Systems That Make This a Real Product

## Current Technical Depth: Minimal

The codebase currently consists of React UI components, Flask REST endpoints, and direct Gemini API calls. There are no algorithms, no ML models, no data pipelines, no stateful systems, and no personalization. This document outlines the technical systems that add real engineering depth.

---

## System 1: Browser-Side Computer Vision Pipeline

### What It Is
Real-time focus detection running entirely in the browser using MediaPipe Face Mesh (WebAssembly). No server involvement. No video frames sent over the network.

### Technical Components

**Face Landmark Extraction:**
- MediaPipe Face Mesh JS SDK returns 478 3D face landmarks per frame
- Process at 15fps using `requestAnimationFrame` with frame skipping
- Run landmark processing in a Web Worker to keep the main thread free

**Signal 1 — Eye Aspect Ratio (EAR):**
- Based on Soukupova & Cech (2016) paper
- EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|) where p1-p6 are eye landmarks
- Computed for both eyes, averaged
- Low EAR sustained > 0.5s = blink. Sustained > 2s = eyes closed (drowsy/distracted)
- Threshold calibrated per user during a 5-second baseline phase at session start

**Signal 2 — Gaze Direction:**
- Estimate gaze using iris landmarks (468-477 in MediaPipe)
- Calculate iris center position relative to eye corner landmarks
- Ratio of iris position gives horizontal/vertical gaze direction
- If gaze consistently deviates from center beyond threshold = looking at another screen
- Combine with head pose (pitch/yaw from face landmark geometry) for robust estimation

**Signal 3 — Blink Rate:**
- Count blinks per minute using EAR dip detection (EAR drops below threshold then recovers)
- Normal blink rate: 15-20/min during screen use
- Elevated blink rate (>25/min) correlates with fatigue and cognitive strain
- Very low blink rate (<10/min) may indicate hyperfocus or zoning out

**Signal 4 — Face Presence:**
- Binary: is a face detected in frame?
- No face for >5 seconds = student left or turned away significantly
- Triggers distraction detection and auto-pause

**Composite Focus Score:**
```
rawScore = w1 * earScore + w2 * gazeScore + w3 * blinkScore + w4 * presenceScore
```
Default weights: w1=0.35, w2=0.30, w3=0.15, w4=0.20. Adjustable based on user calibration.

**Signal Smoothing — Exponential Moving Average:**
```
smoothedScore = alpha * rawScore + (1 - alpha) * previousSmoothedScore
```
Alpha = 0.3 gives a responsive but stable signal. Prevents the jittery random-feeling updates.

**Per-User Calibration:**
- On first session: "Look at the screen naturally for 5 seconds"
- Record baseline EAR, gaze center, blink rate
- All thresholds become relative to the user's baseline
- Accounts for different face shapes, eye sizes, distances from camera, lighting conditions

### Why This Is Deep
This is a real signal processing pipeline: raw sensor data (camera frames) → feature extraction (landmarks) → signal computation (EAR, gaze, blink) → fusion (weighted composite) → smoothing (EMA) → calibration (per-user baseline). Each step is a well-defined engineering problem with published research behind it.

---

## System 2: Adaptive Learning State Machine

### What It Is
A finite state machine that governs content type transitions based on focus signals, user performance, and session history. Replaces the current static if/else threshold logic.

### States
```
READING     — Text-based content (summaries, markdown)
VISUAL      — Mind maps, diagrams
RECALL      — Flashcards with confidence rating
TESTING     — Quizzes with difficulty scaling
GAME        — Interactive mini-games for engagement
MICRO       — TikTok-style short-form content bursts
BREAK       — Suggested break with timer
RECOVERY    — Post-distraction recap and re-engagement
```

### Transition Rules
```
Trigger conditions:
  - focus_below(threshold, duration)  — sustained low focus
  - focus_above(threshold, duration)  — sustained high focus
  - performance(metric, threshold)    — quiz accuracy, card confidence
  - time_in_state(duration)           — been in current mode too long
  - distraction_detected()            — face gone or gaze away
  - user_request(target_state)        — manual switch

Anti-thrashing rules:
  - Minimum 90 seconds in any state before automated transition
  - Cannot return to a state within 3 minutes of leaving it
  - Focus trend (direction) matters more than absolute value
  - Maximum 4 automated transitions per 30-minute window

Escalation path (declining focus):
  READING → VISUAL → RECALL → TESTING → GAME → MICRO → BREAK

Recovery path (improving focus):
  MICRO → GAME → TESTING → RECALL → VISUAL → READING
```

### Transition Effectiveness Memory
After each automated transition, record:
```
{
  from_state: "READING",
  to_state: "TESTING",
  focus_before: 35,        // average focus 60s before transition
  focus_after: 68,         // average focus 60s after transition
  delta: +33,
  user_id: "user-123",
  timestamp: "2026-05-03T14:30:00Z"
}
```

Over time, build a per-user effectiveness profile:
```
user-123:
  READING → TESTING:   avg delta +28 (5 observations) ← preferred
  READING → VISUAL:    avg delta +8  (3 observations)
  READING → RECALL:    avg delta +15 (4 observations)
```

When focus drops during READING, prefer the transition that historically worked best for this user. This is personalization through data, not rules.

### Why This Is Deep
The state machine has formal states, transition rules, anti-thrashing constraints, and a learning component that personalizes over time. It can be formally specified, tested, and explained. The effectiveness memory turns a rule-based system into a data-driven adaptive system.

---

## System 3: Agentic Study Assistant

### What It Is
Not a chatbot. A real agent with tools, context, and the ability to take actions. Built on the Gemini API with function calling.

### Agent Architecture
```
┌──────────────────────────────────────────┐
│              Study Agent                  │
│                                          │
│  Context:                                │
│  - Current document + section            │
│  - Student's focus history (this session)│
│  - Quiz performance so far              │
│  - Knowledge graph position             │
│  - Distraction events                   │
│  - Time remaining (if deadline set)     │
│                                          │
│  Tools:                                  │
│  - search_document(query)               │
│  - generate_explanation(concept, level)  │
│  - generate_quiz(concepts, difficulty)   │
│  - generate_flashcards(concepts)        │
│  - get_prerequisites(concept)           │
│  - get_student_performance(concept)     │
│  - suggest_study_plan(time_remaining)   │
│  - create_recap(last_section_read)      │
│  - switch_content_mode(mode)            │
│                                          │
│  Triggers:                               │
│  - Student asks a question              │
│  - Distraction recovery (auto)          │
│  - Comprehension checkpoint (auto)      │
│  - Focus sustained low (auto)           │
│  - Session start (auto)                 │
│  - Session end (auto)                   │
└──────────────────────────────────────────┘
```

### Agent Scenarios

**Distraction Recovery:**
```
[Face disappears for 2 minutes, then returns]
Agent receives context:
  - Last content: "Memory Management, section 3.2"
  - Student had read 60% of the section
  - Focus was at 45% before distraction
  - This is the 3rd distraction this session

Agent response:
  "Welcome back. You were reading about page replacement algorithms
   in section 3.2. Quick recap: we covered FIFO and LRU algorithms.
   You were about to read about the Optimal algorithm.

   Before continuing — quick check: What's the main drawback of FIFO
   page replacement? [A] [B] [C] [D]

   Note: This is your 3rd break this session. Your focus tends to
   improve after switching to quiz format. Want to try that?"
```

**Proactive Intervention (focus dropping):**
```
[Focus has been below 40% for 45 seconds during text reading]
Agent receives context:
  - Current section: "Process Scheduling Algorithms"
  - Student's effectiveness data: READING → TESTING has +28 avg delta
  - Student scored 3/5 on last quiz about this topic

Agent response:
  "Looks like Process Scheduling is getting dense. Based on your
   previous sessions, switching to a quiz helps you re-engage.
   Want me to generate a quick 3-question quiz on what you've
   read so far?

   [Switch to Quiz]  [Keep Reading]  [Explain This Differently]"
```

**Session Planning:**
```
[Student uploads PDF and sets deadline: "Exam tomorrow 9 AM"]
Agent receives context:
  - Document: 45 pages, 12 sections
  - Current time: 6 PM (15 hours to exam, ~4-5 usable study hours)
  - Student's historical avg focus duration: 18 minutes
  - Student's historical reading speed: ~3 pages/focused-hour

Agent response:
  "I've analyzed your material. Here's your study plan:

   Priority sections (most exam-likely):
   1. Chapter 3: Memory Management (high concept density)
   2. Chapter 5: Process Scheduling (complex, needs active recall)
   3. Chapter 2: OS Structure (foundational, quick review)

   Recommended approach:
   - 6:00-6:25: Read Chapter 3 summary
   - 6:25-6:40: Flashcards on Chapter 3 concepts
   - 6:40-6:45: Break
   - 6:45-7:10: Read Chapter 5 summary
   - 7:10-7:25: Quiz on Chapters 3+5
   - 7:25-7:30: Break
   ... (continues)

   Estimated completion: 9:30 PM with buffer for review.
   I'll adapt the plan as we go based on your focus and performance."
```

### Why This Is Deep
This is a real agentic system — it has persistent context (focus data, performance history, document position), tools it can invoke (content generation, document search, performance lookup), and autonomous triggers (distraction recovery, focus intervention, session planning). It makes decisions, not just responses.

---

## System 4: Knowledge Graph with Prerequisite Detection

### What It Is
Extract concepts and their prerequisite relationships from uploaded documents. Use the graph to guide learning order and identify knowledge gaps.

### Pipeline
```
Document Upload
  → Text extraction (PyPDF2 / pdfplumber)
  → Section chunking (by headings, page breaks, or semantic boundaries)
  → Per-section concept extraction (Gemini: "Extract key concepts from this section")
  → Prerequisite detection (Gemini: "For each concept, what concepts must be understood first?")
  → Graph construction (directed acyclic graph of concept dependencies)
  → Storage in database
```

### Graph Structure
```
Example for an OS textbook:

Computer System Structure
    ├── Hardware Components
    │     ├── CPU ← prerequisite for Process Scheduling
    │     ├── Memory ← prerequisite for Memory Management
    │     └── I/O Devices ← prerequisite for I/O Systems
    ├── Operating System Role
    │     └── Resource Management ← prerequisite for all scheduling topics
    └── User vs System Perspective

Process Management
    ├── Process Concept ← requires: OS Role
    ├── Process Scheduling ← requires: Process Concept, CPU
    │     ├── FCFS
    │     ├── SJF
    │     ├── Round Robin ← requires: FCFS, time quantum concept
    │     └── Priority Scheduling
    └── Synchronization ← requires: Process Concept

Memory Management ← requires: Hardware/Memory
    ├── Virtual Memory ← requires: Memory Management basics
    │     ├── Paging ← requires: Virtual Memory
    │     └── Page Replacement ← requires: Paging
    └── ...
```

### Usage in the Product
1. **Learning order**: If a student fails questions on "Page Replacement," the system checks prerequisites. If they haven't covered "Paging" or "Virtual Memory," it redirects them there first.
2. **Progress visualization**: Show the knowledge graph with nodes colored by mastery level (untouched, in-progress, mastered). Students see exactly where they are.
3. **Content generation targeting**: Generate quizzes and flashcards for concepts the student hasn't mastered yet, weighted by prerequisite importance.
4. **Agent context**: The study agent uses the graph to explain concepts in terms of what the student already knows.

### Why This Is Deep
This combines LLM-powered information extraction with graph algorithms. The prerequisite detection is a real NLP task. The graph traversal for learning path optimization is a real algorithmic problem. The mastery overlay adds a data-driven personalization layer.

---

## System 5: ML-Powered Focus Prediction

### What It Is
A lightweight time-series model that predicts when the student's focus will drop BEFORE it happens, enabling proactive intervention rather than reactive switching.

### Approach
```
Input features (per 30-second window):
  - Mean focus score
  - Focus score variance (stability)
  - Focus score trend (slope of linear fit)
  - Time in current content mode
  - Time since last break
  - Time since session start
  - Current content type (one-hot encoded)
  - Number of distractions so far

Output:
  - Predicted focus score 2 minutes from now
  - Probability of distraction event in next 2 minutes
```

### Model Options (from simple to complex)

**Option A — Statistical (no ML library needed):**
- Exponential smoothing with trend (Holt's method)
- Uses only the focus score time series
- Implementable in ~50 lines of TypeScript
- Runs entirely in the browser

**Option B — Lightweight ML:**
- Small LSTM or GRU network (2 layers, 32 units)
- Train on the user's own historical session data
- Export to TensorFlow.js or ONNX.js for browser inference
- ~5ms inference time per prediction

**Option C — Ensemble:**
- Combine statistical baseline with ML predictions
- Use the statistical model initially (cold start)
- Switch to ML model after accumulating 3+ sessions of data

### Proactive Intervention
Instead of waiting for focus to drop below 25% and then reacting:
```
Current focus: 62% (decent)
Predicted focus in 2 min: 38% (about to drop)
Trend: declining steadily for 4 minutes
Time in current mode: 8 minutes

→ Agent: "Your focus is starting to drift. Good time for a quick
   3-question quiz on what you just read to lock it in?"
```

The student experiences the system as uncannily perceptive — it catches them before they even realize they're losing focus.

### Why This Is Deep
Time series prediction, even with simple methods like exponential smoothing, is genuine data science. The LSTM option adds real ML. The proactive intervention based on prediction is a meaningful product differentiator — no other study tool predicts attention drops before they happen.

---

## System 6: Session Analytics Engine

### What It Is
Real-time and post-session analysis of learning behavior, distraction patterns, and content effectiveness.

### Data Collection (per session)
```
Focus time series:     [{timestamp, focusScore, contentType}] at 2-second intervals
Distraction events:    [{startTime, endTime, duration, recoveryTime}]
Content transitions:   [{fromType, toType, trigger, focusBefore, focusAfter}]
Quiz attempts:         [{questionId, concept, isCorrect, timeSpent, difficulty}]
Flashcard reviews:     [{cardId, concept, confidence, timeSpent}]
Scroll/interaction:    [{timestamp, eventType}] — proof of active engagement
```

### Real-Time Analytics (during session)
```
- Current focus streak (time since last distraction)
- Running distraction count with comparison to previous session
- Focus-per-content-type breakdown (live updating)
- Concepts covered vs total
- Estimated completion time based on current pace
```

### Post-Session Analytics
```
Session Summary:
  Total duration:         45 minutes
  Focused time:           32 minutes (71%)
  Distraction events:     6 (avg duration: 2.1 min)
  Longest focus streak:   11 minutes (during Quiz)
  Content effectiveness:
    Text:       avg focus 54%, time spent 15 min
    Quiz:       avg focus 73%, time spent 12 min  ← best format for you
    Mindmap:    avg focus 61%, time spent 8 min
    Flashcard:  avg focus 58%, time spent 7 min

  Quiz performance:       5/7 correct (71%)
  Weak concepts:          Page Replacement, Virtual Memory
  Strong concepts:        Process Scheduling, OS Structure

  Distraction pattern:    Focus drops every ~7 minutes during text reading
  Recommendation:         Switch to active recall after 5 min of reading

  Comparison to last session:
    Focused time:         71% vs 63% (+8%)
    Distractions:         6 vs 9 (improving)
    Quiz accuracy:        71% vs 57% (+14%)
```

### Cross-Session Trends
```
Weekly view:
  Mon: 45 min focused (3 sessions)
  Tue: 60 min focused (2 sessions)
  Wed: skipped
  Thu: 30 min focused (1 session)

  Avg focus duration improving: 6 min → 8 min → 11 min over 2 weeks
  Best study time: 7-9 PM (highest avg focus)
  Worst study time: 2-4 PM (most distractions)
```

### Why This Is Deep
This is behavioral analytics on biometric data. The distraction pattern detection, content effectiveness ranking, and cross-session trend analysis are real data analysis tasks. The session comparison ("you're improving") creates a feedback loop that drives behavior change. Confronting ADHD students with their actual data — not gamified streaks but real numbers — is what makes this product genuinely useful.

---

## System 7: TikTok-Style Micro-Learning Engine

### What It Is
When focus is critically low and traditional content formats aren't working, switch to ultra-short-form content — 15-30 second concept bursts designed for attention-deficit states.

### Content Generation Pipeline
```
Document sections
  → Extract atomic concepts (one idea per card)
  → Gemini generates for each concept:
      - One-sentence hook ("Did you know...?" / "Here's why X matters:")
      - 2-3 sentence explanation (simple language, no jargon)
      - One memorable analogy or example
      - One retention question
  → Format as vertical card with large text
  → Browser TTS reads it aloud with word-by-word highlighting
  → Auto-advance after TTS completes (or swipe)
```

### UX Pattern
```
┌─────────────────────┐
│                     │
│   Virtual Memory    │
│                     │
│  Think of it like   │
│  your desk. RAM is  │
│  the desk surface.  │
│  Virtual memory is  │
│  the drawer — you   │
│  swap papers in and │
│  out as needed.     │
│                     │
│  ▶ [listening...]   │
│                     │
│  ← swipe: skip      │
│  → swipe: replay    │
│  ↑ swipe: "I know"  │
│  ↓ swipe: bookmark  │
│                     │
│  3 / 24 concepts    │
└─────────────────────┘
```

### Why This Matters for ADHD
Traditional study tools assume the student can sustain attention for paragraphs. This mode meets students at their actual attention capacity — 15 seconds — and delivers complete concepts within that window. It's not dumbing down; it's format-fitting. The student absorbs concepts passively, then the system uses comprehension checks to verify retention.

### Why This Is Deep
The content pipeline (concept atomization → hook generation → analogy creation → TTS sync → swipe interaction) is a multi-step content transformation system. The karaoke-style word highlighting requires synchronizing TTS timing with DOM updates. The swipe-based interaction with progress tracking is a real UX engineering challenge.

---

## System 8: Voice Podcast Mode with Comprehension Checks

### What It Is
Generate a conversational audio overview of the study material — similar to NotebookLM's Audio Overviews — with embedded comprehension questions that pause playback and require answers.

### Generation Pipeline
```
Document summary + knowledge graph
  → Gemini generates conversational script:
      "Let's talk about Operating Systems. At its core, an OS is
       the middleman between you and your computer's hardware..."
  → Insert comprehension checkpoints every 2-3 minutes:
      "Quick question before we move on: What are the three main
       goals of an Operating System? Take a moment to think..."
  → Browser SpeechSynthesis API or ElevenLabs for voice
  → Playback with pause/resume, speed control
  → On checkpoint: pause, show question, wait for response
  → If incorrect: re-explain that section before continuing
```

### Interactive Audio UX
```
🔊 Playing: Operating Systems Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 12:34 / 28:00

[Auto-pause at checkpoint]

Quick Check:
"What's the difference between a process and a program?"

  [A] A process is stored on disk, a program runs in memory
  [B] A program is stored on disk, a process is a running instance  ←
  [C] They are the same thing
  [D] A process is hardware, a program is software

[Continue Playing]
```

### Why This Is Deep
Generating pedagogically sound conversational scripts is a non-trivial prompt engineering challenge. Synchronizing audio playback with interactive comprehension checkpoints requires careful state management. The re-explanation flow on incorrect answers creates a branching audio experience that adapts in real-time.

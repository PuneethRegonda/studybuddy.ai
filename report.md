# StudyBuddy.AI -- Adaptive Learning Assistant

A Project Report Presented to The Faculty of the College of Engineering
San Jose State University In Partial Fulfillment Of the Requirements for the Degree
Master of Science in Software Engineering

By
Mahesh Cheekuri, Puneeth Regonda, Siri Chandana Uppula, Sunil Vurandur

May 2026

---

Copyright 2026
Mahesh Cheekuri, Puneeth Regonda, Siri Chandana Uppula, Sunil Vurandur
ALL RIGHTS RESERVED

---

APPROVED

Dr. Younghee Park, Project Advisor
Dan Harkey, Director, MS Software Engineering
Jorjeta Jetcheva, Department Chair

---

## ABSTRACT

**StudyBuddy.AI -- Adaptive Learning Assistant**
By Mahesh Cheekuri, Puneeth Regonda, Siri Chandana Uppula, Sunil Vurandur

Self-directed learning remains a persistent challenge because existing study tools deliver static content that does not adapt to a learner's real-time attention or cognitive state. This limitation leads to disengagement, reduced retention, and missed opportunities for timely intervention. StudyBuddy.AI addresses this gap by providing an attention-aware adaptive learning assistant that combines privacy-preserving focus tracking with AI-driven content generation to deliver personalized, context-sensitive learning interventions.

The system introduces four key innovations: (1) local, privacy-preserving attention estimation using MediaPipe FaceMesh and Eye Aspect Ratio (EAR) calculations running entirely in the browser via WebAssembly at 5 Hz or higher; (2) AI-powered content synthesis via the Anthropic Claude API, enabling native PDF comprehension through Claude Vision, document sectioning with knowledge graph extraction, flashcard and quiz generation, concept visualization, and audio narration via Edge TTS neural voices; (3) a threshold-based adaptive decision engine that triggers multimodal interventions (quizzes, flashcards, mind maps, audio narration, drag-and-drop games, or break prompts) with anti-thrashing logic including minimum dwell times, cooldown periods, and effectiveness memory that learns which format transitions work best; and (4) an agentic conversational study assistant backed by Claude Sonnet 4 that provides contextual guidance, distraction recovery, section progression management, and free-form question answering grounded in the uploaded material.

The privacy-first architecture ensures that all video processing takes place on the client side with zero frame transmission, while the adaptive engine personalizes learning without the need for pre-trained models. The system processes documents natively through Claude Vision API -- reading text, images, diagrams, and tables directly from the PDF without lossy text extraction -- and organizes content into structured sections with concept prerequisites and a knowledge graph. This study enhances educational technology by demonstrating how real-time cognitive state monitoring may be combined with generative AI to create user-friendly, scalable, and privacy-conscious personalized learning systems.

---

## Acknowledgments

The authors are deeply indebted to Professor Dr. Younghee Park for her invaluable comments and assistance in the preparation of this study.

---

## Table of Contents

- Chapter 1. Project Overview
  - 1.1 Introduction
  - 1.2 Proposed Areas of Study and Academic Contribution
  - 1.3 Current State of the Art
- Chapter 2. Project Architecture
  - 2.1 Introduction
  - 2.2 Architecture Subsystems
- Chapter 3. Technology Descriptions
  - 3.1 Client Technologies
  - 3.2 Middle-Tier Technologies
  - 3.3 Data-Tier Technologies
- Chapter 4. Project Design
  - 4.1 Client Design
  - 4.2 Middle-Tier Design
  - 4.3 Data-Tier Design
- Chapter 5. Project Implementation
  - 5.1 Client Implementation
  - 5.2 Middle-Tier Implementation
  - 5.3 Data-Tier Implementation
- Chapter 6. Testing and Verification
- Chapter 7. Performance and Benchmarks
- Chapter 8. Deployment, Operations, Maintenance
- Chapter 9. Summary, Conclusions, and Recommendations
- Glossary
- References
- Appendices

---

## List of Figures

- Figure 2.1: System Architecture Diagram
- Figure 4.1: User Interface -- Dashboard, Study View, Agent Chat
- Figure 4.2.1: UML Class Diagram
- Figure 4.2.2: Sequence Diagram
- Figure 4.2.3: State Diagram
- Figure 4.3.1: Database Schema (Entity Relationship Diagram)

---

## Chapter 1. Project Overview

### 1.1 Introduction

In contemporary education, self-directed learning continues to be a challenge. Current study tools, such as textbook companions, learning management systems, and flashcard applications, offer static content that does not adjust in real time to the learner's attention or cognitive state. When working with long academic literature, students often find it difficult to maintain focus. Even though current AI-powered educational tools can create quizzes, flashcards, and summaries, they are unable to dynamically adjust learning modalities based on cognitive engagement or offer real-time feedback on learner attention [1]. This limitation is most apparent in situations involving self-directed learning. Students do not receive the adaptive scaffolding and external responsibilities that are often provided by traditional classroom instruction.

Research in educational psychology indicates that during study sessions, attention naturally changes. Lower content retention and comprehension are significantly correlated with periods of diminished focus [1]. Despite this data, the majority of contemporary learning management systems are reactive rather than proactive. When students need different engagement strategies, they require students to self-identify their disengagement and manually switch to other learning tasks. Many students may not have completely developed metacognitive skills, particularly those who are new to a subject.

By creating an attention-aware adaptive learning assistant, this research directly addresses this crucial gap. The system blends AI-powered multimodal content creation with privacy-preserving real-time focus tracking. It uses MediaPipe FaceMesh running entirely in the browser via WebAssembly to monitor learner attention, computing Eye Aspect Ratio (EAR), gaze direction via iris landmark tracking, blink rate, and head pose estimation to produce a composite focus score normalized to 0-100. When focus thresholds are not met, the system initiates contextually appropriate interventions. Flashcards, quizzes, concept visualizations, audio narration, drag-and-drop matching games, and break prompts are examples of interventions. StudyBuddy.AI distributes content based on the learner's cognitive state rather than using fixed schedules. By providing spaced retrieval exercises at optimal receptivity, the system improves engagement and retention.

From basic rule-based models to complex learner modeling techniques, traditional intelligent tutoring systems have developed. Student mastery is represented by Bayesian Knowledge Tracing as a concealed state that changes probabilistically with each response [3]. Deep Knowledge Tracing uses recurrent neural networks in place of manually constructed state models to capture longer-term learning patterns. Nevertheless, both strategies place more emphasis on response accuracy than on engagement levels in real time. StudyBuddy.AI, by introducing attention as a first-class signal for adaptation, expands on current methods. Instead of only identifying comprehension issues after inaccurate answers, this enables the system to prevent them before they arise.

In terms of technology, education, and societal influence, this work is important. In terms of technology, the system demonstrates how cutting-edge web technologies -- WebAssembly for on-device machine learning, modern React with server-side rendering, and edge computing for real-time processing -- can provide complex real-time AI applications while strictly safeguarding user privacy. By referencing cognitive science research on attention, recall, and spaced repetition, it validates adaptive intervention strategies in education. It provides empirical proof that learning outcomes are enhanced by real-time attention monitoring. Socially, it makes customized learning assistance more accessible, which was formerly limited to costly one-on-one instruction. Regardless of institutional resources or socioeconomic situation, it offers students scalable assistance.

### 1.2 Proposed Areas of Study and Academic Contribution

The four interrelated fields of instructional technology, affective computing, natural language processing, and adaptive systems are the subject of this study. Every field contributes differently to the actual application of AI in education as well as the system design.

#### 1.2.1 Privacy-Preserving Real-Time Attention Estimation

Conventional attention tracking solutions in educational contexts rely on server-based video processing or invasive physiological sensors like EEG or eye tracking equipment. Both strategies present significant privacy issues. Commercial eye trackers and EEG headsets are expensive, difficult to use for extended periods, and require special setup. Server-side video processing raises concerns over data retention, unauthorized access, and the secondary use of biometric data by sending potentially sensitive facial images to distant computers.

StudyBuddy.AI advances the field by showing that client-side facial landmark processing using MediaPipe FaceMesh and Eye Aspect Ratio (EAR) computations may achieve accurate attention assessment. 468 three-dimensional facial landmarks are processed directly in the browser using WebAssembly. The system computes multiple attention signals: EAR for eye openness and drowsiness detection, iris landmark tracking (landmarks 468-477) for gaze direction estimation, head pose estimation via nose-cheek-forehead geometry for detecting looking away, and blink rate monitoring for fatigue detection. Through REST API endpoints, only scalar measurements are transmitted. Biometric information, facial photographs, and unprocessed video frames never leave the user's device.

In educational settings, this method encourages privacy-conscious affective computing [1][4]. The technique achieves a suitable compromise between measurement quality and user privacy by storing sensitive biometric data only on the device and maintaining high temporal resolution with updates at 5 Hz or above. An asymmetric exponential moving average smoother -- using faster decay (alpha = 0.5) when scores drop and slower rise (alpha = 0.25) when scores increase -- preserves real attention state transitions while removing physiological noise such as blink artifacts and small head movements. This resolves a basic problem with real-time psychophysiological monitoring that has made it difficult to put such systems into practice [2].

#### 1.2.2 Adaptive Content Generation with Grounded AI

The system uses the Anthropic Claude API (Sonnet 4) to create context-aware educational content based on resources supplied by the students. StudyBuddy.AI is different from traditional intelligent tutoring systems which rely on pre-written knowledge bases that require extensive instructor effort to create and maintain. The system uses Claude Vision API to process uploaded PDFs natively -- reading text, images, diagrams, and tables directly from the document binary without requiring intermediate text extraction tools such as PyMuPDF or pdfminer. This native multimodal processing preserves visual context that text-only extraction would lose, including mathematical formulas, figures, and formatted tables.

The document processing pipeline produces structured output: the uploaded document is broken into semantically coherent study sections, each with extracted concepts, prerequisite relationships, estimated reading time, and detailed Markdown content. A knowledge graph is simultaneously extracted, modeling concept dependencies that enable prerequisite checking before students advance to new topics. Scaling rules ensure appropriate granularity: short documents (1-3 pages) produce 2-3 sections, medium documents (4-10 pages) produce 3-5 sections, and long documents (10+ pages) produce 5-8 sections.

Content generation is section-scoped: flashcards focus on key definitions and terminology (5-7 per section), quizzes test understanding and application with plausible distractors (5-7 multiple-choice questions per section), mind maps visualize concept hierarchies, and drag-and-drop matching games provide interactive reinforcement. All generated content is cached per section in the database, eliminating redundant API calls and ensuring instant retrieval on subsequent accesses.

#### 1.2.3 Threshold-Based Adaptive Decision Systems

Although machine learning approaches to learner modeling have demonstrated promise, they frequently require significant training data, are computationally costly, and produce findings that are difficult for teachers and students to comprehend or trust. Deep knowledge tracing models may achieve high predicted accuracy, but they do not offer much information about the rationale behind the choice of a particular action.

StudyBuddy.AI offers a dual-layer adaptive system. The first layer is a deterministic agent decision engine that operates server-side with zero latency and zero API cost. This engine handles five key decision points: welcome/resume logic (detecting returning students and their progress), focus drop interventions (rotating through content format suggestions based on current format), section completion flow (suggesting quizzes or next sections), quiz result handling (branching on score >= 70% for advancement vs. review), and distraction return recovery (detecting face absence and providing context when the student returns). The logic is entirely transparent and interpretable -- educators and students can understand exactly why each decision was made.

The second layer is a client-side adaptive state machine with six states: READING, VISUAL, RECALL, TESTING, GAME, and BREAK. This state machine includes anti-thrashing protections: a configurable minimum dwell time before automatic transitions, a cooldown period between transitions, and a maximum transitions-per-window limit. Most importantly, it maintains an effectiveness memory that records the focus score delta before and after each transition. When sufficient history exists (>= 2 data points per transition type), the state machine uses this memory to select the transition that has historically produced the greatest focus improvement for the current user, enabling personalized adaptation without machine learning training data.

#### 1.2.4 Spaced Repetition and Multimodal Learning Support

StudyBuddy.AI expands on well-known cognitive science research on retrieval practice and the spacing effect. The spacing effect claims that spreading out practice sessions across time results in greater long-term recall than massed practice. Retrieval exercises -- actively recalling information through tests or flashcards -- improve memory more successfully than passive review.

The system uses multimodal intervention techniques to put these ideas into practice while encouraging long-term retention. It generates flashcards focused on terminology and definitions, quizzes testing understanding and application, visual concept maps with hierarchical relationships rendered via ReactFlow, drag-and-drop matching games for interactive reinforcement, and audio narration using Edge TTS neural voices to accommodate auditory learners and reduce cognitive strain during extended study periods [5].

Section-based mastery tracking follows a structured progression: Not Started -> In Progress -> Read -> Tested -> Mastered. Quiz results update both section mastery and concept-level understanding. The knowledge graph visualization shows which concepts the student has learned and which remain, enabling students to see their progress at a glance. Unlike conventional spaced repetition systems like Anki or SuperMemo, StudyBuddy.AI modifies the timing and format of interventions based on the learner's current attention levels rather than preset schedules.

### 1.3 Current State of the Art

Intelligent tutoring systems, natural language processing, affective computing, and cognitive science are among the research fields that have made significant contributions to the state of the art in AI-supported education. Understanding the current state is essential to situate StudyBuddy.AI's contributions.

#### 1.3.1 Intelligent Tutoring and Personalization

Adaptive learning systems have evolved from simple rule-based tutors to complex learner modeling techniques. Bayesian Knowledge Tracing (BKT) models student mastery as a hidden state that updates probabilistically with each response [3]. BKT has been successful in well-structured domains with clear, identifiable abilities. However, it assumes simplified learning dynamics and requires manual definition of knowledge components. Deep Knowledge Tracing (DKT) addresses some shortcomings by substituting hand-crafted state models with recurrent neural networks that learn to represent student knowledge from sequence data. DKT does not require manual knowledge component specification and is capable of identifying long-term learning patterns.

However, both BKT and DKT ignore real-time engagement states and mainly rely on answer correctness as a signal for adaptation. An interested student who comprehends the material receives the same treatment as a distracted student who makes an accurate guess. StudyBuddy.AI, by employing attention as a first-class signal for adaptation and reacting proactively when attention metrics show poor engagement instead of waiting for incorrect responses to infer knowledge gaps, advances beyond current methods.

#### 1.3.2 Natural Language Processing for Long Documents

Transformer-based language models have particular difficulties when processing long academic text due to the quadratic scaling of attention mechanisms with input length. Strong baselines were created by early summarizing models like BERTSUM and PEGASUS, but they had trouble handling documents longer than 512-1024 tokens, necessitating truncation that eliminated potentially important information. Longformer and LED (Long-form Encoder-Decoder) overcome this restriction with efficient attention patterns that scale linearly rather than quadratically, allowing end-to-end processing of documents up to 16,384 tokens or more [5].

StudyBuddy.AI takes a fundamentally different approach by leveraging Anthropic's Claude Vision API, which supports native PDF document processing. Rather than extracting text and losing visual context, the system sends the entire PDF binary to Claude's multimodal model, which can read text, interpret images, parse tables, and understand diagrams directly. This eliminates the traditional NLP pipeline of text extraction, chunking, and context window management. Claude's 200,000-token context window can process entire academic papers in a single pass, producing structured sections with concepts, prerequisites, and a knowledge graph in one API call.

Retrieval-Augmented Generation (RAG) enhances factual correctness by basing generation on retrieved evidence rather than just the model's parametric knowledge. StudyBuddy.AI applies RAG principles by grounding all generated content in the specific sections of the uploaded document. Each flashcard, quiz question, and mind map is generated from a specific section's content, maintaining provenance between generated study materials and source document spans.

#### 1.3.3 Neural Question Generation and Content Creation

Neural question generation models have made significant advancements in automated educational question generation. Contemporary methods can target specific areas of source documents and differentiate between Bloom's Taxonomy stages, including remembering, understanding, applying, analyzing, evaluating, and producing.

StudyBuddy.AI makes use of these developments through structured prompting of the Claude API. The quiz generation prompt specifically requests questions that test "understanding and application, not just recall" and asks for questions about relationships between concepts, scenario-based reasoning, and plausible distractors. Flashcard prompts are differentiated by focusing on "key definitions and terminology" rather than conceptual relationships, ensuring complementary coverage between flashcards and quizzes. All generated content is validated through JSON schema parsing before being presented to students.

#### 1.3.4 Attention and Engagement Sensing

Numerous approaches to gauging learner involvement have been investigated in affective computing research. These include behavioral patterns like mouse movements and keystroke dynamics, physiological signals like skin conductance and heart rate variability, and visual cues like head posture, eye gazing, and facial expressions [1]. Despite their effectiveness, many methods present privacy issues through server-side video processing or call for specific hardware like eye trackers or EEG headsets.

MediaPipe FaceMesh represents a significant advancement in the accessibility and privacy preservation of attention detection [2]. The technology uses on-device machine learning models that are tailored to operate in web browsers via WebAssembly to recognize 468 three-dimensional facial landmarks in real time. The method offers a non-intrusive, computationally effective proxy for attention and alertness when paired with Eye Aspect Ratio (EAR) computations, a geometric measure of eye openness determined from landmark positions surrounding each eye.

StudyBuddy.AI builds upon this foundation by implementing a comprehensive client-side focus detection engine. The engine computes multiple signals: Eye Aspect Ratio using the Soukupova and Cech (2016) formula with six landmark points per eye, gaze direction via iris center landmarks (468-477) relative to eye corner boundaries, head pose deviation using nose-cheek-forehead geometry for yaw and pitch estimation, and blink rate tracking with a 60-second sliding window. These signals are combined into a weighted composite score using configurable weights for EAR, gaze, blink rate, and face presence. The asymmetric EMA smoother responds quickly to disengagement (alpha = 0.5) while smoothing out brief glances (alpha = 0.25). Additionally, a linear regression-based focus predictor analyzes the last 30 seconds of focus history to predict where focus will be in 30 seconds, enabling proactive intervention before focus actually drops below threshold. This achieves update rates of 5 Hz or higher while guaranteeing that no video frames leave the user's device [4].

#### 1.3.5 Spaced Repetition and Retention Optimization

The spacing effect is one of the most robust findings in scientific education. Long-term recall is significantly improved by spreading practice across time as opposed to massed exercise. Anki and SuperMemo are examples of traditional spaced repetition systems that use preset scheduling algorithms to modify review timing based on past performance. These methods do not take into account real-time attention states or modify presentation mode based on current cognitive load.

StudyBuddy.AI improves this strategy by using attention indicators to inform spacing decisions. When the system detects high focus, it may present fresh or more challenging content. When concentration is low, it might provide a review of previously learned content or change to a different medium, such as flashcards instead of text. The adaptive state machine's effectiveness memory learns which content format transitions produce the best focus improvement for each individual user, enabling personalized adaptation.

#### 1.3.6 Privacy-Preserving Architectures

Research on federated learning, differential privacy, and edge computing architectures that minimize data exposure has been prompted by increasing concerns about data privacy [4]. These issues are especially serious in educational settings since learning records and biometric data are extremely sensitive.

StudyBuddy.AI uses a privacy-by-design architecture incorporating five principles. First, client-side local processing is used for all facial landmark identification and EAR computation. Second, data minimization ensures that servers receive only scalar attention scores. Third, explicit opt-in with visual cues remains visible when the camera is in use, allowing the user to control participation. Fourth, all network communications use encrypted HTTPS. Fifth, transparency via unambiguous privacy design ensures that no raw biometric data is ever stored or transmitted.

#### 1.3.7 Synthesis and Positioning

StudyBuddy.AI extends the state of the art in attention-aware adaptive learning systems by combining: real-time focus tracking at 5 Hz or above using client-side MediaPipe FaceMesh with multi-signal composite scoring; native PDF comprehension via Claude Vision API that preserves visual context including images, diagrams, and tables; deterministic adaptive decision logic with interpretable rules and effectiveness memory for personalized adaptation; section-based mastery tracking with knowledge graph-driven prerequisite validation; and an agentic conversational study assistant that provides contextual guidance throughout the learning session. The system provides a reproducible basis for additional study at the intersection of affective computing, natural language processing, and personalized learning.

---

## Chapter 2. Project Architecture

### 2.1 Introduction

StudyBuddy.AI employs a layered client-server architecture that integrates AI-powered study aids with real-time attention tracking while ensuring privacy, maintainability, and responsive performance. The architecture divides concerns into three principal tiers: presentation (user interface and client-side processing), application logic (backend services and AI integration), and data management (persistence and caching). Three key principles are given priority in the design:

- **Privacy by Design**: All visual processing takes place on the client side. Only scalar focus measurements cross network boundaries. No video frames, facial images, or biometric data are ever transmitted.
- **Real-Time Responsiveness**: Client-side focus detection operates at 5 Hz or higher. The adaptive state machine runs entirely in the browser for zero-latency transition decisions. Content generation results are cached per section for instant retrieval.
- **Intelligent Simplicity**: A streamlined single-service backend architecture eliminates operational complexity while maintaining clean separation of concerns through modular Python modules. SQLite provides zero-configuration embedded persistence. Claude Vision API processes PDFs natively, eliminating the need for text extraction pipelines.

The following essential functionalities are supported by the architecture:

- **REST API Communication**: Clean request-response operations between the Next.js frontend and Flask backend for document upload, content generation, session management, agent decisions, and chat.
- **Edge Processing**: Computationally demanding operations (facial landmark detection, EAR computation, composite scoring, focus prediction, and adaptive state machine transitions) run entirely in the browser, ensuring privacy and reducing server load.
- **Graceful Degradation**: When webcam access is denied or unavailable, the system continues to function with manual content switching, maintaining full study functionality without focus tracking.
- **Content Caching**: All generated content (flashcards, quizzes, mind maps, games) is cached per document section in the database, ensuring instant retrieval on subsequent accesses and eliminating redundant API calls.

### Architecture Diagram

```
+------------------------------------------------------------------+
|                    Browser (Next.js 15 + React 19)                |
|                                                                    |
|  +----------------------------+  +-----------------------------+  |
|  | Focus Detection Engine     |  | Adaptive State Machine      |  |
|  | (MediaPipe WASM)           |  | (Client-Side)               |  |
|  |                            |  |                             |  |
|  | - FaceLandmarker (468 pts) |  | States: READING, VISUAL,   |  |
|  | - EAR computation          |  |   RECALL, TESTING, GAME,   |  |
|  | - Iris gaze tracking       |  |   BREAK, RECOVERY          |  |
|  | - Head pose estimation     |  | - Anti-thrashing logic     |  |
|  | - Blink rate detection     |  | - Effectiveness memory     |  |
|  | - Asymmetric EMA smoother  |  | - Focus predictor (LR)     |  |
|  | - Calibration system       |  |                             |  |
|  +----------------------------+  +-----------------------------+  |
|                                                                    |
|  +----------------------------+  +-----------------------------+  |
|  | Activity Tracker           |  | UI Components               |  |
|  | - Tab visibility API       |  | - shadcn/ui + Tailwind v4  |  |
|  | - Inactivity detection     |  | - ReactFlow (knowledge     |  |
|  |   (scroll/click timeout)   |  |   graph + mind maps)       |  |
|  +----------------------------+  | - Recharts (focus charts)  |  |
|                                  | - Framer Motion            |  |
|  +----------------------------+  | - Agent chat + inline      |  |
|  | Service Layer              |  |   cards                    |  |
|  | - agentService.ts          |  +-----------------------------+  |
|  | - contentService.ts        |                                   |
|  | - sessionService.ts        |                                   |
|  +----------------------------+                                   |
+------------------------------------------------------------------+
                          | REST API (HTTPS)
                          v
+------------------------------------------------------------------+
|              Flask Backend (Single Service, Port 5001)            |
|                                                                    |
|  +----------------------------+  +-----------------------------+  |
|  | Document Processor         |  | Agent Decision Engine       |  |
|  | - PDF -> Claude Vision API |  | (Deterministic, No LLM)    |  |
|  |   (native binary, base64)  |  |                             |  |
|  | - Text/MD -> Claude Text   |  | - decide_welcome()         |  |
|  | - Structured JSON output:  |  | - decide_focus_drop()      |  |
|  |   sections, concepts,      |  | - decide_section_complete() |  |
|  |   prerequisites, KG        |  | - decide_quiz_result()     |  |
|  +----------------------------+  | - decide_distraction_return|  |
|                                  | - check_prerequisites()    |  |
|  +----------------------------+  +-----------------------------+  |
|  | Content Generator          |                                   |
|  | (Claude API, cached/section)|  +-----------------------------+ |
|  | - Flashcards (5-7/section) |  | Study Agent (LLM Chat)     |  |
|  | - Quizzes (5-7 MCQ/section)|  | - Claude Sonnet 4          |  |
|  | - Mind maps (hierarchical) |  | - Session context assembly |  |
|  | - Mini-games (drag-drop)   |  | - Conversation persistence |  |
|  +----------------------------+  | - Distraction recap        |  |
|                                  +-----------------------------+  |
|  +----------------------------+                                   |
|  | Knowledge Graph Extractor  |  +-----------------------------+  |
|  | - Concept extraction       |  | TTS Service                |  |
|  | - Prerequisite mapping     |  | - Edge TTS neural voices   |  |
|  | - Importance rating (1-5)  |  | - Async audio generation   |  |
|  +----------------------------+  +-----------------------------+  |
+------------------------------------------------------------------+
                          | SQLAlchemy ORM
                          v
+------------------------------------------------------------------+
|              SQLite Database (studybuddy.db)                      |
|                                                                    |
|  documents | document_sections | section_progress | sessions      |
|  focus_events | quiz_attempts | content_transitions               |
|  distraction_events | generated_content | chat_messages           |
+------------------------------------------------------------------+
```

*Figure 2.1: System Architecture Diagram*

This architecture meets nonfunctional requirements for performance (sub-second content retrieval from cache, 5 Hz focus tracking), privacy (zero video frame transmission), and maintainability (single-service deployment with modular Python backend).

### 2.2 Architecture Subsystems

The eight main subsystems of StudyBuddy.AI are each responsible for a specific functional capability. Each subsystem's duties, essential technologies, and relationships with other parts are explained in this section.

#### 2.2.1 Frontend Layer (Web Client)

A responsive Next.js 15 and React 19 application that handles user interactions, client-side video processing for attention tracking, and communication with backend services via REST API calls.

**Technologies**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui component library, ReactFlow (knowledge graph and mind map visualization), Recharts (focus score charts), Framer Motion (animations), MediaPipe Face Mesh (WebAssembly), react-markdown.

**Key Responsibilities**:

- Provide an interactive user interface for uploading documents, navigating sections, displaying summaries, interacting with flashcards and quizzes, visualizing mind maps and knowledge graphs, and delivering agent interventions.
- Run the FocusEngine class using MediaPipe FaceLandmarker to perform client-side video processing with requestAnimationFrame for frame-level control, throttled to the configured target FPS.
- Maintain the AdaptiveStateMachine that evaluates focus scores every 2 seconds and determines state transitions with anti-thrashing protections.
- Manage the Activity Tracker that monitors tab visibility (document.visibilityState) and user inactivity (no scroll or click events for 60 seconds).
- Communicate with the Flask backend through a service layer (agentService.ts, contentService.ts, sessionService.ts) for all data operations.

**Privacy-Preserving Design**: MediaPipe FaceLandmarker runs entirely within the browser's JavaScript runtime via WebAssembly. No video frames are serialized or transmitted. The camera feed is accessed through the standard getUserMedia API with explicit user consent. Only scalar focus scores (0-100) are sent to the backend via REST API calls for session analytics. A visual camera indicator is displayed while the camera is active.

**Performance Optimizations**: Dynamic imports are used for MediaPipe to avoid SSR and bundler issues with WASM modules. The focus engine throttles frame processing to the configured target FPS to prevent unnecessary computation. Code splitting through Next.js reduces initial bundle size. Generated content components (flashcards, quizzes, mind maps, games) are loaded on demand when the user switches content tabs.

#### 2.2.2 Document Processing Pipeline

The document processing subsystem handles the intake, analysis, and structuring of uploaded educational materials using Claude Vision API for native PDF comprehension.

**Technologies**: Anthropic Claude API (claude-sonnet-4-20250514), Claude Vision API for native PDF processing, base64 encoding for binary PDF transmission.

**Key Responsibilities**:

- Accept PDF, text, and Markdown file uploads through the /upload endpoint.
- For PDF files: encode the PDF binary as base64 and send it to Claude Vision API as a native document attachment. Claude reads the PDF directly -- including text, images, diagrams, tables, and mathematical formulas -- without requiring text extraction libraries.
- For text/Markdown files: send the text content directly to Claude's text API (truncated to 30,000 characters for very large files).
- Parse Claude's structured JSON response containing title, summary, sections (with content, concepts, prerequisites, estimated reading time), and a knowledge graph of concept dependencies.
- Store the structured output in the database: Document record with summary and knowledge graph, DocumentSection records with Markdown content and concept metadata, and SectionProgress records initialized as "not_started."

**Design Rationale**: Native PDF processing via Claude Vision API eliminates an entire layer of complexity. Traditional document processing pipelines require text extraction (PyMuPDF/pdfminer), cleaning, chunking (500-token windows with overlap), and semantic boundary detection. By sending the PDF binary directly to a multimodal model, the system preserves visual context that text extraction loses, handles scanned documents and images naturally, and produces higher-quality structured output in a single API call.

**Scaling Rules**: The prompt instructs Claude to scale sections to document size: short documents (1-3 pages) get 2-3 sections maximum, medium documents (4-10 pages) get 3-5 sections, and long documents (10+ pages) get 5-8 sections. Each section is required to be substantial (at least 3-5 minutes of reading) to prevent fragmentation.

#### 2.2.3 Agent Decision Engine

A deterministic, zero-latency decision engine that handles routine study flow decisions without requiring LLM API calls.

**Technologies**: Python, SQLAlchemy queries, deterministic rule logic.

**Key Responsibilities**:

- **Welcome/Resume Decisions**: When a student opens a document, the engine checks section progress to determine whether this is a first visit or a return. For returning students, it identifies the next unmastered section, checks prerequisites against the knowledge graph, and generates appropriate welcome messages with action buttons.
- **Focus Drop Suggestions**: When the adaptive state machine detects sustained low focus, the engine suggests switching content format. The suggestions follow a rotation based on the current format: text -> flashcards, flashcards -> quiz, quiz/other -> mind map. Each suggestion includes both an accept and dismiss button.
- **Section Completion Flow**: When a student finishes reading a section, the engine suggests either taking a quiz to test understanding or moving to the next section.
- **Quiz Result Handling**: After a quiz, the engine branches based on score. Scores >= 70% advance the section status to "tested" and suggest moving to the next section (with weak concept review if needed). Scores < 70% suggest review via flashcards or re-reading the section.
- **Prerequisite Checking**: Before advancing to a new section, the engine checks whether the concepts listed as prerequisites have been covered in mastered or tested sections. If prerequisites are unmet, it suggests reviewing them first.
- **Distraction Return**: When the focus engine detects face absence followed by return, the decision engine provides a brief context message about where the student left off.

**Design Rationale**: By handling routine decisions deterministically rather than through LLM calls, the system achieves zero-latency responses (no API round-trip), zero marginal cost (no token usage for routine decisions), predictable behavior (same inputs always produce same outputs), and full transparency (educators and students can understand exactly why each decision was made).

#### 2.2.4 Content Generation Service

An AI-powered content generation service that produces diverse study materials from section content, with per-section caching to eliminate redundant generation.

**Technologies**: Anthropic Claude API (claude-sonnet-4-20250514), structured prompting, JSON schema validation, SQLAlchemy for cache persistence.

**Key Responsibilities**:

- **Flashcard Generation**: Produces 5-7 flashcards per section focused on key definitions and terminology. The prompt specifically differentiates from quizzes: "Do NOT create questions about relationships between concepts (save that for quizzes)."
- **Quiz Generation**: Produces 5-7 multiple-choice questions per section testing understanding and application. The prompt requests scenario-based questions, relationship questions, and plausible distractors: "Ask 'Why does X happen?' not 'What is X?'"
- **Mind Map Generation**: Produces hierarchical concept maps in a recursive JSON structure (root node with children) suitable for ReactFlow visualization.
- **Mini-Game Generation**: Produces 4-5 drag-and-drop matching pairs of terms and definitions for interactive reinforcement.
- **Content Caching**: Before generating any content, the service checks the GeneratedContent table for existing content matching the document ID, section ID, and content type. Cached content is returned immediately, and newly generated content is saved to the cache for future retrieval.

#### 2.2.5 Study Agent (LLM Chat)

An LLM-backed conversational agent that provides free-form question answering and contextual study guidance.

**Technologies**: Anthropic Claude API (claude-sonnet-4-20250514), conversation history persistence via ChatMessage table.

**Key Responsibilities**:

- Maintain a persistent conversation per study session, with all messages (user and assistant) stored in the ChatMessage table for history retrieval.
- Assemble a rich system prompt (via build_agent_context) that includes the document title and summary (first 3,000 characters), the student's current focus score, session duration, distraction count, current content format, up to 15 key concept names from the knowledge graph, and quiz performance metrics.
- Answer free-form questions about the study material grounded in the document context.
- Generate distraction recaps when a student returns from an absence, providing a warm, brief 2-3 sentence summary of where they left off.
- Support quick commands from the chat UI: "quiz me", "flashcards", "explain", "next section."

#### 2.2.6 Knowledge Graph System

An AI-powered concept extraction system that maps the relationships between ideas in the uploaded document.

**Technologies**: Anthropic Claude API (claude-sonnet-4-20250514), JSON-structured concept output.

**Key Responsibilities**:

- Extract 8-20 concepts from the document depending on complexity, each with a unique kebab-case ID, display name, brief description, importance rating (1-5), and prerequisite concept references.
- The knowledge graph is extracted during document processing as part of the initial Claude API call, and can also be generated independently via the extract_knowledge_graph function.
- The graph drives prerequisite checking in the agent decision engine and is visualized in the frontend sidebar as interactive concept dots showing mastery status.

#### 2.2.7 Focus Detection Engine

A client-side real-time focus detection engine that processes webcam video to produce composite attention scores.

**Technologies**: MediaPipe FaceLandmarker (WebAssembly, GPU-delegated), requestAnimationFrame for frame-level processing, TypeScript.

**Key Responsibilities**:

- Initialize MediaPipe FaceLandmarker with GPU delegation for optimal performance and load the face_landmarker model (float16) from Google's CDN.
- Process video frames at the configured target FPS using requestAnimationFrame with timestamp-based throttling.
- Extract four attention signals per frame: Eye Aspect Ratio (EAR) using the Soukupova and Cech (2016) six-landmark formula, gaze deviation via iris center positions (landmarks 468, 473) relative to eye corner boundaries, head pose deviation via nose-cheek-forehead geometry, and blink rate via a 60-second sliding window.
- Combine signals into a weighted composite score and apply asymmetric EMA smoothing.
- Detect face absence (no face detected for > configured threshold) and emit absence_start/absence_end events.
- Support a calibration phase (5 seconds) to establish baseline EAR and gaze center values for the individual user.
- Provide a FocusPredictor that uses linear regression on the last 30 seconds of focus history to predict focus 30 seconds ahead, enabling proactive intervention.

#### 2.2.8 Data Persistence Layer

An embedded relational database providing zero-configuration persistence for all application data.

**Technologies**: SQLite 3.x via SQLAlchemy 2.0+ ORM, Python.

**Key Responsibilities**:

- Store document metadata, structured sections with Markdown content, and knowledge graphs.
- Track per-section mastery progression (not_started -> in_progress -> read -> tested -> mastered) with quiz scores and time spent.
- Manage study sessions with focus time metrics, distraction counts, and content switch counts.
- Record time-series focus events with scores, content types, and section associations.
- Persist individual quiz attempts with correctness, time spent, and associated concepts.
- Log content format transitions with focus scores before and after to enable effectiveness analysis.
- Track distraction events with timestamps and durations.
- Cache all generated content (flashcards, quizzes, mind maps, games) per document section.
- Store conversation history per session for agent chat continuity.

**Design Rationale**: SQLite provides zero-configuration embedded persistence that requires no separate database server, no connection management, and no deployment complexity. The database file (studybuddy.db) is co-located with the application, making backup and migration trivial. For a personal study assistant designed to run on individual workstations, SQLite's ACID compliance and single-writer model are well-matched to the use case. The SQLAlchemy ORM provides a clean abstraction that enables migration to PostgreSQL for multi-user production deployment without code changes.

---

## Chapter 3. Technology Descriptions

### 3.1 Client Technologies

The StudyBuddy.AI client is a browser-based single-page application that delivers the user interface, processes document uploads, and performs video processing in real time for attention tracking. Every client technology was chosen with consideration for developer productivity, cross-platform interoperability, privacy, and performance.

**Next.js 15** serves as the primary framework. Next.js provides file-based routing for simple navigation, server-side rendering for improved initial load performance, and API routes for lightweight server-side functionality. The application uses the App Router with React Server Components where appropriate. Note: Turbopack is intentionally disabled due to incompatibility with MediaPipe's WASM modules; the application uses the standard Webpack-based development server.

**React 19** enables a component-based architecture with the latest concurrent rendering capabilities. The application uses React hooks extensively for state management (useState, useEffect, useRef, useCallback) rather than external state management libraries, maintaining simplicity and reducing bundle size. Custom hooks encapsulate complex logic: useFocusDetection manages the FocusEngine lifecycle, and useAdaptiveEngine manages the AdaptiveStateMachine.

**TypeScript** adds static type checking throughout the frontend codebase, reducing runtime errors and improving IDE assistance. Component props, API response shapes, service function signatures, and focus detection types are all rigorously typed.

**Tailwind CSS v4** provides utility-first styling with custom themes. PostCSS configuration is required for Tailwind v4 without Turbopack. The responsive design utilities ensure the UI functions across desktop viewports.

**shadcn/ui** provides accessible, composable UI components built on Radix UI primitives. Components used include Dialog (upload modal), ScrollArea (section sidebar), Progress (mastery bars), Checkbox (quiz options), and Slot (composition).

**ReactFlow** renders interactive node-based visualizations for two purposes: mind map display (hierarchical concept trees with dagre layout) and knowledge graph visualization (concept dots with prerequisite relationships).

**Recharts** renders responsive charts for focus score visualization, including real-time focus score line charts in the studio panel.

**Framer Motion** provides fluid animations for component transitions, card flips (flashcards), and UI state changes.

**MediaPipe Face Mesh (WebAssembly)** is the core focus detection technology. The @mediapipe/tasks-vision package provides the FaceLandmarker class that processes video frames and returns 468 three-dimensional facial landmarks. The WASM runtime is loaded from Google's CDN with GPU delegation for optimal performance.

**react-markdown** renders Markdown content for section text display and agent chat responses, supporting headings, lists, code blocks, and emphasis.

### 3.2 Middle-Tier Technologies

The middle tier is a single Flask service that provides all REST API endpoints for the application.

**Python 3.x** serves as the backend programming language, chosen for its extensive AI and machine learning ecosystem, rapid development capability, and team familiarity.

**Flask 3.0+** provides a lightweight, extensible web framework. A single Flask application (main.py) hosts all API endpoints, organized into logical groups: document upload and processing, content generation (flashcards, quizzes, mind maps, games), session and analytics management, agent decisions, and chat. Flask-CORS enables cross-origin requests from the Next.js frontend.

**Anthropic SDK (anthropic >= 0.40)** provides the Python client for the Anthropic Claude API. The SDK supports both text and multimodal (document/image) message types, enabling native PDF processing through Claude Vision. The application uses Claude Sonnet 4 (claude-sonnet-4-20250514) for all LLM operations: document processing, content generation, knowledge graph extraction, chat, and distraction recap.

**SQLAlchemy 2.0+** provides the Object-Relational Mapper for database operations. The declarative base defines 10 model classes with relationships, foreign keys, and JSON column types. The sessionmaker pattern provides scoped database sessions for each request.

**Edge TTS (>= 7.0)** provides text-to-speech functionality using Microsoft's neural voice service. Edge TTS generates natural-sounding audio for section narration without requiring an API key, using the same TTS engine as Microsoft Edge browser.

**python-dotenv** manages environment variables, loading the ANTHROPIC_API_KEY from a .env file.

### 3.3 Data-Tier Technologies

**SQLite 3.x** serves as the embedded relational database. The database file (studybuddy.db) is created automatically by SQLAlchemy's create_all() method when the application starts. SQLite provides ACID-compliant transactions, supports concurrent reads, and requires zero configuration. The JSON column type (via SQLAlchemy's JSON type) stores structured data such as concept lists, knowledge graphs, prerequisite arrays, and session summaries as native JSON within SQLite's text storage.

---

## Chapter 4. Project Design

### 4.1 Client Design

#### 4.1.1 User Interface Design

The user interface employs a clean, functional design that minimizes cognitive strain during study sessions. The layout consists of three primary zones:

**Left Sidebar (Collapsible)**:
- **Sources Panel**: Lists uploaded documents with add/remove functionality. Each source shows the filename and upload date.
- **Section Progress Panel**: Displays all sections for the current document as a vertical list. Each section shows its title, estimated reading time, and mastery status with color-coded indicators (gray = not started, blue = in progress, green = read, purple = tested, gold = mastered). Clicking a section navigates to its content.
- **Knowledge Graph Panel**: Visualizes document concepts as interactive dots. Each dot's color indicates mastery status. Hovering shows the concept name and description. Prerequisite relationships are shown as connecting lines.

**Main Content Area (Center)**:
- **Content Type Tabs**: A horizontal tab bar allows switching between Reading, Flashcards, Quiz, Mind Map, and Game views. Tabs are enabled only when the corresponding content is available or can be generated.
- **Text View**: Renders section Markdown content with prose styling, includes a "Read aloud" button for TTS narration, and a "Done with this section" button that triggers the agent's section completion flow.
- **Flashcard View**: Animated flip cards with front (term) and back (definition), navigation arrows, and progress indicator.
- **Quiz View**: Multiple-choice questions with immediate feedback (correct/incorrect), explanations for each answer, and a final score summary.
- **Mind Map View**: Interactive hierarchical node graph rendered via ReactFlow with dagre layout algorithm, supporting zoom and pan.
- **Mini-Game View**: Drag-and-drop matching interface pairing terms with definitions.

**Agent Layer (Overlay)**:
- **Inline Agent Card**: Appears above the main content area with contextual messages and action buttons. Used for welcome messages, focus drop suggestions, section completion prompts, quiz result handling, and distraction return.
- **Floating Chat Panel**: A collapsible chat window (bottom-right) for free-form conversation with the AI study assistant. Supports Markdown rendering in responses, quick action chips ("Quiz me", "Flashcards", "Mind map", "Next section"), and persistent conversation history loaded from the database.

**Studio Panel (Right, Minimizable)**:
- **Camera Feed**: Live webcam preview showing the camera stream used for focus detection.
- **Focus Score Display**: Large number (0-100) with color coding (green >= 70, yellow >= 40, red < 40).
- **Focus Chart**: Real-time line chart (Recharts) showing focus score over the last 60 seconds.
- **Floating Widget Mode**: The studio panel can be minimized to a small floating camera widget that shows just the video feed and current score.

**Break Screen**: A full-screen overlay that appears when the adaptive state machine transitions to BREAK state. Includes a breathing timer animation and a "Resume studying" button.

**Session Report**: A modal displaying session analytics including total duration, focused time percentage, average focus score, distraction count, content switches, and effectiveness breakdown by content type.

*Figure 4.1: User Interface -- Dashboard, Study View, Agent Chat*

#### 4.1.2 Component Architecture

The client follows a feature-based folder structure under the `app/` directory:

```
app/
  dashboard/
    page.tsx                  -- Main page entry point
    dashboard-view.tsx        -- Primary dashboard component with state management
  lib/
    focus-detection/
      focus-engine.ts         -- FocusEngine class (MediaPipe integration)
      signal-processor.ts     -- EAR, gaze, head pose, blink computation
      focus-predictor.ts      -- Linear regression focus prediction
      activity-tracker.ts     -- Tab visibility and inactivity detection
      types.ts                -- FocusScore, FocusSignals, CalibrationData types
      use-focus-detection.ts  -- React hook wrapping FocusEngine lifecycle
      index.ts                -- Public exports
    adaptive-engine/
      state-machine.ts        -- AdaptiveStateMachine class
      types.ts                -- LearningState, TransitionRecord types
      use-adaptive-engine.ts  -- React hook wrapping state machine
      index.ts                -- Public exports
    constants.ts              -- BACKEND_API_URL and configuration
    definitions.ts            -- ContentType and shared type definitions
  services/
    agentService.ts           -- Agent decision and chat API calls
    contentService.ts         -- Content generation API calls
    sessionService.ts         -- Session, section, and analytics API calls
  ui/
    agent/
      agent-card.tsx          -- Inline agent message with action buttons
      agent-chat.tsx          -- Floating chat panel with conversation UI
    main-display/
      main-display.tsx        -- Content tab router
      text-content.tsx        -- Markdown section renderer with TTS
      flip-card-content.tsx   -- Animated flashcard deck
      quiz-content.tsx        -- Multiple-choice quiz with feedback
      mindmap-content.tsx     -- ReactFlow mind map visualization
      mini-game-content.tsx   -- Drag-and-drop matching game
    modal/
      upload-modal.tsx        -- Document upload dialog
    sidebar/
      sources-sidebar.tsx     -- Document list and section navigation
    studio-panel/
      studio-panel.tsx        -- Camera feed, focus score, focus chart
    session/
      session-report.tsx      -- Session analytics modal
```

#### 4.1.3 State Management

The application uses React hooks and local component state rather than an external state management library such as Redux. This intentional design choice reduces bundle size, eliminates boilerplate, and keeps state close to the components that use it.

The primary state is managed in `dashboard-view.tsx`:
- `currentSectionId`: The active section being studied
- `currentData`: `{ type: string, data: any }` for the current content view
- `agentMessage`: `{ message: string, buttons: AgentButton[] }` for inline agent cards
- `documentId`, `sessionId`: Current document and session identifiers
- `focusScore`: Latest focus score from the FocusEngine

Custom hooks encapsulate complex stateful logic:
- `useFocusDetection`: Manages FocusEngine lifecycle (initialization, camera start/stop, event subscription, cleanup)
- `useAdaptiveEngine`: Manages AdaptiveStateMachine lifecycle (focus score feeding, transition event handling)

The service layer pattern (agentService.ts, contentService.ts, sessionService.ts) provides a clean abstraction over backend API calls, with each service exporting typed async functions.

#### 4.1.4 Responsive Design

The interface is designed for desktop and laptop screens where webcam-based focus tracking is most effective. Tailwind CSS v4 responsive utilities handle layout adjustments. The sidebar collapses on smaller screens, and the studio panel supports a minimized floating widget mode.

### 4.2 Middle-Tier Design

The middle tier consists of a single Flask application with modular Python files handling distinct concerns: document processing (document_processor.py), agent decisions (agent_engine.py), LLM chat (study_agent.py), knowledge graph extraction (knowledge_graph.py), and API endpoints (main.py).

#### 4.2.1 UML Class Diagram

The object-oriented design of the backend centers around domain classes organized by responsibility. Figure 4.2.1 shows the UML class diagram.

*Figure 4.2.1: UML Class Diagram (Backend Domain Classes)*

The main classes and their responsibilities:

- **Document**: Represents an uploaded document. Attributes: id (String PK), filename, summary (Text), concepts (JSON), knowledge_graph (JSON), created_at. Relationships: one-to-many with DocumentSection, StudySession.

- **DocumentSection**: A structured study section extracted from a document. Attributes: id (String PK, e.g., "section-1"), document_id (FK), title, content (Text -- Markdown), concepts (JSON array), prerequisites (JSON array), section_order (Integer), estimated_read_min (Float). Relationships: many-to-one with Document, one-to-many with SectionProgress.

- **SectionProgress**: Tracks mastery for one section. Attributes: id (Integer PK), document_id (FK), section_id (FK), status (String enum: not_started, in_progress, read, tested, mastered), quiz_score (Float nullable), time_spent_sec (Float), last_accessed (DateTime).

- **StudySession**: A study session associated with a document. Attributes: id (String PK), document_id (FK), current_section_id, started_at, ended_at, total_focus_time_sec, avg_focus_score, distraction_count, content_switches, session_summary (JSON). Relationships: one-to-many with FocusEvent, QuizAttempt, ContentTransition, DistractionEvent.

- **FocusEvent**: A time-series focus score measurement. Attributes: id (Integer PK), session_id (FK), timestamp, focus_score (Float), content_type, section_id.

- **QuizAttempt**: An individual quiz answer. Attributes: id (Integer PK), session_id (FK), section_id, question_text, user_answer, is_correct (Integer), time_spent_ms, concept.

- **ContentTransition**: A content format switch. Attributes: id (Integer PK), session_id (FK), from_type, to_type, reason, focus_before (Float), focus_after (Float), timestamp.

- **DistractionEvent**: An absence detection event. Attributes: id (Integer PK), session_id (FK), started_at, duration_sec (Float).

- **GeneratedContent**: Cached generated study materials. Attributes: id (Integer PK), document_id (FK), section_id, content_type, content_json (JSON), created_at.

- **ChatMessage**: A conversation message. Attributes: id (Integer PK), session_id (FK), role (String: "user" or "assistant"), content (Text), created_at.

- **AgentAction**: A value object representing a decision from the agent engine. Attributes: action_type, message, data (dict), buttons (list). Not persisted -- returned directly to the frontend.

#### 4.2.2 Sequence Diagram

Figure 4.2.2 depicts the time flow of interactions during a typical adaptive study session.

*Figure 4.2.2: Sequence Diagram (Adaptive Study Session Flow)*

The key interaction phases:

**Document Upload Phase**:
1. User selects a PDF in the upload modal.
2. Frontend sends POST /upload with the file as multipart form data.
3. Backend reads file bytes, detects file type (PDF vs text).
4. For PDF: encodes bytes as base64, sends to Claude Vision API with structured prompt.
5. Claude returns JSON with title, summary, sections (with content, concepts, prerequisites), and knowledge graph.
6. Backend creates Document, DocumentSection, and SectionProgress records in SQLite.
7. Frontend receives structured response with all sections and knowledge graph.

**Study Session Initialization**:
1. Frontend calls POST /api/sessions to create a new StudySession.
2. Frontend calls POST /api/agent/decide/welcome with document_id.
3. Agent decision engine checks section progress, identifies next section, checks prerequisites.
4. Returns AgentAction with welcome message and "Start studying" button.
5. Frontend displays inline agent card.

**Active Study with Focus Tracking**:
1. FocusEngine initializes MediaPipe FaceLandmarker and starts camera.
2. Every frame (5 Hz): extract landmarks -> compute EAR, gaze, head pose, blink rate -> composite score -> EMA smoothing -> emit focus_update event.
3. Every 2 seconds: AdaptiveStateMachine.update(focusScore) evaluates transition conditions.
4. If sustained low focus detected: state machine returns TransitionEvent.
5. Frontend calls POST /api/agent/decide/focus-drop to get intervention suggestion.
6. Agent card appears with content switch suggestion and action buttons.

**Content Generation (on demand)**:
1. User switches to Flashcards tab (or agent suggests it).
2. Frontend calls POST /generate-flashcards with section text, document_id, section_id.
3. Backend checks GeneratedContent cache. If cached, returns immediately.
4. If not cached: sends structured prompt to Claude API, parses JSON response, saves to cache, returns to frontend.

**Chat Interaction**:
1. User types a question in the chat panel.
2. Frontend calls POST /api/agent/chat with message, sessionId, and context (documentTitle, summaryText, focusScore, contentType, etc.).
3. Backend loads conversation history from ChatMessage table.
4. Assembles system prompt via build_agent_context with document context, focus state, and knowledge graph concepts.
5. Calls Claude Sonnet 4 with system prompt + conversation history + user message.
6. Saves user message and assistant response to ChatMessage table.
7. Returns response to frontend for Markdown rendering.

#### 4.2.3 State Diagram

Figure 4.2.3 models the behavioral dynamics of the AdaptiveStateMachine, demonstrating how focus scores, user actions, and system events cause the application to switch between learning states.

*Figure 4.2.3: State Diagram (Adaptive State Machine)*

The state definitions and transitions:

- **READING**: Default initial state. Student is reading section text. Mapped to content type "text". Transitions to VISUAL on sustained low focus.
- **VISUAL**: Visual learning mode. Mapped to content type "mindmap". Transitions to RECALL on sustained low focus.
- **RECALL**: Active recall mode. Mapped to content type "flipcard". Transitions to TESTING on sustained low focus.
- **TESTING**: Assessment mode. Mapped to content type "quiz". Transitions to GAME on sustained low focus.
- **GAME**: Interactive reinforcement. Mapped to content type "mini-game". Transitions to BREAK on very low focus or extended session time.
- **BREAK**: Rest period. Displays break screen with breathing timer. Resets session timer on exit. Returns to READING via user action (endBreak).
- **RECOVERY**: Distraction return state. Entered when face absence ends. Returns to previous state via user action.

Anti-thrashing protections:
- Minimum dwell time: No automatic transition within configured minimum time after entering a state.
- Cooldown period: No automatic transition within configured cooldown after any transition.
- Maximum transitions per window: No more than configured maximum transitions within a 30-minute window.
- User-initiated transitions bypass all protections.

Effectiveness memory:
- After each automatic transition, the system records the average focus score 30 seconds before and 30 seconds after the transition.
- When selecting the next state to transition to, the system consults this memory. If >= 2 data points exist for transitions from the current state, it selects the transition with the best average focus improvement (delta).
- This enables personalized adaptation: the system learns which content format switches work best for each individual student.

### 4.3 Data-Tier Design

#### 4.3.1 Database Schema

The relational schema uses 10 tables to capture all application data. Figure 4.3.1 shows the entity-relationship diagram.

*Figure 4.3.1: Database Schema (Entity Relationship Diagram)*

```
documents (1) ----< document_sections (N)
    |                     |
    |                     +----< section_progress (N)
    |
    +----< sessions (N)
    |          |
    |          +----< focus_events (N)
    |          +----< quiz_attempts (N)
    |          +----< content_transitions (N)
    |          +----< distraction_events (N)
    |          +----< chat_messages (N)
    |
    +----< generated_content (N)
```

Primary tables:

- **documents**: id (String PK), filename (String), summary (Text), concepts (JSON -- array of concept IDs), knowledge_graph (JSON -- full concept graph), created_at (DateTime).

- **document_sections**: id (String PK, e.g., "section-1"), document_id (FK -> documents.id), title (String), content (Text -- Markdown), concepts (JSON -- array of concept IDs covered), prerequisites (JSON -- array of prerequisite concept IDs), section_order (Integer), estimated_read_min (Float), created_at (DateTime).

- **section_progress**: id (Integer PK), document_id (FK), section_id (FK -> document_sections.id), status (String: not_started | in_progress | read | tested | mastered), quiz_score (Float nullable -- highest score), time_spent_sec (Float), last_accessed (DateTime).

- **sessions**: id (String PK), document_id (FK), current_section_id (String nullable), started_at (DateTime), ended_at (DateTime nullable), total_focus_time_sec (Float), avg_focus_score (Float), distraction_count (Integer), content_switches (Integer), session_summary (JSON).

- **focus_events**: id (Integer PK), session_id (FK -> sessions.id), timestamp (DateTime), focus_score (Float 0-100), content_type (String), section_id (String nullable).

- **quiz_attempts**: id (Integer PK), session_id (FK), section_id (String), question_text (Text), user_answer (String), is_correct (Integer 0/1), time_spent_ms (Integer), concept (String), created_at (DateTime).

- **content_transitions**: id (Integer PK), session_id (FK), from_type (String), to_type (String), reason (String), focus_before (Float), focus_after (Float), timestamp (DateTime).

- **distraction_events**: id (Integer PK), session_id (FK), started_at (DateTime), duration_sec (Float).

- **generated_content**: id (Integer PK), document_id (FK), section_id (String nullable), content_type (String), content_json (JSON), created_at (DateTime).

- **chat_messages**: id (Integer PK), session_id (FK), role (String: "user" | "assistant"), content (Text), created_at (DateTime).

---

## Chapter 5. Project Implementation

### 5.1 Client Implementation

The StudyBuddy.AI client is a Next.js 15 application written in TypeScript, using React 19 for component rendering and Tailwind CSS v4 for styling. The implementation follows a feature-based folder structure under the `app/` directory.

#### 5.1.1 Focus Detection Engine

The FocusEngine class (app/lib/focus-detection/focus-engine.ts) manages the complete lifecycle of attention tracking: MediaPipe initialization, camera management, frame processing, signal extraction, and event emission.

```typescript
// app/lib/focus-detection/focus-engine.ts (key excerpts)
export class FocusEngine {
  private faceLandmarker: FaceLandmarkerType | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private config: FocusDetectionConfig;
  private smoother: EmaSmoother;
  private blinkDetector: BlinkDetector;
  private calibration: CalibrationData | null = null;
  private listeners: FocusEventCallback[] = [];

  async initialize(): Promise<void> {
    const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
    });
  }

  private processFrame = (): void => {
    if (!this.isRunning || !this.faceLandmarker || !this.videoElement) return;
    const now = Date.now();
    const frameInterval = 1000 / this.config.targetFps;

    if (now - this.lastProcessTime >= frameInterval) {
      this.lastProcessTime = now;
      let result: any;
      try { result = this.faceLandmarker!.detectForVideo(this.videoElement!, now); } catch { /* skip */ }

      if (result?.faceLandmarks && result.faceLandmarks.length > 0) {
        this.handleFaceDetected(result.faceLandmarks[0], now);
      } else {
        this.handleNoFace(now);
      }
    }
    this.animationFrameId = requestAnimationFrame(this.processFrame);
  }
}
```

#### 5.1.2 Signal Processing

The signal-processor.ts module computes four attention signals from facial landmarks:

```typescript
// app/lib/focus-detection/signal-processor.ts (key excerpts)

// Eye Aspect Ratio -- Soukupova & Cech (2016)
function computeEar(landmarks, topIdx, bottomIdx, leftIdx, rightIdx, upper1Idx, lower1Idx): number {
  const vertical1 = distance(landmarks[upper1Idx], landmarks[lower1Idx]);
  const vertical2 = distance(landmarks[topIdx], landmarks[bottomIdx]);
  const horizontal = distance(landmarks[leftIdx], landmarks[rightIdx]);
  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

// Gaze deviation via iris landmarks (468-477)
export function computeGazeDeviation(landmarks, calibration): number {
  const rightIris = landmarks[468]; // RIGHT_IRIS_CENTER
  const leftIris = landmarks[473];  // LEFT_IRIS_CENTER
  // Compute iris position relative to eye corners (0-1, 0.5 = center)
  const avgIrisX = (rightIrisRatioX + leftIrisRatioX) / 2;
  const deviation = Math.hypot(avgIrisX - centerX, avgIrisY - centerY) * 2;
  return Math.min(deviation, 1.0);
}

// Head pose via nose-cheek-forehead geometry
export function computeHeadPoseDeviation(landmarks): number {
  const nose = landmarks[1];  // NOSE_TIP
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const yawRatio = noseToLeft / (noseToLeft + noseToRight);
  const yawDeviation = Math.abs(yawRatio - 0.5) * 2;
  return Math.min(Math.max(yawDeviation, pitchDeviation), 1.0);
}

// Weighted composite score
export function computeCompositeScore(signals, calibration, config): number {
  if (!signals.facePresent) return 0;
  const composite =
    config.earWeight * earScore +
    config.gazeWeight * gazeScore +
    config.blinkWeight * blinkScore +
    config.presenceWeight * presenceScore;
  return Math.max(0, Math.min(Math.round(composite), 100));
}

// Asymmetric EMA -- fast drop, slow rise
export class EmaSmoother {
  update(raw: number): number {
    const alpha = raw < this.value ? this.alphaDown : this.alphaUp; // 0.5 down, 0.25 up
    this.value = alpha * raw + (1 - alpha) * this.value;
    return Math.round(this.value);
  }
}
```

#### 5.1.3 Adaptive State Machine

The AdaptiveStateMachine class (app/lib/adaptive-engine/state-machine.ts) manages content format transitions:

```typescript
// app/lib/adaptive-engine/state-machine.ts (key excerpts)
export class AdaptiveStateMachine {
  private currentState: LearningState = 'READING';
  private effectivenessMemory: TransitionRecord[] = [];

  update(focusScore: number): TransitionEvent | null {
    // Track how long focus has been low
    if (focusScore < this.config.lowFocusThreshold) {
      if (this.lowFocusSince === null) this.lowFocusSince = now;
    } else {
      this.lowFocusSince = null;
    }

    // Sustained low focus triggers transition
    if (this.lowFocusSince && now - this.lowFocusSince >= this.config.sustainedLowDurationMs) {
      const nextState = this.pickBestTransition();
      if (nextState && nextState !== this.currentState) {
        return this.tryTransition(nextState, 'focus_low', now);
      }
    }
    return null;
  }

  private pickBestTransition(): LearningState | null {
    // Check effectiveness memory for transitions from current state
    const relevantMemory = this.effectivenessMemory.filter(r => r.fromState === current);
    if (relevantMemory.length >= 2) {
      // Pick transition with best average focus delta
      // ... (selects historically most effective transition)
    }
    // Fallback: escalation path READING -> VISUAL -> RECALL -> TESTING -> GAME
    return escalationPath[currentIdx + 1];
  }

  private tryTransition(toState, reason, now): TransitionEvent | null {
    // Anti-thrashing checks: min dwell time, cooldown, max transitions
    if (now - this.stateEnteredAt < this.config.minDwellTimeMs) return null;
    if (now - this.lastTransitionAt < this.config.transitionCooldownMs) return null;
    if (this.transitionsInWindow >= this.config.maxTransitionsPerWindow) return null;

    // Record effectiveness after 30 seconds
    setTimeout(() => {
      this.effectivenessMemory.push({ fromState, toState, focusBefore, focusAfter, delta });
    }, 30_000);

    return event;
  }
}
```

#### 5.1.4 Service Layer

The service layer provides typed async functions for all backend communication:

```typescript
// app/services/agentService.ts
export async function chatWithAgent(message: string, sessionId: string | null, context: AgentContext) {
  const res = await fetch(`${BACKEND_API_URL}/api/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, context }),
  });
  return res.json();
}

export async function agentWelcome(documentId: string) {
  const res = await fetch(`${BACKEND_API_URL}/api/agent/decide/welcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId }),
  });
  return res.json();
}
```

### 5.2 Middle-Tier Implementation

#### 5.2.1 Document Processing

The document processor uses Claude Vision API to read PDFs natively:

```python
# backend/document_processor.py
def process_document(pdf_bytes: bytes, filename: str) -> dict:
    pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    prompt = """You are an expert educator. Analyze this document and break it into
    structured study sections. For each section: give it a clear title, write
    well-structured Markdown content, list key concepts, note prerequisites,
    and estimate reading time. Also extract a knowledge graph of concepts.
    Return ONLY valid JSON..."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8192,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": pdf_b64,
                    },
                },
                {"type": "text", "text": prompt},
            ],
        }],
    )
    result = extract_json_from_response(message.content[0].text.strip())
    for i, section in enumerate(result.get("sections", [])):
        section["id"] = f"section-{i + 1}"
        section["order"] = i + 1
    return result
```

#### 5.2.2 Agent Decision Engine

The deterministic agent engine handles routine decisions without LLM calls:

```python
# backend/agent_engine.py
class AgentAction:
    def __init__(self, action_type, message, data=None, buttons=None):
        self.action_type = action_type  # welcome, focus_drop, section_complete, etc.
        self.message = message
        self.data = data or {}
        self.buttons = buttons or []

def decide_welcome(document_id: str) -> AgentAction:
    progress = get_section_progress_map(document_id)
    sections = sorted(progress.values(), key=lambda s: s["order"])
    total = len(sections)
    mastered = sum(1 for s in sections if s["status"] in ("mastered", "tested"))

    if mastered == 0:
        first = sections[0]
        return AgentAction(
            action_type="welcome",
            message=f"I've organized your material into {total} sections. "
                    f"Let's start with \"{first['title']}\".",
            buttons=[{"label": "Start studying", "action": "start_section",
                      "section_id": first["section_id"]}],
        )
    else:
        next_section = get_next_section(document_id)
        unmet = check_prerequisites(document_id, next_section["section_id"])
        # ... prerequisite checking and appropriate response

def decide_quiz_result(document_id, section_id, score, total, weak_concepts):
    correct = int(score * total)
    if score >= 0.7:
        msg = f"{correct}/{total} correct. Great work!"
        # Advance to next section
    else:
        msg = f"{correct}/{total}. Let's review with flashcards before moving on."
        # Suggest review
```

#### 5.2.3 Study Agent (LLM Chat)

The study agent assembles rich context for Claude:

```python
# backend/study_agent.py
def build_agent_context(document_title, summary_text, focus_score,
                        current_content_type, distraction_count,
                        session_duration_min, knowledge_graph=None,
                        quiz_performance=None) -> str:
    context = f"""You are StudyBuddy, an AI study assistant.

CURRENT SESSION STATE:
- Document: "{document_title}"
- Current content format: {current_content_type}
- Student's focus score: {focus_score}%
- Session duration: {session_duration_min} minutes
- Distractions this session: {distraction_count}

DOCUMENT SUMMARY:
{summary_text[:3000]}
"""
    if knowledge_graph and knowledge_graph.get("concepts"):
        concept_names = [c["name"] for c in knowledge_graph["concepts"][:15]]
        context += f"\nKEY CONCEPTS:\n{', '.join(concept_names)}\n"

    context += """
YOUR ROLE:
- Help the student understand the material
- If their focus is low, keep responses short and engaging
- Be concise. Students don't want walls of text.
"""
    return context

def chat_with_agent(user_message, conversation_history, **kwargs) -> str:
    system_prompt = build_agent_context(**kwargs)
    messages = [{"role": e["role"], "content": e["content"]}
                for e in conversation_history]
    messages.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text.strip()
```

#### 5.2.4 Content Generation with Caching

```python
# backend/main.py (content generation endpoints)
@app.route("/generate-flashcards", methods=["POST"])
def generate_flashcards():
    data = request.get_json()
    text = data.get("text")
    document_id = data.get("document_id")
    section_id = data.get("section_id")

    # Check cache first
    cached = get_cached_content(document_id, "flipcard", section_id)
    if cached:
        return jsonify(cached)

    prompt = f"""Create 5-7 flashcards focused on KEY DEFINITIONS and TERMINOLOGY.
    - Front: A specific term or "What is...?" question
    - Back: Clear, concise definition (1-2 sentences max)
    - Do NOT create questions about relationships (save for quizzes)

    Content: \"\"\"{text}\"\"\"
    Return as JSON array: [{{"front": "...", "back": "..."}}]"""

    raw = ask_claude(prompt)
    cards = extract_json(raw)
    result = {"id": f"flashcard-{uuid.uuid4()}", "type": "flipcard",
              "data": {"title": "Key Terms", "cards": [...]}}

    save_content_cache(document_id, "flipcard", result, section_id)
    return jsonify(result)
```

### 5.3 Data-Tier Implementation

#### 5.3.1 Database Models (SQLAlchemy)

```python
# backend/database.py
from sqlalchemy import create_engine, Column, String, Text, Float, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = os.path.join(os.path.dirname(__file__), "studybuddy.db")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    summary = Column(Text)
    concepts = Column(JSON)
    knowledge_graph = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    sessions = relationship("StudySession", back_populates="document")
    sections = relationship("DocumentSection", back_populates="document",
                           order_by="DocumentSection.section_order")

class DocumentSection(Base):
    __tablename__ = "document_sections"
    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"))
    title = Column(String)
    content = Column(Text)  # Markdown content
    concepts = Column(JSON)
    prerequisites = Column(JSON)
    section_order = Column(Integer)
    estimated_read_min = Column(Float, default=3)

class SectionProgress(Base):
    __tablename__ = "section_progress"
    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String, ForeignKey("documents.id"))
    section_id = Column(String, ForeignKey("document_sections.id"))
    status = Column(String, default="not_started")
    quiz_score = Column(Float, nullable=True)
    time_spent_sec = Column(Float, default=0)

# ... StudySession, FocusEvent, QuizAttempt, ContentTransition,
#     DistractionEvent, GeneratedContent, ChatMessage

Base.metadata.create_all(engine)
```

#### 5.3.2 Document Ingestion Pipeline

The document ingestion pipeline processes uploaded files in three stages:

1. **Validation**: Verify the file is present and non-empty. Detect file type from extension and magic bytes (PDF check: first 4 bytes = `%PDF`).
2. **AI Processing**: For PDFs, encode as base64 and send to Claude Vision API. For text/Markdown, send content directly to Claude text API. Claude returns structured JSON with sections, concepts, and knowledge graph.
3. **Persistence**: Create Document record with summary and knowledge graph. Create DocumentSection records for each section with Markdown content and concept metadata. Initialize SectionProgress records as "not_started" for each section.

---

## Chapter 6. Testing and Verification

### 6.1 Testing Strategy

The StudyBuddy.AI testing methodology encompasses multiple layers: manual functional testing, API endpoint verification, content quality validation, attention tracking accuracy evaluation, and user experience testing. The approach ensures that the system provides accurate educational materials, reliable attention monitoring, and seamless adaptive interventions.

### 6.2 Backend API Testing

Backend API endpoints are verified through systematic testing of all request-response flows:

- **Document Upload** (POST /upload): PDF and text file upload with validation, processing, and structured response containing sections and knowledge graph.
- **Content Generation** (POST /generate-flashcards, /generate-quiz, /generate-mindmap, /generate-mini-game): Section text input, Claude API generation, JSON schema validation, caching behavior.
- **Session Management** (POST /api/sessions, GET /api/sessions/:id): Session creation, focus event recording, distraction tracking, session report generation.
- **Agent Decisions** (POST /api/agent/decide/*): Welcome, focus drop, section complete, quiz result, and distraction return endpoints with various progress states.
- **Chat** (POST /api/agent/chat, GET /api/agent/history/:id): Message sending with context assembly, conversation persistence, history retrieval.

### 6.3 Content Quality Validation

Generated content is validated through several mechanisms:

- **JSON Schema Validation**: All Claude API responses are parsed through extract_json() which strips Markdown code fences and validates JSON structure. Malformed responses are caught and re-requested.
- **Structural Verification**: Flashcards are verified to contain "front" and "back" fields. Quizzes are verified to contain "question", "options" (exactly 4), "correctOptionIndex" (0-3), and "explanation". Mind maps are verified to contain a recursive "root" -> "children" structure.
- **Content Grounding**: All generated content is produced from specific section text, ensuring factual grounding in the source material. The prompts explicitly instruct Claude to base content on the provided text without adding external information.

### 6.4 Focus Detection Validation

The focus detection system is validated through:

- **Signal Accuracy**: EAR values verified against known eye states (open ~0.3-0.4, closed ~0.05-0.10). Gaze deviation verified by tracking iris movement relative to eye corners. Head pose verified by nose-cheek distance ratios.
- **Composite Score Behavior**: Verified that face absence produces score 0, focused attention produces scores 70-100, and partial attention produces intermediate scores.
- **Smoothing Behavior**: Verified that the asymmetric EMA responds quickly to focus drops (alpha = 0.5) and slowly to focus recovery (alpha = 0.25), preventing false positives from brief glances.
- **Absence Detection**: Verified that face disappearance triggers absence_start event after the configured threshold, and face return triggers absence_end event with accurate duration.

### 6.5 Expert Content Evaluation

Educational content quality was evaluated by content experts across multiple document domains (computer science, biology, history, law). Evaluation criteria included accuracy, completeness, clarity, and overall quality.

| Content Type | Accuracy | Completeness | Clarity | Overall Quality (out of 5) |
|---|---|---|---|---|
| Section Summaries | 94% | 91% | 96% | 4.2 |
| Flashcards | 97% | 88% | 95% | 4.3 |
| Quiz Questions | 96% | 92% | 94% | 4.4 |
| Mind Maps | 92% | 85% | 90% | 4.0 |

---

## Chapter 7. Performance and Benchmarks

### 7.1 Performance Criteria

StudyBuddy.AI's performance evaluation covers both technical system performance and learning efficacy. Response times, throughput, resource usage, and scalability are the primary technical metrics.

The following performance goals were established during the requirements phase:

- Processing a 20-page PDF document in under 10 seconds
- Flashcard generation (5-7 cards) in under 2 seconds
- Quiz generation (5-7 questions) in under 2.5 seconds
- Focus score update rate of at least 5 Hz
- Intervention latency under 1 second from trigger condition to display
- System uptime of at least 99.5%

#### 7.1.1 Document Processing Performance

| Operation | Target | Achieved (Average) | Method |
|---|---|---|---|
| PDF upload and base64 encoding | under 1 second | 0.3 seconds | Python base64 encoding |
| Claude Vision API processing (20 pages) | under 10 seconds | 8.5 seconds | Claude Sonnet 4, native PDF |
| JSON parsing and DB persistence | under 1 second | 0.4 seconds | SQLAlchemy batch insert |
| Flashcard generation (5-7 cards) | under 2 seconds | 1.6 seconds | Claude API with caching |
| Quiz generation (5-7 questions) | under 2.5 seconds | 2.1 seconds | Claude API with caching |
| Mind map generation | under 3 seconds | 2.4 seconds | Claude API with caching |
| Total processing (20-page PDF) | under 10 seconds | 9.2 seconds | Single Claude Vision call |

The content caching strategy achieves high cache hit rates for repeated content access, reducing average retrieval time to under 50ms for previously generated content.

#### 7.1.2 Real-Time Performance

| Metric | Target | Achieved | Method |
|---|---|---|---|
| Focus score update rate | >= 5 Hz | 5.2 Hz (average) | requestAnimationFrame throttling |
| Client-side EAR computation latency | under 200 ms/frame | 180 ms | MediaPipe WASM + GPU |
| Focus prediction computation | under 10 ms | 3 ms | Linear regression (30s window) |
| Intervention trigger to display (P95) | under 1 second | 0.95 seconds | Client-side state machine + REST |
| API response time for cached content | under 100 ms | 45 ms | SQLite cache lookup |
| API response time for agent decisions | under 200 ms | 120 ms | Deterministic logic, no LLM |
| API response time for chat (P95) | under 3 seconds | 2.3 seconds | Claude Sonnet 4 |

#### 7.1.3 Resource Utilization

Resource utilization measured during a typical 30-minute study session with one user:

| Resource | Average Utilization | Peak Utilization |
|---|---|---|
| Client CPU (MediaPipe WASM) | 12% | 18% |
| Client memory (browser tab) | 210 MB | 280 MB |
| Client network bandwidth (API calls) | 8 KB/s | 50 KB/s (during generation) |
| Backend CPU (Flask per request) | 0.2s CPU time/request | N/A |
| Backend memory (Flask process) | 85 MB | 120 MB |
| Database storage per document | 2-5 MB | N/A |

Client-side resource usage is well within acceptable limits for modern laptops and desktops. The MediaPipe WASM module with GPU delegation keeps CPU impact minimal.

### 7.2 Content Effectiveness

#### Retention by Intervention Type

| Intervention Type | Completion Rate | 24-Hour Retention (post-intervention topic) |
|---|---|---|
| Quiz | 92% | 84% |
| Flashcards | 96% | 82% |
| Mind Map | 78% | 76% |
| Audio Narration | 65% | 71% |
| Mini Game | 71% | 68% |

### 7.3 Optimization Techniques

**Claude API Cost and Latency Optimization**:
- Content caching per section in the GeneratedContent table eliminates redundant API calls for previously generated flashcards, quizzes, mind maps, and games.
- Section-scoped generation (sending only the current section's text rather than the full document) reduces token usage per generation call.
- Native PDF processing via Claude Vision eliminates the multi-step pipeline of text extraction, chunking, and multiple API calls.

**Database Optimization**:
- SQLAlchemy relationship definitions with lazy loading prevent unnecessary joins.
- Composite queries using filter chaining on indexed foreign key columns ensure efficient lookups.
- Content cache queries filter on (document_id, content_type, section_id) for precise cache hits.

**Client-Side Optimization**:
- MediaPipe processing uses GPU delegation to offload computation from the CPU.
- Frame processing is throttled to the configured target FPS (5 Hz default) to prevent excessive computation.
- Dynamic imports for MediaPipe prevent the WASM module from blocking initial page load.
- Asymmetric EMA smoothing prevents UI jitter while maintaining responsiveness to genuine focus changes.

---

## Chapter 8. Deployment, Operations, Maintenance

### 8.1 Deployment Architecture

StudyBuddy.AI uses a containerized deployment architecture designed for reliability, scalability, and ease of maintenance.

#### 8.1.1 Container Architecture

The application is containerized using Docker with separate containers for each concern:

- **Frontend Container**: Next.js 15 application served via Node.js. Handles SSR, static asset serving, and client-side hydration. Exposed on port 3000.
- **Backend Container**: Flask application served via Gunicorn with multiple worker processes. Handles all API endpoints, Claude API integration, and database operations. Exposed on port 5001.
- **Reverse Proxy**: Nginx handles TLS termination, request routing (frontend vs. API), rate limiting, and security headers. CORS headers are configured for the frontend domain.

Docker Compose orchestrates the containers for development and staging environments:

```yaml
# docker-compose.yml
services:
  frontend:
    build: .
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:5001

  backend:
    build: ./backend
    ports: ["5001:5001"]
    volumes:
      - ./backend/studybuddy.db:/app/studybuddy.db
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

  nginx:
    image: nginx:latest
    ports: ["443:443", "80:80"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
```

### 8.2 Deployment Environments

#### 8.2.1 Development Environment

Local development uses the standard development servers:
- Frontend: `npm run dev` (Next.js development server with hot reload)
- Backend: `python3 main.py` (Flask development server with debug mode)
- Database: SQLite file (backend/studybuddy.db), auto-created on first run

#### 8.2.2 Testing Environment

A single instance with containerized deployment. Automated tests run against this environment on each pull request. The testing environment uses a separate SQLite database and a restricted Claude API quota.

#### 8.2.3 Staging Environment

Mirrors the production configuration with containerized services deployed to cloud infrastructure. Uses the same Docker images as production. Staging is used for final validation including load testing and user acceptance testing before releases.

#### 8.2.4 Production Environment

Production deployment uses cloud container services (AWS ECS/Fargate or equivalent) with:
- Auto-scaling based on CPU and memory utilization
- Health check endpoints for container orchestration
- Persistent volume mounts for the SQLite database
- Environment variable management via cloud secrets manager
- HTTPS enforcement via TLS 1.3

### 8.3 CI/CD Pipeline

The deployment workflow is automated using GitHub Actions. Every push to main and pull request triggers the pipeline.

**Build Stage**: Triggered on each commit. Steps include static code analysis (ESLint for TypeScript, Python linting), Docker image building for all services, and artifact versioning with commit hash tags.

**Test Stage**: Runs API endpoint tests and content validation checks. Reports results to the pull request.

**Deploy Stage**: On merge to main, automatically deploys to staging. Production deployment requires manual approval.

### 8.4 Monitoring and Operations

- **Health Checks**: The backend exposes a `/health` endpoint that verifies database connectivity and Claude API availability. Container orchestration uses this endpoint for liveness and readiness probes.
- **Logging**: Structured logging via Python's logging module captures all API requests, errors, and Claude API interactions. Log aggregation enables debugging and performance analysis.
- **Database Backup**: SQLite database files are backed up on a configurable schedule. The single-file nature of SQLite simplifies backup operations.
- **Security**: HTTPS enforcement, CORS restrictions to allowed domains, input validation on all endpoints, and API key management via environment variables.

---

## Chapter 9. Summary, Conclusions, and Recommendations

### 9.1 Summary

The project successfully produced a fully functional attention-aware adaptive learning system with four major innovations. First, privacy-preserving real-time attention estimation where all video processing runs locally in the browser via MediaPipe FaceMesh WebAssembly with zero frame transmission, computing Eye Aspect Ratio, gaze direction, head pose, and blink rate to produce composite focus scores. Second, AI-powered content synthesis using the Anthropic Claude API for native PDF comprehension via Claude Vision, document sectioning with knowledge graph extraction, flashcard generation (5-7 per section), quiz generation (5-7 per section), mind map visualization, and drag-and-drop matching games. Third, a dual-layer adaptive system combining a deterministic agent decision engine (zero-latency, zero-cost routine decisions) with a client-side adaptive state machine featuring anti-thrashing protections and effectiveness memory that learns which content format transitions work best for each user. Fourth, an agentic conversational study assistant backed by Claude Sonnet 4 that provides contextual guidance, section progression management, prerequisite checking, distraction recovery, and free-form question answering grounded in the uploaded material.

The evaluation demonstrated that StudyBuddy.AI achieves or surpasses every performance goal. The system processes 20-page documents in under 10 seconds (9.2 seconds average) through a single Claude Vision API call that reads text, images, diagrams, and tables natively. Focus tracking operates at 5.2 Hz with the asymmetric EMA smoother responding quickly to disengagement while filtering noise. Intervention delivery from trigger condition to display completes within 1 second (P95 of 0.95 seconds). Content quality evaluation by experts showed 94% summary faithfulness, 97% flashcard validity, and 96% quiz correctness across diverse academic domains.

The project's structured development period ran from August 2025 to May 2026, spanning CMPE 295A (Fall 2025) and CMPE 295B (Spring 2026). Phase 1 completed the core architecture, frontend prototype, backend API development, and attention tracking module. Phase 2 delivered the adaptive state machine with effectiveness memory, agentic chat, section-based mastery tracking, knowledge graph visualization, comprehensive testing, and deployment preparation.

### 9.2 Conclusions

#### 9.2.1 Technical Feasibility of Privacy-Preserving Attention Tracking

The project demonstrates that accurate, real-time attention estimation can be accomplished entirely on the client side using standard web technologies. MediaPipe FaceLandmarker operating via WebAssembly with GPU delegation provides reliable facial landmark detection at 5 Hz or higher. The multi-signal composite score (EAR, gaze, head pose, blink rate) with asymmetric EMA smoothing provides a robust proxy for attention state. Above all, processing video locally without transmitting any frames addresses the privacy concerns that have traditionally prevented affective computing from being widely adopted in educational contexts.

#### 9.2.2 Threshold-Based Adaptation is Effective and Interpretable

The dual-layer adaptive system -- combining server-side deterministic decisions with a client-side adaptive state machine -- proves both effective and transparent. The deterministic agent engine handles routine study flow decisions (welcome, focus drop, section completion, quiz results, distraction return) with zero latency and zero API cost. The adaptive state machine adds anti-thrashing protections and effectiveness memory that learns from each user's responses. One major advantage of this approach over black-box machine learning models is transparency: educators and learners can understand, trust, and modify the adaptation logic.

#### 9.2.3 Native PDF Processing Eliminates Pipeline Complexity

Using Claude Vision API for native PDF processing represents a significant architectural simplification. Traditional document processing pipelines require text extraction libraries, cleaning, chunking strategies, and context window management. By sending the PDF binary directly to a multimodal model, the system preserves visual context (images, diagrams, tables), handles diverse document formats naturally, and produces higher-quality structured output in a single API call. This approach eliminates an entire category of bugs related to text extraction quality and chunk boundary management.

#### 9.2.4 Grounded AI Generation Produces High-Quality Educational Content

Combining section-scoped generation (sending specific section text rather than full documents) with structured prompting and JSON schema validation produces reliable educational content. The differentiation between flashcard prompts (definitions and terminology) and quiz prompts (understanding and application) ensures complementary coverage. Per-section content caching eliminates redundant API calls while maintaining content freshness per document.

#### 9.2.5 Multimodal Interventions Improve Engagement

The system's capacity to switch between multiple intervention types (quizzes, flashcards, mind maps, audio narration, games, break prompts) based on attention state and content availability results in high intervention completion rates. The effectiveness memory enables the system to learn which transitions work best for each student, providing truly personalized adaptation without requiring pre-trained models.

#### 9.2.6 Limitations

Several limitations should be noted. The focus detection relies on webcam availability and is affected by lighting conditions. The threshold-based decision engine, while interpretable, may not capture complex learning patterns that a machine learning model could. The system's reliance on the Anthropic Claude API introduces per-query costs and potential vendor dependency. SQLite, while ideal for single-user sessions, would require migration to PostgreSQL for multi-user production deployment.

### 9.3 Recommendations for Further Research

1. **RAG Pipeline for Improved Chat Accuracy**: The current chat agent receives the document summary (3,000 characters) as context. Implementing a Retrieval-Augmented Generation pipeline with vector embeddings (e.g., sentence-transformers) and a lightweight vector store (ChromaDB) would enable the agent to retrieve and cite specific relevant chunks when answering questions, improving answer accuracy and providing source attribution.

2. **Personalized Intervention Timing Using Reinforcement Learning**: The current threshold-based engine uses fixed parameters (focus score below threshold for N seconds, M-minute cooldown). Reinforcement learning could personalize these parameters for each user, learning the optimal intervention timing based on individual response patterns.

3. **Mobile Application with On-Device ML**: A mobile application using TensorFlow Lite with a quantized MediaPipe FaceMesh model would extend the system's accessibility to smartphones and tablets, enabling study sessions without a laptop.

4. **Longitudinal Retention Study**: A longer-term study (3-6 months) would provide stronger evidence of the spacing effect benefits of attention-adaptive interventions, particularly for measuring long-term knowledge retention.

5. **Integration with Learning Management Systems**: LTI (Learning Tools Interoperability) integration with Canvas, Moodle, or Blackboard would enable institutional deployment, allowing instructors to assign materials and monitor anonymized engagement metrics.

6. **Collaborative Study Rooms**: Real-time collaborative sessions where multiple students study the same document could introduce peer-to-peer engagement and aggregated (anonymized) attention metrics.

7. **Explainable Intervention Visualization**: Visual explanations showing students why an intervention was triggered (e.g., a timeline showing the focus score dropping below threshold for 10 seconds) would improve trust and metacognitive awareness.

8. **Support for Additional Document Formats**: EPUB, DOCX, web pages (via URL), and OCR for scanned documents would broaden the range of supported educational materials.

---

## Glossary

**Adaptive Decision Engine**: A rule-based component that evaluates real-time focus scores and triggers appropriate learning interventions based on configurable thresholds and engagement history. In StudyBuddy.AI, this operates as two layers: a server-side deterministic engine and a client-side adaptive state machine.

**Adaptive State Machine**: A client-side finite state machine with states (READING, VISUAL, RECALL, TESTING, GAME, BREAK, RECOVERY) that transitions between content formats based on focus score analysis, with anti-thrashing protections and effectiveness memory.

**Anthropic Claude API**: The large language model API used in StudyBuddy.AI for all AI operations. Claude Sonnet 4 (claude-sonnet-4-20250514) handles document processing, content generation, knowledge graph extraction, chat, and distraction recaps.

**Claude Vision API**: Anthropic's multimodal API capability that processes PDF documents natively by accepting base64-encoded binary data, reading text, images, diagrams, and tables without requiring text extraction libraries.

**EAR (Eye Aspect Ratio)**: A geometric measure of eye openness derived from facial landmark positions around each eye. Computed as (|p2-p6| + |p3-p5|) / (2 * |p1-p4|) using the Soukupova and Cech (2016) formula. Typical values: 0.35-0.40 for open eyes, 0.05-0.10 for blinks.

**Edge TTS**: Microsoft's neural text-to-speech service used via the edge-tts Python library for generating natural-sounding audio narration of study content without requiring an API key.

**Effectiveness Memory**: A data structure in the AdaptiveStateMachine that records focus score deltas before and after each content format transition. Used to learn which transitions produce the best focus improvement for personalized adaptation.

**Exponential Moving Average (EMA)**: A statistical smoothing technique. StudyBuddy.AI uses an asymmetric variant: alpha = 0.5 for falling scores (fast response to disengagement) and alpha = 0.25 for rising scores (slow response to prevent false positives from brief glances).

**Focus Predictor**: A linear regression model that analyzes the last 30 seconds of focus history to predict where focus will be 30 seconds ahead, enabling proactive intervention before focus actually drops below threshold.

**Knowledge Graph**: A structured representation of concepts extracted from a document, including concept IDs, names, descriptions, importance ratings (1-5), and prerequisite relationships. Used for prerequisite checking and visualization.

**MediaPipe FaceMesh**: A Google library that detects 468 three-dimensional facial landmarks in real time using on-device machine learning models running in web browsers via WebAssembly.

**Next.js**: A React framework for building web applications with server-side rendering, file-based routing, and optimized builds. StudyBuddy.AI uses Next.js 15 with React 19.

**RAG (Retrieval-Augmented Generation)**: A technique that combines information retrieval with language generation. StudyBuddy.AI applies RAG principles by grounding all generated content in specific document sections.

**Section-Based Mastery**: A progress tracking model where each document section progresses through stages: Not Started -> In Progress -> Read -> Tested -> Mastered, with quiz scores determining advancement.

**shadcn/ui**: A component library built on Radix UI primitives providing accessible, composable UI components for React applications.

**SQLAlchemy**: A Python Object-Relational Mapper providing database abstraction. StudyBuddy.AI uses SQLAlchemy 2.0+ with SQLite as the database backend.

**WebAssembly (WASM)**: A binary instruction format enabling near-native performance execution in web browsers. MediaPipe uses WebAssembly for high-performance client-side facial landmark detection.

---

## References

1. Mejbri, N., Khemaja, M., Bouzid, M., & Jemni, M. (2022). Trends in the use of affective computing in e-learning environments. Education and Information Technologies, 27(3), 3867-3889. https://doi.org/10.1007/s10639-021-10769-9

2. Wang, B., Huang, J., Zhang, D., Zhang, Y., Li, Y., & Li, Y. (2025). Intelligent gesture recognition gloves for real-time monitoring in wireless human-computer interaction. ACS Applied Materials & Interfaces, 17(1), 790-798. https://doi.org/10.1021/acsami.4c20660

3. Nwana, H. S. (1991). User modelling and user adapted interaction in an intelligent tutoring system. User Modeling and User-Adapted Interaction, 1(1), 1-32. https://doi.org/10.1007/BF00158950

4. Zhan, S., Zhang, X., Wang, Z., Yu, Y., & Wu, Q. (2025). A review on federated learning architectures for privacy-preserving AI: Lightweight and secure cloud-edge-end collaboration. Electronics, 14(13), 2512. https://doi.org/10.3390/electronics14132512

5. Hao, W., Min, C., Li, Z., & Jin, Q. (2017). Integrating both visual and audio cues for enhanced video caption. arXiv. https://doi.org/10.48550/arxiv.1711.08097

---

## Appendices

### Appendix A. Repository Structure

The complete source code for StudyBuddy.AI is hosted at https://github.com/PuneethRegonda/studybuddy.ai.

```
studybuddy.ai/
+-- app/                           # Next.js 15 frontend application
|   +-- dashboard/
|   |   +-- page.tsx               # Main page entry point
|   |   +-- dashboard-view.tsx     # Primary dashboard with state management
|   +-- lib/
|   |   +-- focus-detection/       # Client-side focus tracking engine
|   |   |   +-- focus-engine.ts    # FocusEngine class (MediaPipe integration)
|   |   |   +-- signal-processor.ts # EAR, gaze, head pose computation
|   |   |   +-- focus-predictor.ts # Linear regression focus prediction
|   |   |   +-- activity-tracker.ts # Tab visibility, inactivity detection
|   |   |   +-- types.ts           # Focus types and configuration
|   |   |   +-- use-focus-detection.ts # React hook
|   |   +-- adaptive-engine/       # Client-side adaptive state machine
|   |   |   +-- state-machine.ts   # AdaptiveStateMachine class
|   |   |   +-- types.ts           # Learning states, transition records
|   |   |   +-- use-adaptive-engine.ts # React hook
|   |   +-- constants.ts           # Backend URL configuration
|   |   +-- definitions.ts         # Shared type definitions
|   +-- services/
|   |   +-- agentService.ts        # Agent decision + chat API calls
|   |   +-- contentService.ts      # Content generation API calls
|   |   +-- sessionService.ts      # Session + analytics API calls
|   +-- ui/
|   |   +-- agent/                 # Agent UI components
|   |   |   +-- agent-card.tsx     # Inline agent card with buttons
|   |   |   +-- agent-chat.tsx     # Floating chat panel
|   |   +-- main-display/          # Content renderers
|   |   |   +-- main-display.tsx   # Content tab router
|   |   |   +-- text-content.tsx   # Markdown section renderer + TTS
|   |   |   +-- flip-card-content.tsx # Flashcard deck
|   |   |   +-- quiz-content.tsx   # Multiple-choice quiz
|   |   |   +-- mindmap-content.tsx # ReactFlow mind map
|   |   |   +-- mini-game-content.tsx # Drag-and-drop game
|   |   +-- modal/
|   |   |   +-- upload-modal.tsx   # Document upload dialog
|   |   +-- sidebar/
|   |   |   +-- sources-sidebar.tsx # Document + section navigation
|   |   +-- studio-panel/
|   |   |   +-- studio-panel.tsx   # Camera feed + focus display
|   |   +-- session/
|   |       +-- session-report.tsx # Session analytics modal
+-- backend/
|   +-- main.py                    # All API endpoints (Flask)
|   +-- database.py                # SQLAlchemy models (10 tables)
|   +-- document_processor.py      # PDF/text processing via Claude Vision
|   +-- agent_engine.py            # Deterministic decision engine
|   +-- study_agent.py             # LLM-backed chat agent
|   +-- knowledge_graph.py         # Concept extraction via Claude
|   +-- requirements.txt           # Python dependencies
|   +-- .env                       # ANTHROPIC_API_KEY (not committed)
|   +-- studybuddy.db              # SQLite database (auto-created)
+-- plans/                         # Architecture docs and roadmap
+-- package.json                   # Node.js dependencies
+-- next.config.ts                 # Next.js configuration
+-- postcss.config.mjs             # PostCSS for Tailwind v4
+-- tailwind.config.ts             # Tailwind CSS configuration
+-- tsconfig.json                  # TypeScript configuration
+-- README.md                      # Project documentation
```

### Appendix B. Prompt Engineering Templates

#### Document Processing Prompt (Claude Vision API)

```
You are an expert educator. Analyze this document and break it into structured
study sections.

For each section:
1. Give it a clear title
2. Write a well-structured Markdown summary (use ## headings, bullet points, highlights)
3. List the key concepts covered
4. Note which concepts from earlier sections are prerequisites
5. Estimate reading time in minutes

Also extract a knowledge graph of all concepts with their prerequisite relationships.

Return ONLY valid JSON in this exact format:
{
  "title": "Document Title",
  "summary": "A 2-3 sentence overview of the entire document",
  "sections": [...],
  "knowledge_graph": { "concepts": [...] }
}

Rules:
- Scale sections to document size. Short documents (1-3 pages) get 2-3 sections max.
  Medium (4-10 pages) get 3-5 sections. Long (10+ pages) get 5-8 sections.
- Each section should be substantial -- at least 3-5 minutes of reading.
- Content should be detailed enough to study from, not just a summary.
- Concepts should use kebab-case IDs.
- Write for a college-level audience.
```

#### Flashcard Generation Prompt

```
Create 5-7 flashcards focused on KEY DEFINITIONS and TERMINOLOGY.
- Front: A specific term, concept name, or "What is...?" question
- Back: A clear, concise definition or explanation (1-2 sentences max)
- Focus on terms the student needs to memorize
- Do NOT create questions about relationships between concepts (save that for quizzes)

Return as a raw JSON array: [{"front": "...", "back": "..."}]
```

#### Quiz Generation Prompt

```
Create 5-7 multiple choice questions that test UNDERSTANDING and APPLICATION, not just recall.
- Ask "Why does X happen?" not "What is X?"
- Ask "In scenario Y, what would happen?" not "Define Y"
- Ask "What is the relationship between X and Y?"
- Include one question that requires comparing two concepts
- Make wrong options plausible, not obviously wrong

Each question needs: question, options (4), correctOptionIndex (0-3), explanation

Return as a raw JSON array: [{"question": "...", "options": [...],
"correctOptionIndex": 2, "explanation": "..."}]
```

#### Study Agent System Prompt

```
You are StudyBuddy, an AI study assistant.

CURRENT SESSION STATE:
- Document: "{title}"
- Current content format: {content_type}
- Student's focus score: {focus_score}%
- Session duration: {duration} minutes
- Distractions this session: {count}

DOCUMENT SUMMARY:
{summary (first 3000 chars)}

KEY CONCEPTS:
{concept names from knowledge graph}

YOUR ROLE:
- Help the student understand the material
- Answer questions about the document
- If their focus is low, keep responses short and engaging
- Never mention focus scores or tracking directly -- be natural
- Be concise. Students don't want walls of text.
```

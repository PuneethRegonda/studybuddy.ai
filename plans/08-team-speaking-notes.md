# Team Speaking Notes

---

## Puneeth — Focus Detection + Frontend

### My Part (2 min)

"I built the focus tracking system. It runs completely in your browser — nothing goes to any server. We use MediaPipe FaceMesh which gives us 468 face landmarks through WebAssembly. From those landmarks I compute four things: how open your eyes are using Eye Aspect Ratio, where you're looking using iris positions, how often you blink, and which way your head is turned.

These four signals combine into a single focus score from 0 to 100. I use a smoother that drops fast when you lose focus but rises slowly — because losing focus happens instantly but getting it back takes real effort.

The interesting part is the predictor. I run linear regression on the last 30 seconds of your focus data and predict where it will be 30 seconds from now. So the system can say 'hey, you're about to lose focus' before you actually zone out. That's proactive, not reactive.

I also built the adaptive state machine that decides when to switch content. It has rules to prevent flipping back and forth too fast, and it remembers which switches actually improved your focus. So over time it learns — for this student, quizzes work better than flashcards when focus drops."

### If Asked

- "Why not send video to the server?" — Privacy. Zero frames leave your browser. Also zero latency and infinite scaling since compute is on the client.
- "Why not use an LSTM for prediction?" — We only have 30 seconds of data. A linear slope works fine. Neural networks need way more training data.
- "How accurate is the focus score?" — It's a proxy, not ground truth. But EAR correlates well with attention in published research. We supplement it with tab visibility and inactivity detection to catch things the camera misses, like phone distraction.

---

## Mahesh — Backend + Document Processing + Database

### My Part (2 min)

"I built the backend. When you upload a PDF, we send the raw bytes directly to the Claude Vision API. Claude literally sees the pages — images, diagrams, tables, everything. We don't extract text first because that loses all the visual content, and study material is full of figures.

Claude breaks the document into structured sections — each section has a title, content, a list of concepts it covers, and which concepts are prerequisites. A 5-page PDF gets 2 or 3 sections, not 7 — we scale to document size.

All of this goes into a SQLite database. We have 10 tables. The key ones are document_sections for the content, section_progress for tracking mastery, and generated_content for caching. When you ask for flashcards on Section 2, we generate them once with Claude and cache them. Next time you switch back, it's instant from the database — no LLM call.

The knowledge graph is extracted separately — Claude identifies all the concepts and their prerequisite relationships. This powers the sidebar visualization and lets the agent redirect you if you're missing prerequisites.

We have over 20 API endpoints covering document management, content generation, session tracking, agent decisions, and chat."

### If Asked

- "Why SQLite not Postgres?" — Single-user study app. SQLite is zero configuration, no separate process. SQLAlchemy ORM means we can swap to Postgres with one line if we need multi-user.
- "Why send the whole PDF to Claude instead of chunking?" — Chunking loses images and cross-page context. Claude Vision handles full documents natively. It costs about 2 cents per 5 pages, one-time.
- "How do you handle large documents?" — We cap at 8192 output tokens from Claude and scale sections to document length. Very large docs get more sections with more content each.

---

## Siri — UI Components + Content Renderers

### My Part (2 min)

"I built all the study interfaces that the student actually interacts with. The text reader has proper typography — readable line heights, good heading sizes, styled code blocks and blockquotes. The read-aloud feature uses Microsoft's Edge TTS, which produces natural-sounding speech. We use the Jenny Neural voice, slowed down slightly, at a lower pitch so it's soft and easy to listen to. The text gets cleaned before speaking — we strip markdown, remove duplicate sentences, and add punctuation so the voice pauses naturally between ideas.

The quiz component is a full flow — you go question by question, get immediate feedback showing which answer was correct and why, then see a results summary. The prompts specifically test understanding, not just recall. Questions ask 'why does this happen' and 'what would happen in this scenario' — that's different from the flashcards which test definitions.

The flashcards have a 3D flip animation. The mind map uses automatic layout with color-coded depth levels, and it's smart about clutter — if a topic has five sub-items with no children, they collapse into one box with bullet points instead of five separate boxes.

The break screen has a breathing circle that gently pulses on an 8-second cycle with a live timer. Everything works in dark mode — I themed all components including the scrollbar."

### If Asked

- "Why Edge TTS not the browser's built-in speech?" — The browser speech API sounds robotic. Edge TTS uses neural network voices that sound like a real person. The audio gets cached as MP3 so it only generates once.
- "Why are flashcard and quiz prompts different?" — If you use the same prompt, you get the same questions in a different format. That's not useful. Flashcards drill terminology. Quizzes test whether you understand the relationships. Switching between them gives genuinely different practice.
- "How do mind maps handle complex documents?" — Dagre handles the layout automatically. We collapse leaf nodes into their parent when there are many. The color gradient from blue to purple shows hierarchy depth at a glance.

---

## Sunil — Agent + Decision Engine + Analytics

### My Part (2 min)

"I built the agent that runs the study session. It's not a chatbot — it's a decision engine. It reads from the database, checks your progress, and tells you what to do next. There's no LLM involved in the decisions — it's deterministic logic. That means it responds in microseconds, costs nothing, and is completely predictable.

The agent has five decision points. When you open a document, it checks how many sections you've mastered and suggests where to start. When your focus drops, it suggests switching formats. When you finish reading a section, it prompts you to take a quiz. After a quiz, if you score above 70 percent, it marks the section as mastered and moves you forward. Below 70, it suggests reviewing with flashcards.

It's also prerequisite-aware. If Section 4 needs concepts from Section 2 and you haven't mastered Section 2, it redirects you there first.

The chat interface has two modes. Quick commands like 'quiz me' or 'next section' trigger actions instantly — no LLM call. Free-form questions like 'explain this differently' go to Claude with your full session context injected — your focus score, what you've covered, what you got wrong. The conversation saves to the database so it remembers what you discussed.

For analytics, I batch focus events and record everything — distractions, content switches, quiz scores. The session report shows you your focused time percentage, which content format held your attention best, and how many times you got distracted."

### If Asked

- "If it's rule-based, how is it an agent?" — It has perception through focus data, memory through the database, planning through prerequisite checking, and action through content switching. That's the agent loop. The rules are the policy — transparent and debuggable.
- "Why not use an LLM for all decisions?" — Decisions happen 20 plus times per session. An LLM takes 3 seconds and costs money each time. The deterministic engine is instant and free. We only use the LLM for open-ended conversation.
- "How does effectiveness memory work?" — Every time we switch content, we record the student's focus score before and after. Over sessions, we see patterns — quizzes improve this student's focus by 25 points, flashcards only by 8. Next time, we prefer quizzes.

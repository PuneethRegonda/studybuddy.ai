# Code Review — Current State Assessment

## Overview

The current codebase is a hackathon prototype with a Next.js 15 frontend and two Flask backends (content API on port 5000, focus server on port 5002). The architecture demonstrates the concept but has significant gaps that must be addressed before deployment.

---

## Backend: Content API (`backend/main.py`)

### Issues
- No environment variable validation — server crashes silently if `GOOGLE_API_KEY` is missing
- Temporary file leak — if Gemini API call fails mid-processing, temp files are never cleaned up (no `try/finally` around `os.remove`)
- No file type validation on upload endpoint — accepts any file type, not just PDFs
- No request size limits (`MAX_CONTENT_LENGTH` not set) — allows arbitrarily large uploads
- JSON parsing from Gemini responses only handles one specific markdown fence format (`\`\`\`json`). Gemini frequently returns variations that break parsing
- No rate limiting on any endpoint
- No authentication — endpoints are open to anyone
- CORS configured with wildcard origin + credentials, which is a security misconfiguration
- Model name is not configurable — locked to a specific Gemini version

### Recommendations
- Add `.env` validation on startup with clear error messages
- Use `try/finally` for temp file cleanup
- Whitelist allowed file types and enforce `MAX_CONTENT_LENGTH`
- Implement robust markdown fence stripping (regex-based)
- Add Flask-Limiter for rate limiting
- Add JWT or API key authentication middleware
- Restrict CORS to specific frontend origin
- Make model name an environment variable

---

## Backend: Focus Server (`backend/focus_server.py`)

### Issues
- The core focus detection is non-functional — EAR (Eye Aspect Ratio) is computed but the result is discarded and replaced with a random number. The entire MediaPipe pipeline produces no usable output
- MediaPipe FaceMesh is instantiated as a module-level singleton — not safe for concurrent clients
- No `async_mode` specified for Flask-SocketIO — defaults to threading, which causes issues under load
- `socketio.sleep(1.5)` inside the event handler blocks the processing pipeline unnecessarily
- `socketio.emit()` broadcasts to ALL connected clients — no room/namespace isolation for multi-user
- No frame validation (size, format, authenticity)
- No authentication on socket connections

### Recommendations
- This entire server should be eliminated. Focus detection should move to the browser using MediaPipe's JavaScript/WASM SDK (see Technical Depth document)
- If server-side processing is retained temporarily: use actual EAR values, create per-session MediaPipe instances, add `async_mode='eventlet'`, use socket rooms for user isolation

---

## Backend: Upload Service (`backend/upload_service.py`)

This file is an unused duplicate of the upload endpoint that returns dummy data. It should be deleted.

---

## Backend: Dependencies (`backend/requirements.txt`)

The requirements file is a `pip freeze` dump of a full Anaconda environment (~450 packages). It includes TensorFlow, PyTorch, Django, Scrapy, Jupyter, and hundreds of other unrelated packages. Many entries contain local file paths (`@ file:///...`) that won't resolve on any other machine.

This file needs to be replaced with a minimal, pinned dependency list containing only what the project actually uses.

---

## Frontend: Dashboard Orchestrator (`app/dashboard/page.tsx`)

### Issues
- Backend URL is inlined as a string literal instead of using the defined `BACKEND_API_URL` constant
- React useEffect dependency arrays are incomplete — `fetchContent` is called inside a useEffect but not listed as a dependency, causing stale closure bugs
- `handleAttentionChange` callback has unstable dependencies that can trigger unnecessary re-renders
- Break timer cleanup function is returned inside a regular callback (not a useEffect), so the cleanup never executes — this is a memory leak
- Break modal has no CSS styling defined — renders as unstyled HTML
- Three separate code paths for content switching (`generatedContent`, `suggestedContentType`, `updateContentType`) with overlapping logic
- No error state UI — if the upload or content generation fails, the user sees nothing
- All data types use `any` — no type safety on the most critical data flowing through the app

### Recommendations
- Use constants for all backend URLs
- Fix all useEffect dependency arrays (enable `eslint-plugin-react-hooks`)
- Consolidate content switching into a single clear path
- Add error boundary and error state rendering
- Define proper TypeScript interfaces for all content data

---

## Frontend: Content Renderers

### Quiz Content (`app/ui/main-display/content/quiz-content.tsx`)
- React hooks (`useState`) are called after a conditional early return — this violates the Rules of Hooks and will crash in development mode. Hooks must be called before any conditional returns.

### Mindmap Content (`app/ui/main-display/content/mindmap-content.tsx`)
- Same Rules of Hooks violation — `useState` and `useEffect` called after conditional return
- Dagre graph instance is module-level and shared across all renders — corrupts layout if multiple mindmaps render
- Node IDs generated with `Math.random()` cause React reconciliation issues on re-render

### Flip Card Content (`app/ui/main-display/content/flip-card-content.tsx`)
- Falls back to sample data when no data is provided — in production should show an error or empty state instead

### Text Content (`app/ui/main-display/content/text-content.tsx`)
- TTS reads raw markdown syntax aloud (headings, bullet markers). Markdown should be stripped before passing to SpeechSynthesis

### Mini Game Content (`app/ui/main-display/content/mini-game-content.tsx`)
- Drag-and-drop uses only mouse events — does not work on touch devices (mobile/tablet)

---

## Frontend: Studio Panel

### Video Stream (`app/ui/studio-panel/video-stream.tsx`)
- Uses `ImageCapture` API which is only supported in Chromium browsers — breaks in Firefox and Safari
- useEffect dependency on `displayMode` causes socket disconnection and camera restart when toggling display modes
- Interval ID stored in DOM `dataset` attribute instead of a React ref — anti-pattern
- Creates its own Socket.IO connection, duplicating the connection in `attention-level-display.tsx`

### Attention Level Tracker (`app/ui/studio-panel/attention-level-display.tsx`)
- Creates a separate Socket.IO connection to the same server (duplicate of video-stream)
- Socket is destroyed and recreated when `isContentLoaded` changes — loses focus history
- useEffect both depends on and calls `onAttentionChange` — potential infinite render loop if parent doesn't memoize correctly
- Content generation API calls (flashcards, quiz, mindmap, mini-game) are made inside this component — violates separation of concerns. Content generation should be managed by the dashboard orchestrator

### Attention Chart (`app/ui/studio-panel/attention-chart.tsx`)
- Displays completely static data — never receives or renders real attention data. The chart, trend calculation, and average are all computed from a fixed array defined at module level

---

## Frontend: Upload Modal

### Upload Area (`app/ui/modal/upload-area.tsx`)
- Simulates upload with a 2-second `setTimeout` then closes the modal. The actual file processing happens later when the dashboard calls `fetchContent`. This creates a false sense of completion
- File state accumulation uses stale closure (`[...files, ...newFiles]` instead of functional update)

### Source Options (`app/ui/modal/source-options.tsx`)
- Google Drive, Google Docs, Google Slides, YouTube, Link, and Paste Text options all render as clickable cards but have no functionality attached

---

## Frontend: React Embed System (`app/ui/react-embed-component/`)

This entire module is non-functional:
- `json-to-tsx-utility.ts` is a server action that overwrites source code files at runtime — fundamentally broken in production builds
- `DynamicComponent.tsx` contains a Dijkstra algorithm visualizer unrelated to the study app
- `ReactEmbedViewer.tsx` attempts to trigger source code generation and re-render — does not work after build
- The module is not referenced in the active content rendering pipeline

Should be deleted entirely.

---

## Infrastructure

### Missing Files
- No `.env` or `.env.example` — no documentation of required environment variables
- No `package-lock.json` or lock file — non-deterministic builds
- No Dockerfile or docker-compose — no containerization story
- No `.gitignore` for common patterns (`.env`, `node_modules`, `__pycache__`)

### Configuration Issues
- `package.json` name is "focuspals-fe" — does not match project name
- `layout.tsx` metadata still says "Create Next App" / "Generated by create next app"
- `app/redirect.tsx` is a duplicate of `app/ui/dashboard/redirect.tsx` — unused

### Unnecessary Files
- `public/brainRot.mp4` — not used in active code paths
- `app/ui/react-embed-component/SAMPLE_VISUALIZER_DATA.json` — part of dead embed system

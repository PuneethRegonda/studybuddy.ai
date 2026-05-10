# Siri Chandana Uppula — Project Contributions

## CMPE 295B, Project Contribution Report

**Project Title:** StudyBuddy.AI - Adaptive Learning Assistant
**Project Advisor:** Dr. Younghee Park

---

## Role: Focus Detection, MediaPipe, Scoring & Decision Engine Lead

### Video Demo Talking Points

**Introduction (30s)**
- "Hi, I'm Siri Chandana Uppula. I led the focus detection system, attention scoring, and adaptive decision engine for StudyBuddy.AI."
- "My work is the intelligence layer that monitors student attention in real time and decides when and how to intervene."

**CMPE 295A Contributions (1-2 min)**
- Implemented the client-side focus detection module:
  - MediaPipe FaceMesh running entirely in browser via WebAssembly
  - Eye Aspect Ratio (EAR) computation from six facial landmarks per eye
  - Gaze deviation tracking via iris center positions (landmarks 468, 473)
  - Head pose estimation via nose-cheek-forehead geometry
  - Blink rate detection using a 60-second sliding window
  - Weighted composite focus score with asymmetric EMA smoothing
  - 5 Hz or higher update rate without blocking the main UI thread
- Built the studio panel with camera feed and real-time attention scoring:
  - Attention charts, focus display, and focus score visualizations
  - Camera feed component with privacy-preserving design
- Implemented the threshold-based adaptive decision engine state machine:
  - Configurable intervention triggers (focus < 60 for 10+ seconds)
  - Cooldown periods to prevent intervention fatigue
  - Minimum dwell times and anti-thrashing logic
  - Effectiveness memory tracking which format transitions work best

**CMPE 295B Contributions (2-3 min)**
- Integrated the decision engine with section-based focus scoring:
  - Context-aware intervention selection based on section content and mastery
  - Focus trajectory analysis to predict intervention timing
- Built the focus predictor module:
  - Linear regression on last 30 seconds of focus history
  - Predicts attention level 30 seconds ahead for proactive intervention
- Developed the activity tracker:
  - Keyboard, mouse, and scroll interaction monitoring
  - Multi-signal attention estimation supplementing camera-based detection
- Added knowledge graph visualization to the focus scoring sidebar
- Engineered the break screen with countdown timer for focus recovery
- Built the floating focus panel widget with minimize support:
  - Compact mode showing only the focus score indicator
  - Non-intrusive monitoring during study sessions
- Fixed MediaPipe guard conditions, dark scrollbar, and focus scoring edge cases
- Updated README for project report submission

**Key Metrics to Mention**
- Focus detection runs at 5+ Hz with zero frame transmission
- EAR + gaze + head pose + blink rate → composite score (0-100)
- Focus predictor enables proactive intervention 30 seconds ahead
- Decision engine supports 6 intervention types with anti-thrashing logic

---

## Pitch Deck Talking Points

### Slide: Privacy-Preserving Focus Detection
- "All facial landmark processing happens in the browser using WebAssembly. Only scalar scores leave the device — zero video frames ever transmitted."
- "We compute EAR, gaze deviation, head pose, and blink rate for a composite attention score at 5 Hz."

### Slide: Adaptive Decision Engine
- "The decision engine triggers interventions when attention drops below threshold. It has anti-thrashing logic — cooldowns, dwell times, and effectiveness memory."

### Slide: Focus Predictor
- "We don't just react — we predict. Linear regression on the last 30 seconds forecasts attention 30 seconds ahead."

### Slide: Demo
- Show focus detection activating with camera
- Show focus score dropping → intervention trigger
- Show break screen and focus recovery flow
- Show floating focus panel in compact mode

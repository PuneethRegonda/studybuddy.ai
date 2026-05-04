# Product Gaps — What's Wrong and What's Missing

## Target User Profile

Primary audience: Students with attention difficulties (ADHD, short attention spans, chronic distraction habits) who need to study high-stakes material under time pressure.

Typical scenario: "I have a test tomorrow. I have ADHD. I have two monitors — one with my study material, one with a sitcom. My phone is next to me. I need to learn this PDF in 4 hours. Help me."

---

## Critical Product Gaps

### 1. Focus Detection Is Non-Functional

The entire product thesis is "we adapt to your focus level." The focus detection returns random numbers. Until this works, nothing else matters. This is the foundation that every other feature depends on.

### 2. Single-Camera Blindspot (Multi-Monitor Problem)

A student with ADHD often has multiple screens. Our camera sits on one monitor. If the student is watching Netflix on monitor 2 while their face points at monitor 1's webcam, we report "focused." We cannot detect:
- Attention on a secondary display
- Phone usage below camera frame
- Mental disengagement while physically facing the screen (zoning out)

**Mitigation strategies:**
- Gaze direction analysis — if eyes consistently look left/right of center, they're likely on another screen
- Micro-expression detection — passive watching (entertainment) has different facial patterns than active reading
- Periodic active check-ins — brief comprehension questions that require engagement to answer
- Browser tab focus detection (`document.visibilityState`) — detect if the study tab itself loses focus
- Screen time correlation — if focus score is high but no scroll/click activity on the page, flag it

### 3. No Deadline or Time Awareness

The system has no concept of:
- When the test is
- How much material needs to be covered
- How much time the student has
- What pace they need to maintain

A student with a test in 4 hours needs a fundamentally different experience than one reviewing material casually. The system should calculate: "You have 45 pages of material. At your reading speed and retention rate, you need approximately 3 hours of focused study. You have 4 hours. Here's your study plan."

### 4. No Study Plan Generation

The system throws content at the student reactively. It never says:
- "Focus on chapters 3 and 5 — that's where the exam-relevant material is"
- "You've mastered section 1, skip it. Section 4 needs work."
- "At your current pace, you'll finish with 30 minutes to spare for review"

There's no proactive planning, only reactive content switching.

### 5. No Comprehension Verification Loop

The student reads a summary. We show it. But did they actually learn it? The only verification is if the adaptive engine switches to a quiz — which only happens when focus drops. A student could read the entire summary with high focus and retain nothing.

There should be mandatory comprehension checkpoints: after every section, 1-2 quick questions to verify retention before moving on.

### 6. Content Switching May Worsen ADHD

Constantly switching between text, flashcards, quiz, mindmap, and mini-games feeds the ADHD brain's craving for novelty. This could train shorter attention spans rather than building sustained focus. The system might inadvertently become an ADHD dopamine slot machine.

**Mitigation:** The adaptive engine should have a "focus training" mode that gradually extends time in each content type rather than switching immediately when focus drops. Start with 3-minute blocks, work up to 10-minute blocks over sessions.

### 7. No Distraction Recovery Flow

When a student gets distracted and comes back, the system currently does nothing. It should:
- Detect the absence (face gone or gaze away for >30 seconds)
- Auto-pause content
- On return: provide a contextual recap of where they left off
- Offer a quick comprehension check to assess what they retained before the distraction
- Log the distraction event for analytics

### 8. No Persistence Whatsoever

Nothing survives a page refresh:
- Uploaded documents — gone
- Generated summaries, quizzes, flashcards — gone
- Focus history — gone
- Session progress — gone
- Quiz scores — gone

A student who accidentally closes the tab loses everything. This is unacceptable for a product.

### 9. No Multi-User Support

No authentication, no user accounts, no data isolation. The Socket.IO server broadcasts to all clients. This limits the product to single-user local use only.

### 10. Source Options Are Non-Functional

The upload modal shows Google Drive, Google Docs, Slides, YouTube, Link, and Paste Text as source options. None of them work. They should either be implemented or removed with "Coming Soon" labels.

---

## UX Gaps

### No Onboarding
A new user lands on a redirect screen, then an empty dashboard. No explanation of what the product does, how to use it, or what the camera is for. Camera permission is requested with no context.

### No Mobile Support
- Drag-and-drop mini-game doesn't work on touch devices
- Layout is fixed-width, not responsive
- Camera handling assumes desktop webcam

### No Accessibility
- No keyboard navigation for quiz or flashcard components
- No screen reader support
- No high contrast mode
- Focus detection assumes a visible face — excludes users who cannot use a camera

### No Offline Capability
Everything requires the backend server. No service worker, no cached content, no offline mode. If the student's internet drops mid-session, they lose access to their study material.

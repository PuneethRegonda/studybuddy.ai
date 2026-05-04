# ADHD User Scenario Analysis

## The Scenario

A student with ADHD has a test tomorrow. They need to study a PDF covering complex material. They have two monitors (study material on one, entertainment on the other), a phone nearby, and an attention span that breaks every few minutes. They open StudyBuddy.AI, upload the PDF, and need to learn it.

---

## What the Product Must Handle

### Multi-Monitor Distraction
**Problem:** Camera is on monitor 1. Student watches Seinfeld on monitor 2. Face is still pointing at camera. System thinks they're focused.

**Solutions:**
- Gaze direction detection: if eyes consistently deviate left/right from center, the student is looking at another screen. Flag this as a soft distraction.
- Browser tab focus API: if the student switches to another tab or window, `document.visibilityState` changes to `hidden`. Treat this as distraction.
- Activity detection: if no scroll, click, or keyboard input for 60+ seconds while "focused," something is wrong. Cross-reference focus score with activity.
- Periodic micro-checks: every 5-8 minutes, the agent asks a brief comprehension question. If the student doesn't respond within 30 seconds, they're not actually engaged.

### Phone Distraction
**Problem:** Phone is in lap or beside the keyboard. Student picks it up while face still faces screen. Camera cannot see the phone.

**Solutions:**
- Same activity detection — no interaction with the study material while looking at screen suggests phone use.
- Periodic comprehension checks serve as engagement proof.
- Post-session analytics: "You had 8 periods where your eyes were on screen but you weren't interacting with the material. Were you on your phone?"
- Accept that we can't detect everything. The distraction analytics still create awareness.

### Hyperfocus on Wrong Thing
**Problem:** ADHD students can hyperfocus — staring at the screen, high EAR, steady gaze — but mentally processing something completely unrelated. Our CV pipeline reports high focus.

**Solutions:**
- Comprehension checkpoints are the only reliable detection. If a student has been "focused" for 10 minutes but fails a checkpoint question, they were hyperfocused on something else.
- Reading progress tracking: if they're in text mode and haven't scrolled in 5 minutes, they're not reading.
- Agent intervention: "You've been on this section for a while. Quick check — [question about what they should have just read]."

### Novelty-Seeking vs Sustained Attention
**Problem:** ADHD brains crave novelty. If the system constantly switches content formats when focus drops, it feeds the novelty addiction. The student gets a dopamine hit from each new format but never builds sustained attention.

**Solutions:**
- Focus training mode: Start with short blocks (3 minutes) in each content type. Gradually extend by 1 minute per session as the student builds tolerance. The system tracks their maximum focus duration and sets goals.
- The state machine should prefer EXTENDING the current content type (e.g., adding an interactive element to text) over SWITCHING to a new type.
- Explicit resistance: "Your focus is dropping, but you've been reading for 4 minutes. Can you push to 5? That would beat your personal best."
- Reserve format switching for when focus drops critically low. Moderate dips should be addressed with micro-interventions (a quick question, a highlight, a TTS toggle) not full mode switches.

---

## Distraction Recovery — The Frictionless Return

The most critical UX moment is when the student comes back after a distraction. This must be as fast and smooth as possible. No guilt, no stats, no barriers. Get them reading again in under 3 seconds.

### Three-Path Absence Detection

```
Student is reading...

Face disappears (5 seconds pass)
         |
         v
Soft bar slides in at bottom of screen (does NOT cover content):

+---------------------------------------------------+
|  Still there?    [I'm here]   [Taking a break]    |
+---------------------------------------------------+
```

**Path 1 — False alarm (sneezed, adjusted chair, looked at notes):**
- Student clicks "I'm here"
- Bar disappears instantly
- Content never paused
- Nothing logged, nothing interrupted
- Total disruption: ~1 second

**Path 2 — Intentional break (bathroom, snack, phone call):**
- Student clicks "Taking a break"
- Screen transitions to a calm idle state:
  ```
  +-------------------------------------+
  |                                     |
  |        Enjoy your break.            |
  |                                     |
  |          [I'm back]                 |
  |                                     |
  +-------------------------------------+
  ```
- Focus detection pauses — no face tracking, no distraction events logged
- System respects the student's autonomy
- Agent prepares recap in background while student is away
- When student clicks "I'm back":
  - Recap appears instantly (already prepared)
  - One click to continue reading
  - Total re-entry: 2 clicks, under 3 seconds

**Path 3 — Just left (got distracted, no response to soft bar):**
- 15 seconds after soft bar appears with no response
- Content auto-pauses, screen dims slightly
- Agent prepares recap in background
- When student eventually returns (face detected again):
  ```
  +---------------------------------------------------+
  |                                                     |
  |  You were here:                                     |
  |  "Page replacement algorithms — FIFO replaces       |
  |   the oldest page. LRU replaces the least           |
  |   recently used page."                               |
  |                                                     |
  |  Next up:                                           |
  |  "The Optimal algorithm — replaces the page         |
  |   that won't be used for the longest time."         |
  |                                                     |
  |              [Continue]                              |
  |                                                     |
  +---------------------------------------------------+
  ```
- One click, back to reading, exactly where they left off
- No distraction count shown, no guilt, no lectures
- Distraction event silently logged for session report at end

### Delayed Comprehension Check

The comprehension check does NOT happen at the re-entry point. That would slow down the return. Instead:

```
Student returns -> sees recap -> clicks Continue -> starts reading again
                                                        |
                                              45-60 seconds later
                                                        |
                                                        v
                              Inline check appears at bottom of content
                              (not a modal, not a popup — inline):

                    +---------------------------------------------+
                    | Quick check: What does FIFO replace?        |
                    | [Oldest page] [Newest] [Random] [LRU]       |
                    +---------------------------------------------+

                    Student answers (or ignores — it fades after 20s)
                    Session continues either way
```

This checks whether the pre-distraction material stuck, but doesn't block the flow. The student can ignore it. If they answer wrong, the agent quietly notes that concept needs reinforcement later.

### Key Principle: Agent Prepares While Student Is Away

The recap is generated the moment the student leaves (or clicks "Taking a break"), not when they return. By the time they're back, the recap is already rendered and waiting. Zero loading time, zero delay. The return feels instant because it IS instant — all the work happened while they were gone.

```
Timeline:
  T+0s    Face disappears
  T+5s    Soft bar: "Still there?"
  T+20s   No response, auto-pause
  T+21s   Agent generates recap (Gemini call, ~2s)
  T+23s   Recap pre-rendered, waiting
  ...
  T+180s  Face returns
  T+180s  Recap shown instantly (already ready)
  T+182s  Student clicks "Continue"
  T+182s  Reading resumes
```

---

## The Ideal ADHD Study Session Flow

```
6:00 PM — Student uploads PDF

Agent: "I've analyzed your material: 12 sections, ~45 pages.
Here's what I suggest:
- Start with Chapter 3 (highest concept density)
- Then flashcards to lock in key terms
Let's start. I'll track your focus and adjust as we go."

6:00-6:04 — Reading Chapter 3 summary (focus: 70%)
  Good focus. No intervention needed.

6:04-6:06 — Focus drops to 45%
  State machine: focus declining but only 4 minutes in. Don't switch yet.
  Agent: "Quick check — what's the main difference between paging and
  segmentation?" (micro-intervention, not a full switch)
  Student answers correctly. Focus bumps to 60%.

6:06-6:09 — Continues reading (focus: 55-65%)
  Moderate but sustained. Focus training: don't switch, they're building
  tolerance.

6:09 — Focus drops to 30% for 30 seconds
  State machine: sustained low focus, minimum time in READING met.
  Check effectiveness memory: READING -> RECALL has +25 delta for this user.
  Agent: "Looks like Chapter 3 is getting dense. Let's lock in what
  you've read with flashcards. I generated 8 cards from what you covered."

6:09-6:18 — Flashcards with confidence rating (focus: 72%)
  Focus improved. Cards rated "Again" are flagged for re-review later.
  3 cards marked "Good," 2 marked "Hard," 3 marked "Again."

6:18 — Student looks away (face gone)
  T+5s: Soft bar: "Still there?" [I'm here] [Taking a break]
  No response.
  T+20s: Auto-pause. Agent generates recap in background.

6:20 — Student returns
  Recap already waiting:
  "You were reviewing flashcards on Chapter 3 — Memory Management.
   You'd mastered 3/8 cards. Next card was about TLB."
  [Continue]

  Student clicks Continue. Back to flashcards instantly.
  45 seconds later, inline check: "What does TLB stand for?"

6:20-6:25 — Quiz on Chapter 3 (focus: 68%)
  5/7 correct. Weak on: page replacement, TLB.
  Agent notes: these concepts have prerequisites the student might
  be missing.

6:25 — Agent suggests break
  "You've been going for 25 minutes. Take 5?"
  [Take a break] [Keep going]
  Student clicks "Take a break" -> idle screen -> "I'm back" when ready.

6:30 — Student clicks "I'm back"
  Agent: "You've covered Chapter 3 (75% mastery). The 2 concepts you
  missed (Page Replacement, TLB) depend on understanding Virtual
  Memory Addressing — let me explain that before moving to Chapter 5."

  Shows a 2-minute micro-explanation of virtual memory addressing.
  Quick check question. Student gets it right.

6:35-6:50 — Chapter 5 in micro-learning mode (focus was low post-break)
  15-second concept cards with TTS.
  Student's focus gradually improves to 65%.
  State machine: transition to READING.

... continues ...

9:30 PM — Session ends

Session Report:
  Study time:           3.5 hours
  Focused time:         2 hours 20 min (67%)
  Distractions:         11 (avg 1.5 min each)
  Content modes:        Text (40%), Flashcards (25%), Quiz (20%), Micro (15%)
  Best focus format:    Quiz (avg 71% focus)
  Chapters covered:     3, 5, 7 (priority), 2, 4 (partial)
  Concept mastery:      34/52 concepts mastered (65%)
  Weak areas:           Page Replacement, Deadlock Detection, I/O Scheduling

  Compared to your last session:
    Focus duration improved:    +2 min avg streak
    Distractions reduced:       11 vs 14
    Quiz accuracy improved:     71% vs 62%

  Agent: "Review the 12 flashcards marked for reinforcement.
  Focus on Page Replacement and Deadlock Detection.
  You've got this."
```

---

## Key Design Principles for ADHD Users

1. **Frictionless return.** The #1 UX priority. Getting back to studying after a distraction must take under 3 seconds and one click. No guilt, no stats at re-entry, no comprehension quiz blocking the return. Recap ready instantly because it was prepared while they were away.

2. **Respect intentional breaks.** "Taking a break" is a valid choice. The system stops tracking, stops judging, and waits patiently. The student controls when they come back.

3. **Soft detection, not intrusive.** A gentle bottom bar ("Still there?") not a modal popup. If it's a false alarm (sneeze, looking at notes), one click and it's gone. The system should feel like a quiet presence, not a nagging parent.

4. **Micro-interventions before macro-switches.** A comprehension question or a TTS toggle is less disruptive than switching the entire content format. Reserve big switches for sustained low focus.

5. **Build tolerance, don't accommodate forever.** Start with short focus blocks and gradually extend. The goal is to improve attention span, not just work around it.

6. **No pressure, no deadlines, no countdowns.** The student already knows they have a test. They don't need the system reminding them. The system's job is to help them learn, not stress them out.

7. **Confront with data at the end, not during.** Distraction counts, focus patterns, session comparisons — show all of this in the session report AFTER the session. During the session, the only goal is to keep them studying.

8. **Accept limitations.** We can't detect phone usage or mental zoning out perfectly. Comprehension checkpoints are the ground truth. If the student passes them, they're learning — regardless of what the focus score says.

# Saffy — Development Log

A running record of Saffy's development progress and next steps.

---

## 17 August 2026 — Day 1

### Completed

- Set up the Saffy development environment.
- Created the Saffy mobile app using:
  - TypeScript
  - React Native
  - Expo
  - Expo Router
- Successfully launched Saffy on a physical iPhone using Expo Go.
- Replaced the default Expo screen with Saffy's Home screen.
- Built the initial Home/Dashboard:
  - "Time to learn!"
  - "Your topics will live here."
  - `+` button
- Created the Create Topic screen.
- Added working navigation:
  - Home → Create Topic
  - Create Topic → Home
- Added a Back button.

### Current App Flow

Home  
↓  
Create Topic  
↓  
Back to Home

### Current Screens

- `index.tsx` — Home
- `create-topic.tsx` — Create Topic

### Next

Build the Create Topic functionality:

1. Add topic name input.
2. Add Create Topic button.
3. Create Add Content screen.
4. Pass the new topic into the Add Content flow.

### Core Build Priority

Home → Create Topic → Add Content → Topic Summary → Recall → Feedback → Results → Test Again

Authentication, Supabase and cloud persistence come after the core learning loop is working.

---git --version

## 18 August 2026 — Day 2

### Completed

- Built Create Topic functionality.
- Added topic name input.
- Created Add Content screen.
- Added Question and Answer inputs.
- Added multiple prompt entry.
- Cursor now returns to the Question field after adding a prompt.
- Disabled autocorrect and automatic capitalisation for learning inputs.
- Added numbered prompt list.
- Added scrollable prompt list.
- Added minimum requirement of 10 prompts before Done is enabled.
- Added local prompt persistence using AsyncStorage.
- Added edit functionality:
  - Edit loads an existing prompt back into the fields.
  - Add button changes to Update.
  - Updated prompt stays in the same position.
  - Changes save locally.
- Created Topic Summary screen.
- Added scrollable Question / Answer table.
- Added Edit option from Topic Summary.
- Restored stable Home → Create Topic → Add Content → Topic Summary flow after fixing an accidental file overwrite.

### Current App Flow

Home  
↓  
Create Topic  
↓  
Add Content  
↓  
Add / Edit prompts  
↓  
Done after minimum 10 prompts  
↓  
Topic Summary

### Current Persistence

- Prompt lists are saved locally on the device using AsyncStorage.
- Saved prompts reload when returning to the same topic.
- User accounts and cloud persistence are not yet implemented.

### Next

1. Add Save Topic functionality.
2. Saved topic should appear on the Home dashboard.
3. Make saved topics reopenable from Home.
4. Then begin the Recall flow.

### Stable Checkpoint

The current build has a working topic creation and content-entry flow with local persistence and editing.

---

## 19 August 2026 — Lesson Answer Checking & Accepted Answers

### Completed

- Continued development of the lesson experience.
- Added automatic marking of submitted answers as correct or incorrect.
- Skipped answers are automatically marked as incorrect.
- Added immediate visual feedback after each answer:
  - ✓ Correct
  - ✕ Incorrect
  - Incorrect answers display the correct answer.
- Added a short pause after feedback before moving to the next prompt.
- Added confirmation when a user attempts to quit a lesson:
  - Keep Learning
  - Quit Lesson
- Lesson questions continue to appear in a random order.
- Keyboard automatically focuses when the next question appears.

### Flexible Answer Matching

Identified during real-world testing that strict exact matching was too restrictive.

Example:

- Question: `épingle`
- Stored answer: `a pin`
- User answer: `pin`

This should be considered correct even though it is not an exact string match.

Implemented answer normalisation so Saffy now:

- Ignores capitalisation.
- Ignores leading/trailing whitespace.
- Normalises multiple spaces.
- Ignores leading English articles:
  - `a`
  - `an`
  - `the`

Examples:

- `a pin` / `pin` → correct
- `a wart` / `wart` → correct
- `the book` / `book` → correct
- `Book` / `book` → correct

French articles are deliberately NOT removed because grammatical gender may be part of what the learner needs to recall.

### "Also Accept" Answers

Added optional alternative accepted answers to prompts.

Example:

- Question: `épais`
- Answer: `thick`
- Also accept: `dense, heavy`

Prompt data structure now supports:

```ts
{
  question: string;
  answer: string;
  acceptedAnswers: string[];
}

## 20 August 2026 — Results, Persistent Learning State & Targeted Lessons

### Completed

- Built the first Results screen.
- Lesson now automatically navigates to Results after the final prompt.
- Results displays:
  - Overall score.
  - Correct and incorrect answers.
  - Skipped answers.
  - Correct answer beneath incorrect/skipped responses.
- Automatically separates lesson results based on performance:
  - Incorrect / skipped → Review.
  - Correct → previously Recall, now renamed Banked.

### Results UX

Updated Results to better support larger lessons.

- Reworked Results to more closely match the original Saffy wireframe.
- Added compact Question / Your Answer layout.
- Added score prominently near the top.
- Added expandable sections:
  - Your Answers
  - Review
  - Banked / previously Recall
- All expandable sections start collapsed.
- This prevents very large lessons (e.g. 100 prompts) from creating an excessively long initial Results screen.
- Review and Banked sections display the actual prompt questions rather than only a count.

### Persistent Learning State

Added local persistence for lesson outcomes using AsyncStorage.

Saffy currently saves:

- Latest Review pile.
- Latest stronger-memory pile.
- Latest lesson results.
- Timestamp of the most recently completed lesson.

Current storage is topic-based and local to the device.

This is an interim MVP architecture and is expected to evolve into persistent per-prompt learning state.

### Lesson Preview Improvements

Updated Lesson Preview so that:

- Prompt list is expandable and collapsed by default.
- Edit sits directly beneath the Prompts section.
- Tapping Edit automatically expands the prompt list.
- Review and stronger-memory counts are displayed after the first completed lesson.
- Latest lesson timestamp can be displayed.
- Review and stronger-memory cards are tappable.
- Tapping a pile opens a modal preview showing the prompts inside it.
- Each modal includes a button to start a lesson using only that pile.
- Existing lesson logic is reused for targeted lessons.

Known UI polish item:
- Review/Banked modal close animation can appear slightly glitchy.
- Lesson Preview currently feels slightly compressed vertically around the learning-state controls.
- Both are deferred until the dedicated UI polish pass.

### Targeted Follow-up Lessons

Saffy can now run:

Full Topic Lesson
→ Results
→ Review / Banked classification
→ Exit Classroom
→ Reopen Topic
→ Preview Review or Banked pile
→ Start targeted lesson using only that pile

This is the first functioning adaptive follow-up loop.

### Answer Matching

Current deterministic answer matching supports:

- Primary answer.
- User-defined "Also accept" alternatives.
- Case-insensitive matching.
- Leading/trailing whitespace removal.
- Repeated-space normalisation.
- Ignoring leading English articles:
  - a
  - an
  - the
- French articles are deliberately preserved.

Skipped answers remain incorrect.

### Learning Model Discussion

Revisited the proposed rule that a Review prompt would require four spaced correct answers before moving to the stronger-memory pile.

Decision: do not implement this arbitrary threshold yet.

Research into Anki / FSRS highlighted a stronger model:

- Memory strength is continuous rather than based on a fixed number of successes.
- Successful retrieval after meaningful time has passed increases memory stability.
- Forgetting decreases stability and increases difficulty.
- The scheduler determines when a prompt should next be reviewed based on estimated retrievability.

FSRS is now being seriously considered for the Saffy MVP rather than introducing a temporary custom 4-success algorithm.

Potential mapping discussed:

Wrong / Skip
→ FSRS "Again"

Correct
→ FSRS "Good"

Saffy would handle the scheduling automatically rather than asking users to self-grade recall.

### Terminology

Changed the proposed stronger-memory pile terminology:

Review → Banked

Reason:
"Recall" was too similar to "Review" and felt technical.

"Banked" supports Saffy's Memory Bank metaphor and communicates that knowledge has been successfully retained without implying permanent mastery.

Potential progress language:

Review
→ "Depositing"
→ Banked

"Depositing" would describe memory strengthening within Review and would NOT become a third pile.

A Banked prompt that is subsequently answered incorrectly or skipped should move back to Review.

### Future Recall Modes

Logged as Post-MVP / Roadmap:

- Multiple choice.
- Self-assessed recall.
- AI-evaluated free-text recall.
- AI-evaluated spoken/voice recall.

This is particularly relevant for learners such as medical students who need to recall larger conceptual answers that are unsuitable for strict typed matching.

### Next Development Decision

Before further learning-engine development:

1. Define how Saffy should use FSRS.
2. Decide what user-facing "Banked" means when memory strength is continuous.
3. Decide how scheduled vs voluntary practice affects memory state.
4. Decide how much memory-strength information should be exposed visually.
5. Define the persistent per-prompt data model.
6. Only then implement the scheduler.

No FSRS implementation has been started yet.

### Current Core Flow

Home
→ Create Topic
→ Add minimum 10 prompts
→ Lesson Preview
→ Edit / Also Accept
→ Full Lesson
→ 3-2-1 countdown
→ Randomised typed recall
→ Immediate feedback
→ Results
→ Review / Banked classification
→ Persistent learning state
→ Reopen Topic
→ Preview pile
→ Targeted follow-up lesson

### Current Status

The first end-to-end adaptive Saffy learning loop is now functional locally.

The next major architectural milestone is replacing simple latest-result pile logic with a persistent per-prompt memory model, potentially powered by FSRS.
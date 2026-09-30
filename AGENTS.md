
# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

---

# Saffy

Saffy is a mobile-first recall-learning app designed to help learners retain
knowledge over time through evidence-led retrieval practice.

# AGENTS.md

# Saffy

Saffy is a mobile-first recall-learning app designed to help learners retain
knowledge over time through evidence-led retrieval practice.

The current application is built with:

- TypeScript
- React Native
- Expo
- Expo Router
- AsyncStorage
- ts-fsrs

The project is currently an MVP under active development.


## 1. Sources of Truth

Before making product-related changes, read:

1. `PRODUCT_SPEC.md`
2. `DECISION_LOG.md`
3. `DEV_LOG.md`

These documents serve different purposes.

### PRODUCT_SPEC.md

Defines Saffy's current intended product behaviour.

This is the primary source of truth for how Saffy should behave.

A feature appearing in the Product Spec does not necessarily mean it has
already been implemented.


### DECISION_LOG.md

Records product decisions and the reasoning behind them.

It contains historical decisions as well as current ones.

Some older decisions have been superseded.

Do not implement an older decision if a newer decision or the current
Product Spec supersedes it.


### DEV_LOG.md

Records implementation progress and technical changes.

Use this to understand what has actually been built.

Do not assume that every feature described in `PRODUCT_SPEC.md` has already
been implemented.


## 2. Do Not Invent Product Decisions

If `PRODUCT_SPEC.md` marks something as:

- OPEN
- UNDECIDED
- requiring research
- not yet determined

do not choose a product behaviour simply to complete the implementation.

Stop and explain what decision is required.

Do not silently select a default.


## 3. Protect Saffy's Learning Model

Saffy's learning system is central to the product.

Do not change memory-state logic, FSRS configuration, scheduling behaviour,
answer-to-rating mapping or review behaviour unless the task explicitly
requires it and the change is consistent with the Product Spec.

Current high-level principles include:

- FSRS owns memory scheduling.
- Saffy determines the user experience around that schedule.
- Each memory has its own FSRS state and due date.
- Correct recall currently maps to FSRS Good.
- Incorrect and skipped recall currently map to FSRS Again.
- Short-term FSRS learning/relearning is disabled for the MVP.
- Incorrect memories are not automatically repeated within the same lesson.
- A correct answer does not remove a memory from future learning.
- Memory history must not be erased when a user-facing memory state moves
  backwards.
- Banked does not mean permanently learned.

Do not introduce arbitrary mastery rules such as a fixed number of correct
answers.


## 4. Memory States

Saffy's user-facing memory lifecycle is:

Seeded → Depositing → Banked

These states are not substitutes for the underlying FSRS data.

The exact threshold for Depositing → Banked is currently OPEN.

Do not implement a Banked threshold until the product decision has been made.


## 5. Lesson Rules

A lesson must contain prompts from one topic only.

Do not mix prompts from different topics within the same lesson.

Recommended lessons are generated from memories that FSRS determines are due.

The MVP recommended lesson size is 10 memories.

Learners may choose:

- 5
- 10
- 15
- 20
- All due

If more memories are due within a topic than the selected lesson size, the
method used to select which due memories should enter the lesson is currently
OPEN.

Do not invent this selection algorithm.


## 6. Learner Control

Core product principle:

**Saffy recommends. The learner decides.**

Saffy should guide learners towards useful practice without unnecessarily
restricting them.

Users should retain the ability to practise material manually, including
material that is not currently due.


## 7. Data Safety

The MVP currently stores user learning data locally using AsyncStorage.

When modifying data structures:

- Preserve existing stored learning data where reasonably possible.
- Do not silently reset user progress.
- Do not delete FSRS history.
- Do not replace persistent IDs unnecessarily.
- Consider backwards compatibility when changing stored objects.

If a proposed change could invalidate existing stored learning data, flag
this before implementing it.


## 8. Coding Approach

Prefer simple, readable TypeScript over unnecessary abstraction.

Follow the existing project structure and conventions unless there is a
clear reason to change them.

Before creating a new utility, component or data model, check whether the
project already contains an appropriate implementation.

Avoid large architectural rewrites unless explicitly requested.

Do not add dependencies unless they provide a clear benefit.

Do not introduce backend infrastructure, authentication or Supabase simply
because they appear in the longer-term stack. The current MVP intentionally
uses local storage while the core learning experience is validated.


## 9. Scope Discipline

Implement the requested task, not adjacent speculative features.

Do not turn a small feature request into a broad redesign.

If you notice an unrelated issue:

- mention it,
- explain its significance briefly,
- but do not change it unless it is necessary for the requested task or
  explicitly approved.


## 10. Testing and Validation

After making code changes:

- run appropriate TypeScript/lint checks available in the project,
- inspect relevant errors,
- fix errors caused by the change,
- report what was tested.

Do not claim something works if it has not been tested.

Where behaviour requires testing on the physical Expo app, state what Sabah
should test manually.


## 11. Communicating Changes

After completing a task, provide a concise summary of:

- what changed,
- which files changed,
- checks/tests performed,
- any remaining manual testing,
- any assumptions made,
- any product decisions that remain OPEN.

Do not hide uncertainty.


## 12. Founder Decisions

Product decisions belong to Sabah.

The coding agent may:

- identify product questions,
- explain technical trade-offs,
- propose options,
- recommend technically appropriate approaches when asked.

The coding agent must not silently turn an unresolved product question into
a permanent product decision.

When product intent is unclear, preserve the current behaviour where safe
and surface the question for decision.


## 13. Current Development Philosophy

Saffy is still validating its core learning experience.

Prioritise:

- correctness,
- learning logic,
- understandable architecture,
- fast iteration,
- preservation of learning data.

Do not optimise prematurely for scale or introduce production complexity
that the current MVP does not require.
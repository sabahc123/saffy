# Saffy Product Specification

This document describes how Saffy should behave as a product.

It defines the current product logic, not the technical implementation.
Anything that has not yet been decided should be marked OPEN rather than
implemented based on an assumption.

---

# 1. Definitions

## Seeded 🌱

Knowledge that has entered Saffy's learning cycle but has not yet been
successfully recalled.

All new prompts begin as Seeded.

A correct retrieval moves the prompt to Depositing.

---

## Depositing

Knowledge that has been successfully recalled at least once, but which Saffy is still
testing over time to establish whether it will stick.

A prompt can remain Depositing while Saffy tests it at increasingly meaningful
intervals.

Depositing does not mean mastered.

---

## Banked

Knowledge for which Saffy has strong evidence of durable retention.

Banked replaces the concept of "Mastered".

Banked does not mean permanently learned. Banked memories should still be
tested when Saffy determines they are due.

---

## Retrievability

The estimated probability that a learner could successfully recall a memory
right now.

Retrievability is NOT a percentage of how well something has been learned.

---

## Stability

A measure of how durable a memory has become over time.

Stability is currently the main candidate for determining when a Depositing
memory becomes Banked.

The exact Banked threshold is still being researched.

---

## Difficulty

A measure of how difficult an individual memory appears to be for that
individual learner.

Different prompts can therefore develop different learning schedules.

---

# 2. Memory Lifecycle

The user-facing memory lifecycle is:

Seeded → Depositing → Banked

Saffy uses FSRS underneath these simple states to track each individual
memory over time.

## New prompts

All newly created prompts begin as Seeded.

Writing or creating a prompt may itself contribute to learning, but Saffy
does not treat creation alone as evidence of successful recall.

## First retrieval

Seeded + incorrect → remains Seeded

Seeded + skipped → remains Seeded

Seeded + correct → Depositing

One successful retrieval is enough to enter Depositing because Depositing
does not claim that the memory is established. It simply means Saffy now has
evidence that the learner can retrieve it.

## Depositing

Saffy continues testing Depositing memories at appropriate intervals.

There is no arbitrary rule such as:

- Correct four times
- Reach 80%
- Practise for seven days

The timing and outcome of retrievals matter.

FSRS should determine how the memory develops based on its individual
Difficulty, Stability and Retrievability.

## Depositing → Banked

OPEN:

We have not yet determined the evidence required for a memory to become
Banked.

Current hypothesis:

The transition should primarily reflect sufficient memory Stability rather
than a fixed number of correct answers or a Retrievability percentage.

This must be researched before implementation.

BANKED_THRESHOLD = UNDECIDED

## Forgetting a Banked memory

Banked does not mean permanent.

If a Banked memory is later forgotten, Saffy should respond to the new
evidence without erasing its previous learning history.

Current hypothesis:

Banked + failed retrieval → Depositing

FSRS should recalculate the memory state and future schedule following the
lapse.

Exact behaviour remains OPEN until FSRS implementation is researched.

---

# 3. Scheduling Principles

Saffy's goal is not to maximise the number of reviews.

Saffy's goal is to bring memories back at useful times so that they become
increasingly durable without unnecessary repetition.

Saffy determines what is due.
The learner does not need to manage their own spaced-repetition schedule.

## Early reviews

More reviewing does not automatically mean more learning.

If a user chooses to practise something significantly earlier than Saffy
recommends, Saffy should explain that appropriately spaced retrieval is more
useful for long-term retention.

Saffy should NOT prevent the learner from continuing.

Example:

"These memories aren't due just yet.

Saffy recommends waiting a little longer. Giving your memory time between
recalls makes the next retrieval more useful for long-term retention."

Actions:

- Practise anyway
- Come back when they're due

OPEN:

Research how an early voluntary review should affect the underlying FSRS
schedule.

---

# 4. Learner Control

Core principle:

Saffy recommends. The learner decides.

Saffy should recommend what the learner needs to practise, but users should
still be able to:

- Follow Saffy's recommended lesson
- Choose an individual topic
- View Seeded, Depositing and Banked prompts
- Start a full lesson
- Practise material before it is due

Saffy should educate rather than restrict.

---

# 5. Open Product Ideas

## Initial familiarity rating

Potential future feature.

When adding material, users could rate how well they believe they already
know it once:

- New to me
- A little familiar
- Know it fairly well
- Know it very well

This would NOT determine the prompt's memory state.

Observed retrieval should take precedence over self-assessment.

One potential use is showing learners the difference between perceived
knowledge and demonstrated recall.

MVP STATUS: UNDECIDED

## Help Me Remember This

At MVP, users can add their own memory cues to individual prompts to help them
recall information they are finding difficult to remember.

Post-MVP, AI can suggest personalised memory cues, techniques or associations
which the user can choose to save against individual prompts.


## Cram / Exam Mode

This is Post MVP

A future mode may allow a learner to provide an exam or deadline.

Saffy could then optimise for near-term recall rather than its normal
long-term retention objective.

Learning goals may eventually exist at topic level because different topics
may have different objectives.

MVP STATUS: EXCLUDED

---

# 7. Core Learning Principle

Saffy should be evidence-led.

Saffy does not assume:

repetition = learning

or:

correct once = mastered

Instead, Saffy observes how each individual memory behaves over time and
uses that evidence to decide what the learner needs next.

Give Saffy what you need to know.
Saffy learns what you're likely to forget.
Saffy brings it back when your memory needs it.
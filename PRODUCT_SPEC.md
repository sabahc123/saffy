# Saffy Product Specification

This document defines how Saffy should behave as a product.

It describes current intended product behaviour, not technical implementation.

If a product behaviour has not yet been decided, it must be marked **OPEN**.
An OPEN question must not be implemented based on assumption.

A product decision being specified here does not necessarily mean it has
already been built. Refer to `DEV_LOG.md` for implementation status.


---

# 1. Product Purpose

Saffy is a recall-focused learning app designed to help learners remember
information over time.

The learner gives Saffy what they need to know.

Saffy observes how successfully each individual memory is recalled, learns
what the learner is likely to forget, and brings memories back at useful times.

Saffy's objective is not to maximise repetition.

Its objective is to strengthen long-term retention through appropriately
timed retrieval practice.


---

# 2. Core Learning Principle

Saffy should be evidence-led.

Saffy does not assume:

repetition = learning

or:

correct once = mastered

Instead, Saffy observes how each individual memory behaves over time and
uses that evidence to decide what the learner needs next.

Observed retrieval should take precedence over self-assessment.

Core principle:

**Saffy recommends. The learner decides.**


---

# 3. Definitions

## Prompt

A question-and-answer pair that the learner wants to remember.

Each prompt is treated as an individual memory and develops its own learning
history and schedule.


## Seeded 🌱

Knowledge that has entered Saffy's learning cycle but has not yet been
successfully recalled.

All new prompts begin as Seeded.

A correct retrieval moves the prompt to Depositing.


## Depositing

Knowledge that has been successfully recalled at least once, but which Saffy
is still testing over time to establish whether it will stick.

A prompt can remain Depositing while Saffy tests it at increasingly meaningful
intervals.

Depositing does not mean mastered.


## Banked

Knowledge for which Saffy has strong evidence of durable retention.

Banked replaces the earlier concept of "Mastered" as Saffy's user-facing
memory state.

Banked does not mean permanently learned.

Banked memories should still be tested when Saffy determines they are due.


## Due

A memory is due when its scheduled review time has been reached.

FSRS determines when an individual memory becomes due.


## Retrievability

The estimated probability that a learner could successfully recall a memory
right now.

Retrievability is NOT a percentage of how well something has been learned.


## Stability

A measure of how durable a memory has become over time.

Stability is currently the main candidate for determining when a Depositing
memory becomes Banked.

The exact Banked threshold is still being researched.


## Difficulty

A measure of how difficult an individual memory appears to be for that
individual learner.

Different prompts can therefore develop different learning schedules.


---

# 4. Memory Lifecycle

The user-facing memory lifecycle is:

**Seeded → Depositing → Banked**

Memories can move both forwards and backwards as Saffy gathers new evidence
about the learner's ability to recall them.

Saffy uses FSRS underneath these simple user-facing states to track and
schedule each individual memory.


## New prompts

All newly created prompts begin as Seeded.

Writing or creating a prompt may itself contribute to learning, but Saffy
does not treat creation alone as evidence of successful recall.


## Seeded memories

Seeded + correct → Depositing

Seeded + incorrect → Seeded

Seeded + skipped → Seeded

One successful retrieval is enough to enter Depositing because Depositing
does not claim that the memory is established.

It means Saffy now has evidence that the learner can retrieve it.


## Depositing memories

Depositing + correct → Depositing

Depositing + incorrect → Seeded

Depositing + skipped → Seeded

Saffy continues testing Depositing memories at appropriate intervals.

There is no arbitrary rule such as:

- Correct four times
- Reach 80%
- Practise for seven days

The timing and outcome of retrievals matter.

FSRS should determine how the memory develops based on its individual
Difficulty, Stability and Retrievability.


## Depositing → Banked

**OPEN**

We have not yet determined the evidence required for a memory to become
Banked.

Current hypothesis:

The transition should primarily reflect sufficient memory Stability rather
than a fixed number of correct answers or a Retrievability percentage.

This must be researched before implementation.

`BANKED_THRESHOLD = UNDECIDED`


## Banked memories

Banked + correct → Banked

Banked + incorrect → Depositing

Banked + skipped → Depositing

Banked does not mean permanent.

If a Banked memory is later forgotten, Saffy responds to the new evidence
without erasing its previous learning history.

Moving backwards between memory states never resets the memory's historical
learning data.


---

# 5. Scheduling

Saffy uses FSRS to determine when individual memories should be reviewed.

FSRS is the scheduling engine underneath Saffy's user-facing learning
experience.

The learner should not need to understand or manage FSRS.


## Answer mapping

For the current MVP:

Correct answer → FSRS Good

Incorrect answer → FSRS Again

Skipped answer → FSRS Again

The learner does not manually choose an FSRS rating.


## Short-term scheduling

FSRS short-term learning steps are currently disabled.

Saffy does not automatically repeat an incorrectly answered memory a few
minutes later simply to produce an immediate correct response.


## Incorrect answers during a lesson

Incorrect or skipped memories are not automatically repeated within the same
lesson.

Saffy records the failed retrieval, updates the memory's state and learning
history, and allows FSRS to determine when the memory should next be tested.

The learner does not need to immediately answer an incorrect memory correctly
in order to complete a lesson.

## Results Screen

The Results screen represents the lesson that has just been completed.

It is not a cumulative learning dashboard and should refresh after each lesson.

The Results screen should show four things:

### Lesson score

Show the learner's performance in the lesson.

For example:

8 / 10

80%

The score reflects performance in this lesson only. It is not a measure of
memory strength, mastery or long-term retention.


### Answer breakdown

The learner should be able to review which prompts they answered:

- Correctly
- Incorrectly
- Skipped

Where relevant, Saffy should show:

- The prompt
- The learner's answer
- The correct answer

This section describes what happened during the lesson. It should not be used
as the learner's underlying memory state.


### Memory changes

Saffy should show when a prompt's user-facing memory state changed as a result
of the lesson.

Examples:

Seeded → Depositing

Depositing → Seeded

Banked → Depositing

This helps the learner understand how retrieval performance affects Saffy's
assessment of their memory over time.

A prompt does not need to change user-facing memory state for the retrieval
to have affected its underlying FSRS data or future schedule.

Saffy does not need to expose technical FSRS values such as Stability,
Difficulty or Retrievability on the Results screen in the MVP.


### Current memory state

The learner should be able to see the current memory state of the prompts
tested in that lesson:

- Seeded
- Depositing
- Banked

This is distinct from whether the learner answered the prompt correctly or
incorrectly in the lesson.

For example, a Depositing memory may be recalled correctly and remain
Depositing while its underlying FSRS history and future schedule are updated.


### Results are lesson-specific

The Results screen changes after every lesson.

It describes:

1. What happened in this lesson
2. What changed because of this lesson
3. Where the tested memories sit now

Longer-term or cumulative learning analytics may be surfaced elsewhere in
Saffy in future.

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

**OPEN**

Research how an early voluntary review should affect the underlying FSRS
schedule.


---

# 6. Lessons

Saffy supports a distinction between recommended learning and learner-chosen
practice.


## Topic separation

A lesson contains memories from one topic only.

Saffy must not mix prompts from different topics within the same lesson.

This applies even when memories from several different topics are due at the
same time.

For example, if a learner has due memories in both Italian Vocabulary and
Arabic Vocabulary, Saffy should not combine those memories into a single
lesson.

Each topic retains its own lesson context.


## Recommended lessons

Saffy's recommended lessons should be generated from memories that FSRS
determines are due.

Recommendations should respect topic boundaries.

If memories are due across multiple topics, Saffy may surface that multiple
topics require attention, but each lesson should contain memories from only
one topic.

The learner can therefore complete recommended learning one topic at a time.


## Lesson size

Having a large number of due memories within a topic should not automatically
create an extremely long lesson.

Saffy should recommend a sensible default lesson size.

For the MVP, the recommended default is:

**10 memories**

The learner should also be able to choose:

- 5
- 10
- 15
- 20
- All due

If fewer memories are due within the selected topic than the selected lesson
size, Saffy should use the available due memories rather than requiring the
selected number.


## Selecting memories for a recommended lesson

**OPEN**

When the number of due memories within a topic exceeds the selected lesson
size, the exact method Saffy should use to choose which due memories enter
the lesson has not yet been finalised.

This must not be resolved by arbitrary implementation.


## Full lesson

A learner should also be able to choose an individual topic and practise its
material rather than only following Saffy's recommended lesson.

A full lesson may test all prompts in the selected topic.

This is separate from Saffy's recommended due-memory lesson.


## Lesson order

Prompts within a lesson should not always appear in the same predictable
order.

The current MVP randomises lesson prompts.


---

# 7. Answer Evaluation

Saffy should determine whether a learner successfully recalled the expected
answer.

Each prompt has:

- A primary correct answer
- Optional alternative accepted answers

Alternative accepted answers allow the learner to specify other responses
that should count as correct.

For the current MVP, answer evaluation is deterministic rather than
AI-generated.

Saffy should tolerate simple formatting differences that do not change the
meaning of the answer, according to the current implemented answer
normalisation rules.

AI-based semantic answer evaluation is not part of the current MVP unless
separately specified.


---

# 8. Learner Control

Saffy recommends. The learner decides.

Saffy should recommend what the learner needs to practise, while still
allowing the learner to take control of their learning.

Users should be able to:

- Follow Saffy's recommended learning
- Choose an individual topic
- View Seeded, Depositing and Banked prompts
- Start a full lesson
- Practise material before it is due
- Choose the size of a recommended lesson

Recommended learning should respect topic boundaries rather than mixing
different topics into one lesson.

Saffy should educate rather than restrict.


---

# 9. Topic and Prompt Creation

Users create topics containing question-and-answer prompts.

The current MVP uses manual prompt creation.

A topic requires a minimum of 10 prompts before the learner can proceed with
the normal learning flow.

Each new prompt begins as Seeded.

Users may provide alternative accepted answers for individual prompts.


## Adding prompts to an existing topic

Adding new prompts to an existing topic is intended product behaviour.

**IMPLEMENTATION STATUS:** Not yet built.


## Content upload / AI extraction

The ability to upload learning material and have Saffy automatically create
prompts is a potential future feature.

**MVP STATUS: OPEN unless subsequently decided in the Decision Log.**


---

# 10. Help Me Remember This

At MVP, users can add their own memory cues to individual prompts to help them
recall information they are finding difficult to remember.

Post-MVP, AI may suggest personalised memory cues, techniques or associations
which the user can choose to save against individual prompts.

AI-generated memory cues should not replace retrieval practice.


---

# 11. Visual Representation of Memory Progress

Saffy may use a numerical or visual indicator to help learners understand
the relative strength of individual memories.

The indicator should reflect a memory's learning history and underlying
memory evidence rather than simply the percentage of questions answered
correctly.

The methodology for calculating this indicator is:

**OPEN**

Although "Seeded" is used as a memory state, Saffy should avoid literal
plant-growing or watering mechanics.

The visual representation of memory progress should have its own distinct
identity.


---

# 12. Initial Familiarity Rating

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

**MVP STATUS: UNDECIDED**


---

# 13. Cram / Exam Mode

Cram / Exam Mode is Post-MVP.

A future mode may allow a learner to provide an exam or deadline.

Saffy could then optimise for near-term recall rather than its normal
long-term retention objective.

Learning goals may eventually exist at topic level because different topics
may have different objectives.

**MVP STATUS: EXCLUDED**


---

# 14. Product Rules for Unresolved Behaviour

Where this specification says OPEN, UNDECIDED or requires further research:

**Do not invent a product decision in order to complete an implementation.**

The question should remain unresolved until a product decision is made.

Technical implementation should follow product behaviour, not determine it.


---

# 15. Source of Truth

This document describes Saffy's current intended product behaviour.

`DECISION_LOG.md` records the history and reasoning behind product decisions.

Later decisions may supersede earlier decisions in the Decision Log.

`DEV_LOG.md` records what has actually been implemented.

A feature appearing in this Product Specification does not necessarily mean
that feature has already been built.

If an older Decision Log entry conflicts with the current Product
Specification, the current Product Specification takes precedence unless a
newer explicit decision says otherwise.
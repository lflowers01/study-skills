# Subject profiles

Pick by what the exam actually asks for, not by department. Read the objectives sheet: verbs like *calculate, convert, determine* mean generators; *explain, identify, describe* mean a concept bank; *derive, prove, construct* mean neither.

## A. Calculation-heavy (chemistry, physics, calculus, statics, circuits)

Full build. Each recurring calculation becomes one generator with randomized quantities.

- Randomize over a **bank of realistic entities** (compounds, reactions, functions), not just numbers — otherwise every problem reads the same.
- Distractors come from the actual error modes: skipped a coefficient, inverted a ratio, used diameter for radius, forgot to convert units, dropped a negative, wrong sig figs.
- Put the arithmetic in small pure helper functions (`calc.*`) so `test.js` can check them against the sample exam's published answers. **This is the highest-value part of the whole build.**
- Watch: floating-point formatting collisions (two options rendering identically — `mc()` drops those), impossible randomized combinations (a reaction that can't happen, a negative mass), and quantities that make the answer trivially guessable.
- Math-specific: for symbolic answers, generate the problem *from* the answer (pick the factored form, expand it) so the key is exact. Render with MathML or plain HTML sub/sup; don't add a LaTeX dependency for a handful of expressions.

## B. Concept / vocabulary heavy (biology, intro psych, anatomy, business, terminology units)

Generators mostly don't apply — there's nothing to randomize. Instead:

- Write a **large curated concept bank** (aim for 15+ per unit, or repeats show up fast) in the `[unit, loId, question, correct, ...wrong]` shape that `conceptGen` consumes.
- Lean hard on flashcards: definitions, classifications, sequences, which-belongs-to-which.
- Distractors must be the neighbouring concept (the one students confuse it with), not an obviously wrong option.
- Where a process has ordered steps, ask "what comes after X" and "what happens if step N fails".

## C. Proof / derivation (real analysis, discrete math, theory courses)

MC drilling is a poor fit and pretending otherwise wastes the user's time. Build: objectives tracker, flashcards for definitions and theorem statements (which are genuinely memorization), a checklist of assigned proofs to work on paper, and MC only where it honestly fits (counterexamples, "which hypothesis fails", spotting the invalid step). **Tell the user why** the practice tab is thin.

## D. Performance / production (speech, writing, design, labs)

No question bank. Build a rubric checklist from the assignment sheet, a deadline tracker, and cards for any graded terminology. Say plainly that practice questions don't apply, and point at the rubric. Don't manufacture MC to fill the shell.

## Mixed exams

Common: a numeric course with a conceptual section, or a concept course with a few calculations. Use profile A for the numeric units and B for the conceptual ones — the `GENS` registry mixes both freely, and the mock exam blueprint reproduces the real proportions.

## Format matching

The mock exam must match the real exam's format, which the exam-information sheet states. If the real exam has free response, the tool's MC-only mock is a partial rehearsal — say so, and steer the user to the assigned textbook/homework problems for the written half. Don't add AI grading of typed answers for an all-MC exam; it costs money and rehearses a format that won't be tested. If written answers do matter, prefer deterministic numeric checking (value within tolerance + sig figs) over model grading.

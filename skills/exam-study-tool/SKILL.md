---
name: exam-study-tool
description: Build a personal exam study website for one of the user's college courses — pulls the course's own materials from Brightspace (syllabus, learning objectives, sample exams, announcements), then generates a local practice site with randomized practice questions, a timed mock exam matching the real exam's format, flashcards, an objectives tracker, missed/flagged queues, and assigned textbook problems. Use when the user asks to study for an exam, prepare for a test or quiz, wants a study tool/site/app/tracker for a course, mentions an upcoming exam in a specific course (CHM, MA, PHYS, ENGR, COM …), or asks to update/extend a study tool built earlier.
---

# Exam study tool builder

Build a static, offline study site for one specific exam, driven by that course's **own** stated objectives.

**Non-negotiable:** every question comes from the course's real materials (objectives sheet, sample exam, homework, textbook sections). Never invent exam scope. If a source is missing, say so rather than guessing.

**Study design (why the tool looks like this):** practice testing and distributed practice are the two highest-utility techniques (Dunlosky 2013; Hattie & Donoghue 2021). Rereading and highlighting are low-utility, so the tool contains **no reading content** — only retrieval, feedback, and spacing.

## Where it goes

`Desktop\<COURSE>\study-tool\` (e.g. `Desktop\CHM11510\study-tool\`), with downloaded course PDFs in the parent `Desktop\<COURSE>\`. One folder per course; a second exam in the same course reuses the folder (new `config.js` key, e.g. `chm11510-exam2-v1`, so exam 1 progress is untouched).

## Steps

### 1. Gather (always, before writing code)
- `mcp__brightspace__get_my_courses` → find the course id. Then `get_syllabus`, `get_course_content` (maxDepth 2 first; the full tree is huge — grep the saved tool-result file instead of re-fetching), `get_announcements`, `get_upcoming_due_dates`.
- Find and download, into `Desktop\<COURSE>\`: the **learning objectives** sheet, the **sample/practice exam** (plus its key), the **formula/reference sheet** given at the exam, and the **exam information** sheet. These four decide everything.
- Read them and extract, explicitly: exam **date/time**, **question count and format** (MC? free response? both?), **units/lectures covered**, **what's provided at the exam** (so those facts become flashcards only if NOT provided), **what must be memorized**.
- Ask the user for the textbook PDF if the objectives reference textbook problems. Confirm the **edition matches** the course's — section and problem numbers shift between editions, and a mismatch silently poisons every page reference.
- See `references/pipeline.md` for the Brightspace and PDF gotchas (they will bite otherwise).

### 2. Confirm scope with the user
State back in one short block: exam date, format, units, and what you'll build. Ask only if something material is missing or contradictory (e.g. objectives list sections the syllabus doesn't). Then build.

### 3. Pick the subject profile
Read `references/subject-profiles.md`. Briefly: calculation-heavy courses get randomized numeric generators; concept/vocabulary courses get a large curated concept bank plus heavier flashcards; proof/derivation and performance courses (speech, writing) can't be drilled by MC — build the objectives tracker, cards and a rubric checklist instead, and say plainly that MC drilling doesn't fit.

### 4. Build
Copy `template/` into the study-tool folder: `index.html`, `app.js`, `gen-lib.js`, `test.js`, and `config.example.js` → `config.js`.
- **`config.js`** — course name, `key` (localStorage id), unit names, exam date/format/blueprint, day-by-day plan up to exam day, optional book map, and the **`study` map** (below). The mock exam `blueprint` must mirror the real exam's question mix (count them in the sample exam).
- **`study` map (per objective)** — powers the post-mock button. For every objective that has a generator, write `tip` (the usual mistake + its fix), plus `sp` / `book` pointers if the course has them. Derive tips from your generators' distractors: each wrong option already encodes a real mistake, so the tip is that mistake stated as a rule. Objectives without an entry fall back to the unit's reading and sample problems, so partial coverage still works. Validate that every key is a real objective id.
- **`gen.js`** — the course's own file: data, generators, `LOS` (every objective from the sheet, verbatim-ish, with stable ids `L<unit><c|s><n>`), `CARDS`, `GENS` registry. Loads `gen-lib.js` for `mc`/`mcs`/`P`/`L`/`makeProblemFactory`/`conceptGen`. Must export `window.GEN = {LOS, GENS, makeProblem, CARDS}`.
- **`book.js`** (optional) — assigned textbook problems via `scripts/extract_problems.py`.
- **`SPEC.md`** — see `template/SPEC.example.md`. Write it *before* the code: it forces the exam blueprint and the evidence base to be explicit.

**Question quality rules** (this is what makes it worth using):
- Distractors are the **actual mistakes students make** — forgot to divide by the coefficient, used the wrong molar mass, swapped the ratio, wrong sig figs. Never random numbers; a student who reasons correctly must not be able to eliminate their way to the answer.
- Every problem carries `steps`: the worked solution shown after answering.
- Every problem maps to ≥1 real objective id.
- Anything the exam *provides* (formula sheet, periodic table) is not a flashcard. Anything it explicitly says to memorize **is**.

### 5. Verify (never skip)
- `node test.js` — must pass. It checks every generator over 400 draws for a unique correct answer, no `NaN`/`undefined`, valid objective ids, and objective coverage. **Add course truth checks**: recompute answers from the real sample exam with the tool's own helper functions. That is what catches a wrong formula; option-shape checks never will.
- Hand-verify 2–3 generated problems yourself, start to finish.
- Open it in the browser and click every tab (see `references/pipeline.md` for the browser options and their traps).
- **Snapshot before you drive the UI, restore after — never blind-wipe.** `sessionStorage.setItem('snap', localStorage.getItem(<key>) || '')` first; afterwards restore it (or remove the key if it was empty). Before removing anything, read `exams`/`flag`/`missed` and confirm they are only your test data. See `references/pipeline.md`.
- Exercise the results flow too: take a mock with deliberately wrong answers, click **Add what I need to study**, and check the items, the details, and that a second mock updates rather than duplicates.

### 6. Results → To study (built into the shell)
After a mock exam, the results screen has **➕ Add what I need to study to my list**. It works offline with no API key: for each objective the student missed it adds one item to the To study tab — objective, "missed 2 of 3", the `study[obj].tip`, reading/sample/book pointers, and a collapsed copy of a question they missed with its worked solution. One item per objective; re-missing it later un-ticks it. Items live in `S.auto` in localStorage.

There is also **Copy results for Claude**, which puts the whole mock (question, options, correct, chosen, worked steps) on the clipboard as JSON. When the user pastes it, do the deeper analysis the button cannot: read *which wrong option they chose* (each distractor is a specific mistake), group misses into repeated habits, and write the findings into `config.js` `todo` (habit fixes first, then per-unit drills with time estimates). Say how many misses trace to each habit — small samples (22 questions) swing a unit from 0% to 100%, so prioritize repeated patterns over per-unit scores.

**Why not call an LLM from the page:** a browser page would have to ship an API key and bill per click. The deterministic button plus paste-to-Claude gives the same result without either. Only revisit this if the user asks for it explicitly, and then use a small proxy, never a key in the HTML.

### 7. Hand off
Tell the user: how to open it (double-click `index.html`; one access method only, since `file://` and `localhost` keep **separate** progress), what's saved, the known gaps (objectives with no generator, anything needing figures), and what to do first — usually a diagnostic mock exam, then work the weakest objectives.

## Codex and other agents
Everything here works the same outside Claude Code. Only tool names differ:
- **Brightspace:** tools are named `mcp__brightspace__*` in Claude Code and `brightspace.*` (or similar) in Codex. Use whichever Brightspace tools you have. Without them, ask the user to download the four documents in step 1 (objectives, sample exam + key, formula sheet, exam info) and point you at them.
- **Browser checks (step 5):** use any browser automation you have. If there is none, still run `node test.js`, then ask the user to open `index.html` and click through every tab, and tell them what to look for.
- The page's **Copy results for Claude** button copies plain JSON, so any agent can do the analysis in step 6 when the user pastes it.

## Updating an existing tool
Keep the same `key` or progress is orphaned. Re-run `node test.js` after any `gen.js` edit. When a source document changes (new edition, updated formula sheet), re-derive rather than patch — and re-check the page/section map.

## Files
- `template/` — `index.html`, `app.js` (course-agnostic shell, reads `window.COURSE` + `window.GEN`), `gen-lib.js`, `test.js`, `config.example.js`, `SPEC.example.md`
- `scripts/extract_problems.py` — textbook problems + answers → `book.js`
- `references/pipeline.md` — Brightspace, PDF extraction, browser verification gotchas
- `references/subject-profiles.md` — how to adapt per subject

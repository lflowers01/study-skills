# CHM 11510 Exam 1 Study Tool — Spec

**Goal:** get an A on Exam 1 (Thu Sept 24 2026, 8–9 PM, ~20–25 MC questions, 1 hour, Lectures 1–6, HW01–04, Recitation wk 1–5).
**Source of truth:** the 44 Learning Objectives (LOs) in `LO_Gen Chem Fundamentals_Lec 1-6_FA26` — the instructor states every exam question maps to one or more LOs.
**Textbook:** Silberberg, *Chemistry: The Molecular Nature of Matter and Change* (10e / 2026 Evergreen): §1.3–1.5, 2.3–2.7, 3.1, 3.3–3.4, 4.1–4.3.

## Design principles (evidence base)
Hattie & Donoghue 2021 (replicating Dunlosky et al. 2013): the two highest-utility techniques are **practice testing** and **distributed practice**; interleaving also helps. Rereading/highlighting are low utility → the tool contains **no reading content**, only retrieval.

| Principle | How the tool does it |
|---|---|
| Practice testing | Every screen asks a question; answer first, feedback second |
| Spaced repetition | Leitner boxes for flashcards (intervals 0 / 4h / 20h / 44h / 96h); wrong problems go to a "missed" queue |
| Interleaving | Mock exam shuffles all lectures; practice has an "All lectures" default |
| Exam fidelity | 4–5 option MC, 60-min timer, per-lecture question mix from the sample exam (22 Q) |
| Metacognition | Per-LO self-rating (Not yet / Shaky / Got it) shown next to real accuracy so overconfidence is visible |
| Immediate worked feedback | Each problem shows the solution steps, common-error distractors |

## Non-goals (YAGNI)
No accounts, no backend, no framework/build step, no lecture content, no thermochemistry (Exam 2). Data stays in the browser (`localStorage`).

## Stack
Static files, zero dependencies: `index.html`, `gen.js` (pure logic — problem generators, data), `app.js` (UI), `test.js` (node self-check). Open `index.html` directly (file://) — works offline, also on a phone if the folder is copied/hosted.

## Features
1. **Home** — countdown to exam, today's plan, overall accuracy by lecture, weakest LOs, due cards, missed count.
2. **Practice** — infinite randomized problems, filter by lecture or single LO, one at a time, instant feedback + steps.
3. **Mock exam** — 22 questions (L1×2, L2×7, L3×4, L4×3, L5×2, L6×4), 60-min timer, jump navigation, results by lecture, wrong answers auto-queued.
4. **Cards** — Leitner flashcards: SI prefixes (must be memorized — not on the exam sheet), polyatomic ions, common ion charges, strong acids/bases, solubility rules, definitions, method recipes.
5. **Objectives** — all 44 LOs, self-rating, stats, "practice this".
6. **Missed queue** — redo wrong problems until right.
7. **Book** — the 61 end-of-chapter problems the LO sheet assigns (Silberberg 10e), grouped by lecture, answer hidden until revealed, ✓/✗ tracking. Data in `book.js`, regenerated from `../textbook.pdf` by `python build_book.py`. Home links `../Silberberg10e_Exam1.pdf` (bookmarked excerpt: reading, follow-up solutions, problems, Appendix E).

## Problem generators (each maps to LO ids)
Sig-fig counting & rounding · SI/unit conversion, density, rate · element from Z · subatomic particles in ions · atomic mass from isotopes · ion charge · ionic formulas · ions per formula unit / in solution · molar mass · mol↔g↔particles · mass % · balancing · mass–mass stoichiometry · limiting reactant & leftover · percent yield · molarity · dilution (3 forms) · precipitation prediction (solubility rules) · spectator ions & net ionic equation · precipitate mass with limiting reactant · moles H⁺/OH⁻, titration, neutralization volume · products of acid–base · ~30 curated concept questions (accuracy/precision, mole, isotopes, limiting reactant, electrolytes, strong/weak…).
Known gap: LO L6s1 ("molecular scenes") needs images — practice with the sample exam/recitation instead.

## Data model (`localStorage` key `chm11510-exam1-v1`)
`{ lo:{[id]:{c:0-3,r,w}}, cards:{[id]:{box,due}}, missed:[problem], exams:[{t,score,n}] }`
Problem = `{lo:[ids], lec, q:html, opts:[html], correct:index, steps:html}` (plain data → storable).

## Acceptance / verification (`node test.js`)
- Reproduces the sample-exam answers with the same helper functions the generators use: molar mass of aspartame 294.3, 4.68 mol NaBrO₃ = 706 g, Pt atoms 4.40×10²³, urea %N 46.6, CH₄→O₂ 3.989×10³ g, limiting C₂H₂/H₂ → 30.5 g, CuS 1.82 g, KOH/HNO₃ titration 0.1943 M, dilution 1.1 M.
- All reaction bank entries atom-balance; all salts charge-balance; solubility rules spot-checked.
- 400 random problems per generator: exactly one correct option, options unique, no NaN/undefined/Infinity, LO ids valid.
- Coverage: every LO except L6s1 has ≥1 generator or concept question.

## Risks
Generators are my own worked-problem logic, not Purdue's — always cross-check with the sample exam key, HW and recitation. Atomic masses follow the exam's periodic table (e.g. Cl 35.45, Zn 65.39).

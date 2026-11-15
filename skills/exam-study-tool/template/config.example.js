// EXAMPLE config (CHM 11510 Exam 1) — copy to config.js and replace every value.
// This is the only file that should contain course-specific facts; app.js stays generic.
//
// Feature switches by presence: no `book` → no Book tab; no `todo` and no mocks taken → no To study tab;
// no CARDS in gen.js → no Cards tab.
//
// `study` (per-objective advice) powers the post-mock "Add what I need to study to my list" button.
//   key = objective id (same ids as LOS in gen.js). Fields, all optional:
//     tip  — the usual MISTAKE and its FIX, one or two sentences ("Neutrons = A − Z, not A")
//     read — where to read (falls back to the unit's book.rows[unit][0])
//     sp   — worked/sample problems (falls back to book.rows[unit][1])
//     book — assigned end-of-chapter problem ids that appear in book.js ("4.24, 4.26")
//   Write tips from how students actually get these wrong (i.e. from your generators' distractors).
// `todo` is the hand-written plan (optional); the auto-added items appear above it.
window.COURSE = {
  course: 'CHM 11510',
  key: 'chm11510-exam1-v1',              // localStorage key — never change it or progress is orphaned
  unitWord: 'Lecture', unitAbbr: 'L',
  units: ['Units & sig figs', 'Atoms & ions', 'Formulas & the mole', 'Equations & stoichiometry', 'Molarity', 'Reaction types'],
  exam: {
    when: '2026-09-24T20:00:00',
    head: 'Exam 1 · Thu Sept 24 · 8:00–9:00 PM · ~22 MC questions · Lectures 1–6',
    minutes: 60,
    blueprint: [[1, 2], [2, 7], [3, 4], [4, 3], [5, 2], [6, 4]],   // [unit, question count] — mirrors Sample Exam 1
    rules: 'Use your exam calculator and only the formula sheet — no notes.',
  },
  // "To study" tab, written from the first mock exam (15/22). Items may link to practice (lo) or another tab.
  todoTitle: 'To study — from your first mock exam (15/22)',
  todoNote: 'Your 7 misses were three repeated mistakes, not seven gaps. Fix the habit first, then drill the sections.',
  todo: [
    {title: 'Fix the three repeated mistakes', time: '15 min', why: 'These caused 6 of your 7 misses. Say the rule out loud, then do a few problems using it.', items: [
      {id: 't1a', text: '<b>Count the ions before multiplying.</b> Write the dissociation first: Al(OH)<sub>3</sub> → 1 Al<sup>3+</sup> + 3 OH<sup>−</sup> = 4 ions; H<sub>2</sub>SO<sub>4</sub> → 2 H<sup>+</sup>. Then multiply moles of salt by that number.', lo: 'L5s4'},
      {id: 't1b', text: '<b>Balance, then use the coefficient ratio.</b> mass A → mol A → × (coef B ÷ coef A) → mol B → mass B. Never treat the ratio as 1:1.', lo: 'L4s2'},
      {id: 't1c', text: '<b>Nitrates (and Group 1, NH<sub>4</sub><sup>+</sup>, acetates) are always soluble.</b> Check the solubility sheet before deciding a precipitate forms.', lo: 'L6c3'}]},
    {title: 'Lecture 5: molarity and ions in solution', time: '45 min', why: 'Mock score 0% (2 questions). Both misses were the ion-counting mistake.', items: [
      {id: 't2a', text: 'Read §4.1, pages 141–151 (molarity, ions in solution, dilution). Skim; the problems matter more.'},
      {id: 't2b', text: 'Sample Problems 4.1–4.6, especially 4.6 (ions in solution), plus their Follow-Up problems.'},
      {id: 't2c', text: 'Book problems <b>4.26</b> (moles and ions of each type), 4.22, 4.24, 4.28.', tab: 'book'},
      {id: 't2d', text: 'Practice objective L5s4 until 5 in a row are right.', lo: 'L5s4'}]},
    {title: 'Lecture 6: reaction types', time: '45 min', why: 'Mock score 50%. Missed the H<sup>+</sup>-per-acid count and a precipitate prediction.', items: [
      {id: 't3a', text: 'Read §4.2–4.3, pages 152–168 (solubility table, net ionic equations, acid–base reactions).'},
      {id: 't3b', text: 'Sample Problems 4.7–4.10 and 4.12–4.14 plus Follow-Ups.'},
      {id: 't3c', text: 'Book problems 4.36, 4.40–4.45 (net ionic equations, predicting precipitates).', tab: 'book'},
      {id: 't3d', text: 'Practice L6s3 (moles of H<sup>+</sup>/OH<sup>−</sup>) and L6c3 (predict a precipitate).', lo: 'L6s3'}]},
    {title: 'Lecture 4: stoichiometry', time: '30 min', why: 'Mock score 67%. Missed the mole-ratio step.', items: [
      {id: 't4a', text: 'Sample Problems 3.12–3.13 plus Follow-Ups.'},
      {id: 't4b', text: 'Book problems 3.69–3.77 (mass to mass). Write the coefficient ratio on every line.', tab: 'book'},
      {id: 't4c', text: 'Practice L4s2 (mole ratios) and L4s3 (limiting reactant).', lo: 'L4s3'}]},
    {title: 'Lecture 2: atoms and ions', time: '20 min', why: 'Mock score 71%. Mixed up mass number with neutrons; missed fluorine\'s charge.', items: [
      {id: 't5a', text: 'Neutrons = A − Z (mass number − atomic number). Electrons = Z − charge.', lo: 'L2s1'},
      {id: 't5b', text: 'Learn the ion charges by group (1A +1, 2A +2, Al +3, 5A −3, 6A −2, 7A −1) with the flashcards.', tab: 'cards'},
      {id: 't5c', text: 'Sample Problems 2.4 and 2.7; Book problems 2.46, 2.76, 2.78.', tab: 'book'}]},
    {title: 'Keep it fresh and re-test', time: 'daily', items: [
      {id: 't6a', text: 'Redo the Missed queue (Practice → Missed) until it is empty.'},
      {id: 't6b', text: 'Flashcards: clear the due cards each day.', tab: 'cards'},
      {id: 't6c', text: 'Lectures 1 and 3 were 100% — one quick set of each on Tuesday is enough.'},
      {id: 't6d', text: 'Take a second full mock exam on Wednesday and compare with 15/22.', tab: 'exam'}]},
  ],
  // Per-objective advice used by "Add what I need to study" after a mock. Any objective without an entry
  // falls back to its unit's reading + sample problems (book.rows). tip = the usual mistake and its fix.
  study: {
    L1s1: {tip: 'Leading zeros never count; trailing zeros count only with a decimal point. Add/subtract → fewest <i>decimal places</i>; multiply/divide → fewest <i>sig figs</i>.', sp: 'SP 1.4–1.5', book: '1.22, 1.24, 1.26, 1.28, 1.36'},
    L1s2: {tip: 'Write units on every step and cancel them. Memorize the metric prefixes — they are not on the exam sheet.', sp: 'SP 1.6–1.8', book: '1.46, 1.54, 1.56, 1.79'},
    L2s1: {tip: 'Protons = Z. Neutrons = A − Z (A is the <i>mass number</i>, not the neutron count). Electrons = Z − charge.', sp: 'SP 2.4', book: '2.46, 2.48, 2.50'},
    L2s2: {tip: 'Weighted average: multiply each isotope mass by its abundance <i>as a fraction</i>, then add.', sp: 'SP 2.5'},
    L2s3: {tip: 'Atomic number = number of protons = the element\'s spot on the periodic table.', sp: 'SP 2.6'},
    L2s4: {tip: 'Ion charge by group: 1A +1, 2A +2, Al +3, 5A −3, 6A −2, 7A −1. Use the flashcards.', sp: 'SP 2.7', book: '2.76, 2.78'},
    L2s5: {tip: 'Learn the 14 polyatomic ions from the formula sheet (recognize, not name). Use the flashcards.'},
    L3s1: {tip: 'Charges must cancel; use parentheses around a polyatomic ion when you need more than one, e.g. Ca<sub>3</sub>(PO<sub>4</sub>)<sub>2</sub>.', sp: 'SP 2.8–2.9'},
    L3s2: {tip: 'Sum atomic masses × subscripts; multiply everything inside parentheses by the outside subscript.', sp: 'SP 2.15–2.16', book: '3.8, 3.10'},
    L3s3: {tip: 'Sum atomic masses × subscripts; multiply everything inside parentheses by the outside subscript.', sp: 'SP 3.4', book: '3.8, 3.10'},
    L3s4: {tip: 'g ↔ mol uses molar mass; mol ↔ particles uses 6.022×10<sup>23</sup>. For atoms of one element in a compound, multiply by its subscript.', sp: 'SP 3.1–3.4', book: '3.12, 3.14, 3.18, 3.25, 3.27, 3.30'},
    L3s5: {tip: 'Mass % = (subscript × atomic mass) ÷ molar mass × 100. Mass of element = total mass × that fraction.', sp: 'SP 3.5–3.6', book: '3.20, 3.22, 3.25'},
    L4s1: {tip: 'Balance elements that appear once first; leave O and H (or lone elements) for last.', sp: 'SP 3.10', book: '3.56, 3.58, 3.60'},
    L4s2: {tip: 'Balance first, then: g A → mol A → × (coef B ÷ coef A) → mol B → g B. Never assume the ratio is 1:1.', sp: 'SP 3.12–3.13', book: '3.69, 3.71, 3.73, 3.75, 3.77'},
    L4s3: {tip: 'Convert each reactant to moles and divide by its coefficient; the <i>smaller</i> value is limiting. Do the product calculation from the limiting reactant.', sp: 'SP 3.14–3.16', book: '3.79, 3.81, 3.83, 3.85, 3.87, 3.89'},
    L4s4: {tip: '% yield = actual ÷ theoretical × 100. Theoretical comes from the limiting reactant.', sp: 'SP 3.17'},
    L5s1: {tip: 'Molarity = mol ÷ <i>liters</i> of solution. Convert mL → L first.', sp: 'SP 4.1–4.2', book: '4.16, 4.18, 4.20, 4.22, 4.24'},
    L5s2: {tip: 'M<sub>1</sub>V<sub>1</sub> = M<sub>2</sub>V<sub>2</sub>, where V<sub>2</sub> is the <i>total</i> final volume (not just the water added).', sp: 'SP 4.3', book: '4.28, 4.30, 4.33'},
    L5s3: {tip: 'M<sub>1</sub>V<sub>1</sub> = M<sub>2</sub>V<sub>2</sub>, where V<sub>2</sub> is the <i>total</i> final volume (not just the water added).', sp: 'SP 4.3', book: '4.28, 4.30, 4.33'},
    L5s4: {tip: 'Write the dissociation first (Al(OH)<sub>3</sub> → 1 Al<sup>3+</sup> + 3 OH<sup>−</sup> = 4 ions), then multiply moles of salt by the number of ions.', sp: 'SP 4.6', book: '4.24, 4.26'},
    L6s2: {tip: 'Solution stoichiometry: mol = M × L for each reactant, then the mole ratio from the balanced equation.', sp: 'SP 4.9–4.13', book: '4.47, 4.49'},
    L6s3: {tip: 'Strong acids give all their H<sup>+</sup>: H<sub>2</sub>SO<sub>4</sub> = 2 H<sup>+</sup>; Ba(OH)<sub>2</sub> = 2 OH<sup>−</sup>. Multiply mol of acid or base by that number.', sp: 'SP 4.12–4.14'},
    L6s4: {tip: 'Spectator ions are the ions of the <i>soluble</i> product. Cancel them; keep solids, liquids, gases and weak electrolytes whole.', sp: 'SP 4.7–4.8, 4.12', book: '4.40, 4.41, 4.43, 4.45'},
    L6s5: {tip: 'At neutralization mol H<sup>+</sup> = mol OH<sup>−</sup>: M<sub>a</sub>V<sub>a</sub>(H<sup>+</sup> per acid) = M<sub>b</sub>V<sub>b</sub>(OH<sup>−</sup> per base).', sp: 'SP 4.14'},
    L6s6: {tip: 'Find mol of each reactant, divide by its coefficient, smaller is limiting; precipitate mass comes from that.', sp: 'SP 4.9–4.10', book: '4.47, 4.49'},
    L6c3: {tip: 'Nitrates, Group 1 ions, NH<sub>4</sub><sup>+</sup> and acetates are <i>always</i> soluble. Swap partners, then look up each new compound on the solubility sheet.', sp: 'SP 4.7–4.8', book: '4.40, 4.41, 4.43, 4.45'},
  },
  noGen: ['L6s1'],                        // objectives with no generator (need figures) — excluded from "work on these next"
  practiceHint: 'Do the calculation on paper first, then pick an answer.',
  plan: {
    '2026-09-19': 'Diagnostic day: take a mock exam (ignore the timer if you like) and honestly rate every objective. Then start on your weakest.',
    '2026-09-20': 'SI review 5:00–6:30 PM in LILY 1105. Before it: practice Lectures 1–3. After: cards + missed queue.',
    '2026-09-21': 'Practice Lectures 4–5 (stoichiometry, limiting reactant, molarity). Do the recitation exam-review worksheet — attendance counts.',
    '2026-09-22': 'Lecture 6: precipitation, net ionic equations, titration. Then redo the whole missed queue.',
    '2026-09-23': 'Full timed mock exam, then fix every miss. Stop early and sleep.',
    '2026-09-24': 'Exam tonight 8:00 PM (arrive 7:45). Light day: cards + missed queue only. Bring your approved calculator.',
  },
  planDefault: 'Keep going: practice, cards, missed queue.',
  book: {
    title: 'Textbook (Silberberg 10e)', tab: 'Book',
    pdf: '../Silberberg10e_Exam1.pdf', pdfLabel: 'Open the Exam 1 excerpt PDF',
    pdfNote: '— reading, follow-up solutions, problems, answers (bookmarked). Assigned problems are in the Book tab.',
    tabTitle: 'Assigned textbook problems',
    tabNote: 'The end-of-chapter problems your Learning Objectives sheet lists, with answers from Appendix E. Work each on paper first, then check.',
    // rows[unit] = [reading, sample problems, note shown above that unit's problems in the Book tab]
    rows: [, ['§ 1.3–1.5 (p. 11–30)', 'SP 1.3–1.10', 'Also work the in-chapter SP 1.3–1.10 and their Follow-Up problems (solutions in each chapter\'s review guide).'],
      ['§ 2.2–2.6 (p. 46–67)', 'SP 2.2, 2.4–2.7', 'Also work the in-chapter SP 2.2, 2.4–2.7 and their Follow-Up problems.'],
      ['§ 2.7, 3.1 (p. 68–80, 93–101)', 'SP 2.8, 2.9, 2.15, 2.16, 3.1–3.6', 'Also work the in-chapter SP 2.8, 2.9, 2.15, 2.16, 3.1–3.6 and their Follow-Up problems.'],
      ['§ 3.3–3.4 (p. 107–124)', 'SP 3.10–3.17', 'Also work the in-chapter SP 3.10–3.17 and their Follow-Up problems.'],
      ['§ 4.1 (p. 141–151)', 'SP 4.1–4.6', 'Also work the in-chapter SP 4.1–4.6 and their Follow-Up problems.'],
      ['§ 4.2–4.3 (p. 152–168)', 'SP 4.7–4.10, 4.12–4.14', 'Also work the in-chapter SP 4.7–4.10, 4.12–4.14 and their Follow-Up problems.']],
    // which unit a textbook problem belongs to (chapter 3 splits across L3/L4, chapter 4 across L5/L6)
    lecOf: b => { const [c, n] = b.id.split('.').map(Number);
      return c === 1 ? 1 : c === 2 ? 2 : c === 3 ? (n < 50 ? 3 : 4) : (n < 35 ? 5 : 6); },
  },
};

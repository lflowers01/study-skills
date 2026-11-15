// node test.js — self-check for a course's gen.js. Add course-specific truth checks at the top
// (recompute answers from the real sample exam / homework: that is what catches wrong formulas).
const assert = require('assert');
const G = require('./gen.js');
const {LOS, GENS, makeProblem, CARDS} = G;
let n = 0; const ok = () => n++;
const near = (a, b, tol, msg) => { assert(Math.abs(a - b) <= tol * Math.abs(b), `${msg}: got ${a}, want ${b}`); ok(); };

// ---- 1. course truth checks: every known answer this tool's math must reproduce ----
// e.g. near(calc.molarMass('C14H18N2O5'), 294.3, .001, 'aspartame');
//      near(calc.titrate(.1850, 26.25, 1, 25.00, 1), .1943, .001, 'sample exam Q19');
// REQUIRED: at least one per generator family, taken from the sample exam or graded homework.

// ---- 2. objectives ----
const ids = new Set(LOS.map(l => l.id));
assert.strictEqual(ids.size, LOS.length, 'duplicate objective ids'); ok();

// ---- 3. random problems: every generator, many draws ----
const bad = /\bNaN\b|undefined|Infinity|\bnull\b/;   // widen per course if a real answer contains these letters
GENS.forEach((g, gi) => {
  for (let i = 0; i < 400; i++) {
    const p = g.fn(g.concept ? {lec: g.lec} : undefined), tag = `gen#${gi} ${g.fn.name}`;
    assert(p.opts.length >= 3 && p.opts.length <= 5, `${tag} option count ${p.opts.length}: ${p.q}`);
    assert.strictEqual(new Set(p.opts).size, p.opts.length, `${tag} duplicate options: ${p.opts.join(' | ')}`);
    assert(p.correct >= 0 && p.correct < p.opts.length, `${tag} no correct option: ${p.q}`);
    for (const t of [p.q, p.steps, ...p.opts]) assert(!bad.test(String(t)), `${tag} bad text: ${t}`);
    assert(p.lo.length && p.lo.every(id => ids.has(id)), `${tag} unknown objective: ${p.lo}`);
    assert(p.steps && p.steps.length > 10, `${tag} missing worked steps: ${p.q}`);
  }
  ok();
});

// ---- 4. coverage: every objective is reachable except the ones we know need figures ----
const covered = new Set(); GENS.forEach(g => g.lo.forEach(x => covered.add(x)));
const NO_GEN = [];   // objective ids that legitimately have no generator — keep in sync with config.js noGen
assert.deepStrictEqual(LOS.filter(l => !covered.has(l.id)).map(l => l.id), NO_GEN, 'uncovered objectives'); ok();

// ---- 5. filters ----
for (const l of LOS) assert(makeProblem({lo: l.id}).q, `no problem for ${l.id}`);
const units = [...new Set(LOS.map(l => l.lec))];
for (const u of units) for (let i = 0; i < 50; i++) assert.strictEqual(makeProblem({lec: u}).lec, u, `unit filter leaked on ${u}`);
ok();
assert.strictEqual(new Set(CARDS.map(c => c.id)).size, CARDS.length, 'duplicate card ids'); ok();

console.log(`OK — ${n} checks, ${GENS.length} generators x400, ${CARDS.length} cards, ${LOS.length} objectives`);

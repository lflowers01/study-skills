// Generic question-generator helpers. Subject-neutral: a course's gen.js requires/loads this,
// then defines its own data, generators, LOS and CARDS. Works in the browser and in node (for test.js).
(function (root) {
'use strict';

// ---------- random ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[ri(0, a.length - 1)];
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rd = (x, d) => +x.toFixed(d);

// ---------- number formatting ----------
const sci = (x, n) => { const [m, e] = x.toExponential(n - 1).split('e'); return m + ' × 10<sup>' + String(+e).replace('-', '−') + '</sup>'; };
const fmt = (x, n = 4) => { const a = Math.abs(x); return (a >= 1e5 || (a > 0 && a < 1e-2)) ? sci(x, n) : String(+x.toPrecision(n)); };
function sigStr(x, n) {  // x rendered with exactly n significant figures
  const rx = +x.toPrecision(n), e = Math.floor(Math.log10(Math.abs(rx)));
  return e >= n ? sci(rx, n) : rx.toFixed(Math.max(0, n - 1 - e));
}
const sub = f => f.replace(/(\d+)/g, '<sub>$1</sub>');

// ---------- multiple-choice builders ----------
// mc: numeric answer + numeric distractors (wrong answers from plausible mistakes, NOT random noise).
// Distractors that collide with the answer after formatting are dropped, then padded from `fill` factors.
function mc(ans, wrong, f = fmt, fill = [2, .5, 10, .1, 1.5, 3, 4]) {
  const a = f(ans), o = [a];
  const add = v => { if (Number.isFinite(v)) { const s = f(v); if (!o.includes(s)) o.push(s); } };
  shuf(wrong).forEach(add);
  for (const k of fill) if (o.length < 5) add(ans * k);
  const opts = shuf(o.slice(0, 5));
  return {opts, correct: opts.indexOf(a)};
}
// mcs: string answer + string distractors, padded from `fill` (a pool of other plausible strings).
function mcs(ans, wrong, fill = []) {
  const o = [ans];
  for (const w of shuf(wrong).concat(shuf(fill))) if (o.length < 5 && !o.includes(w)) o.push(w);
  const opts = shuf(o);
  return {opts, correct: opts.indexOf(ans)};
}
// P: one problem. lo = objective ids it exercises, m = an mc()/mcs() result, steps = worked solution HTML.
const P = (lo, q, m, steps) => ({lo, q, opts: m.opts, correct: m.correct, steps});

// ---------- objectives ----------
// L(unit, 'c'|'s', [text, ...]) -> [{id:'L1c1', lec:1, type:'concept'|'skill', text}]
const L = (lec, t, arr) => arr.map((x, i) => ({id: `L${lec}${t}${i + 1}`, lec, type: t === 'c' ? 'concept' : 'skill', text: x}));

// ---------- registry ----------
// GENS entries: {lec, lo:[ids], w:weight, fn, concept?:true}. makeProblem filters by unit or objective.
function makeProblemFactory(GENS) {
  return function makeProblem(o = {}) {
    let pool = GENS.filter(g => (!o.lec || g.lec === o.lec) && (!o.lo || g.lo.includes(o.lo)));
    if (!pool.length) pool = GENS;
    const bag = pool.flatMap(g => Array(g.w || 1).fill(g)), g = pick(bag);
    const p = g.fn(g.concept ? o : undefined);
    p.lec = p.lec || g.lec;
    return p;
  };
}
// Turn a concept bank ([unit, loId, question, correct, ...wrong]) into one generator function.
function conceptGen(CON) {
  return function (o = {}) {
    let pool = CON.filter(c => (!o.lec || c[0] === o.lec) && (!o.lo || c[1] === o.lo));
    if (!pool.length) pool = CON;
    const c = pick(pool), p = P([c[1]], c[2], mcs(c[3], c.slice(4)), `<b>${c[3]}</b>`);
    p.lec = c[0];
    return p;
  };
}

const lib = {rnd, ri, pick, shuf, rd, sci, fmt, sigStr, sub, mc, mcs, P, L, makeProblemFactory, conceptGen};
root.GENLIB = lib;
if (typeof module !== 'undefined') module.exports = lib;
})(typeof window !== 'undefined' ? window : globalThis);

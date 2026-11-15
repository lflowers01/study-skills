// Exam study tool — UI shell. Course-specific values live in config.js (window.COURSE);
// question generators, objectives and cards live in gen.js (window.GEN). See SPEC.md.
(function () {
'use strict';
const C = window.COURSE, {LOS, makeProblem, CARDS} = window.GEN;
const U = C.units, N = U.length, unit = l => U[l - 1], ABBR = C.unitAbbr || 'L';
const UNITS = Array.from({length: N}, (_, i) => i + 1);
const EXAM = new Date(C.exam.when);
const S = {lo: {}, cards: {}, missed: [], exams: [], book: {}, flag: [], todo: {}, auto: []};
try { Object.assign(S, JSON.parse(localStorage.getItem(C.key)) || {}); } catch (e) { /* private mode: run without saving */ }
const save = () => { try { localStorage.setItem(C.key, JSON.stringify(S)); } catch (e) {} };
const BOOK = C.book, BQ = (window.BOOKQ || []).map(b => Object.assign({lec: BOOK.lecOf(b)}, b));
const INT = [0, 4, 20, 44, 96]; // Leitner: hours until a card in box 1..5 is due again
const MOCK = C.exam.blueprint.reduce((a, [, n]) => a + n, 0);
const ui = {tab: 'home', lec: 0, lo: '', queue: false /* false | 'missed' | 'flag' */, shown: [], note: '', p: null, sel: null, card: null, flip: false, cram: false, exam: null, open: null};
const $ = s => document.querySelector(s);
const pick = a => a[Math.floor(Math.random() * a.length)];
const pct = (r, w) => (r + w ? Math.round(100 * r / (r + w)) : null);
const lo = id => S.lo[id] || {c: 0, r: 0, w: 0};
const TODO = C.todo || [], TODO_N = TODO.reduce((a, g) => a + g.items.length, 0);
const todoDone = () => TODO.reduce((a, g) => a + g.items.filter(i => S.todo[i.id]).length, 0) + S.auto.filter(i => S.todo[i.id]).length;
const todoTotal = () => TODO_N + S.auto.length;
const has = t => t === 'book' ? BQ.length > 0 : t === 'cards' ? CARDS.length > 0 : t === 'todo' ? todoTotal() > 0 : true;

function record(p, ok) {
  for (const id of p.lo) { const s = S.lo[id] || (S.lo[id] = {c: 0, r: 0, w: 0}); ok ? s.r++ : s.w++; }
  const i = S.missed.findIndex(m => m.q === p.q);
  if (ok) { if (i >= 0) S.missed.splice(i, 1); } else if (i < 0) S.missed.push(p);
  save();
}
const dueCards = () => { const t = Date.now(); return CARDS.filter(c => !S.cards[c.id] || S.cards[c.id].due <= t); };
function nextP() {
  ui.sel = null;
  if (ui.queue && !S[ui.queue].length) ui.queue = false;
  ui.p = ui.queue ? pick(S[ui.queue]) : makeProblem({lec: ui.lec || undefined, lo: ui.lo || undefined});
}
function nextCard() {
  const pool = (ui.cram ? CARDS : dueCards()).filter(c => !ui.card || c.id !== ui.card.id);
  ui.card = pool.length ? pick(pool) : null; ui.flip = false;
}

// ---------- views ----------
const isFlagged = p => S.flag.some(f => f.q === p.q);
function probHTML(p, sel, live) {
  const done = sel != null && !live;
  const k = ui.shown.push(p) - 1, fl = isFlagged(p);
  return `<div class="card"><div class="row" style="justify-content:space-between"><div class="tag">${unit(p.lec)} · ${p.lo.join(', ')}</div>
    <button class="flag ${fl ? 'on' : ''}" data-act="flag" data-k="${k}" title="Save this question to your Flagged list">⚑ ${fl ? 'Flagged' : 'Flag'}</button></div><div class="qt">${p.q}</div><div class="opts">` +
    p.opts.map((o, i) => `<button class="opt ${done ? (i === p.correct ? 'right' : i === sel ? 'wrong' : '') : (live && i === sel ? 'sel' : '')}" data-act="pick" data-i="${i}" ${done ? 'disabled' : ''}>${'ABCDE'[i]}. ${o}</button>`).join('') +
    `</div>${done ? `<div class="fb ${sel === p.correct ? 'ok' : 'no'}"><b>${sel === p.correct ? 'Correct ✓' : 'Not quite ✗'}</b><div class="steps">${p.steps}</div></div>` : ''}</div>`;
}
function bars(per) {
  return UNITS.map(l => { const t = per[l] || {r: 0, w: 0}, v = pct(t.r, t.w);
    return `<div class="lecrow"><span>${ABBR}${l} ${unit(l)}</span><div class="bar"><i style="width:${v || 0}%"></i></div><span>${v == null ? '–' : v + '%'}</span></div>`; }).join('');
}
function perUnit() { const per = {}; for (const l of LOS) { const s = lo(l.id), t = per[l.lec] || (per[l.lec] = {r: 0, w: 0}); t.r += s.r; t.w += s.w; } return per; }

function home() {
  const ms = EXAM - Date.now(), d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  const today = new Date().toLocaleDateString('en-CA'), R = LOS.reduce((a, l) => a + lo(l.id).r, 0), W = LOS.reduce((a, l) => a + lo(l.id).w, 0);
  const need = l => { const s = lo(l.id); return (s.w + 1) / (s.r + s.w + 2) + [.3, .5, .2, 0][s.c || 0]; };
  const weak = LOS.filter(l => !(C.noGen || []).includes(l.id)).sort((a, b) => need(b) - need(a)).slice(0, 5);
  const rated = LOS.filter(l => lo(l.id).c === 3).length, last = S.exams[S.exams.length - 1];
  return `<div class="card"><div class="tag">${C.exam.head}</div>
    <div class="big">${ms > 0 ? `${d}d ${h}h ${m}m` : 'Exam time has passed'}</div>
    <p style="margin:8px 0 0"><b>Today:</b> ${(C.plan || {})[today] || C.planDefault || 'Keep going: practice, cards, missed queue.'}</p></div>
  <div class="row"><button class="btn" data-act="tab" data-t="practice">Practice</button><button class="btn" data-act="tab" data-t="exam">Mock exam</button>
    ${has('cards') ? `<button class="btn alt" data-act="tab" data-t="cards">Cards (${dueCards().length} due)</button>` : ''}
    ${has('todo') ? `<button class="btn alt" data-act="tab" data-t="todo">To study (${todoDone()}/${todoTotal()})</button>` : ''}
    <button class="btn alt" data-act="missed">Missed queue (${S.missed.length})</button>
    <button class="btn alt" data-act="flagged">⚑ Flagged (${S.flag.length})</button></div>
  <div class="card"><h2>Accuracy by ${(C.unitWord || 'lecture').toLowerCase()}</h2>${bars(perUnit())}<p class="mut">Overall: ${pct(R, W) == null ? 'no problems answered yet' : pct(R, W) + '% of ' + (R + W)} · Objectives marked "Got it": ${rated}/${LOS.length}${last ? ` · Last mock: ${last.score}/${last.n}` : ''}</p></div>
  <div class="card"><h2>Work on these next</h2>${weak.map(l => `<div class="lo"><div class="t"><b>${l.id}</b> ${l.text}</div><button class="btn alt" data-act="lo" data-id="${l.id}">Practice</button></div>`).join('')}
    <p class="mut">Ranked by your misses and self-ratings (unrated objectives count as unknown).</p></div>` +
  (BOOK ? `<div class="card"><h2>${BOOK.title}</h2>
    ${UNITS.map(l => BOOK.rows[l] ? `<div class="lecrow" style="grid-template-columns:40px 1fr 1fr"><b>${ABBR}${l}</b><span>${BOOK.rows[l][0]}</span><span class="mut">${BOOK.rows[l][1] || ''}</span></div>` : '').join('')}
    ${BOOK.pdf ? `<p><a href="${BOOK.pdf}" target="_blank">${BOOK.pdfLabel || 'Open the excerpt PDF'}</a> <span class="mut">${BOOK.pdfNote || ''}</span></p>` : ''}</div>` : '');
}
function practice() {
  if (!ui.p) nextP();
  const chips = [0].concat(UNITS).map(l => `<button class="${!ui.lo && !ui.queue && ui.lec === l ? 'on' : ''}" data-act="lec" data-l="${l}">${l ? ABBR + l : 'All'}</button>`).join('');
  return `<div class="card"><div class="row chips">${chips}<button class="${ui.queue === 'missed' ? 'on' : ''}" data-act="missed">Missed (${S.missed.length})</button><button class="${ui.queue === 'flag' ? 'on' : ''}" data-act="flagged">⚑ Flagged (${S.flag.length})</button></div>
    ${ui.lo ? `<p class="mut" style="margin:8px 0 0">Focus: ${ui.lo} — ${LOS.find(l => l.id === ui.lo).text}</p>` : ''}</div>` +
    probHTML(ui.p, ui.sel) + (ui.sel != null ? `<button class="btn" data-act="next">Next problem →</button>` : `<p class="mut">${C.practiceHint || 'Work it out on paper first, then pick an answer.'}</p>`);
}
const fmtT = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
function exam() {
  const E = ui.exam;
  if (!E) return `<div class="card"><h2>Mock exam</h2><p>${MOCK} multiple-choice questions, ${C.exam.minutes} minutes, all ${(C.unitWord || 'lecture').toLowerCase()}s mixed (${C.exam.blueprint.map(([, n]) => n).join(' / ')} by ${(C.unitWord || 'lecture').toLowerCase()}, like the real exam). ${C.exam.rules || ''}</p>
    <button class="btn" data-act="examStart">Start mock exam</button>${S.exams.length ? `<h3>Past attempts</h3>` + S.exams.slice().reverse().map(x => `<div class="mut">${new Date(x.t).toLocaleString()} — ${x.score}/${x.n} (${Math.round(100 * x.score / x.n)}%)</div>`).join('') : ''}</div>`;
  if (E.done) {
    const by = {}; E.qs.forEach((p, i) => { const b = by[p.lec] || (by[p.lec] = {r: 0, w: 0}); E.ans[i] === p.correct ? b.r++ : b.w++; });
    const wrong = E.qs.map((p, i) => [p, i]).filter(([p, i]) => E.ans[i] !== p.correct);
    return `<div class="card"><h2>Result: ${E.score}/${E.qs.length} (${Math.round(100 * E.score / E.qs.length)}%)</h2>${bars(by)}<p class="mut">Missed questions were added to your missed queue.</p>
      ${wrong.length ? `<div class="row" style="margin-bottom:8px"><button class="btn" data-act="addstudy">➕ Add what I need to study to my list</button><button class="btn alt" data-act="copyres">Copy results for Claude</button></div>` : ''}
      ${ui.note ? `<p class="fb ok">${ui.note}</p>` : ''}
      <div class="row"><button class="btn alt" data-act="examStart">Another mock</button><button class="btn alt" data-act="missed">Practice missed</button></div></div>` +
      (wrong.length ? `<h2>Review (${wrong.length} missed)</h2>` + wrong.map(([p, i]) => probHTML(p, E.ans[i] == null ? -1 : E.ans[i])).join('') : `<div class="card">Perfect score.</div>`);
  }
  const p = E.qs[E.i];
  return `<div class="card row" style="justify-content:space-between"><span>Question <b>${E.i + 1}</b> of ${E.qs.length}</span><span>Time left <span id="tm">${fmtT(Math.max(0, Math.round((E.end - Date.now()) / 1000)))}</span></span></div>
    <div class="qnav">${E.qs.map((_, i) => `<button class="${E.ans[i] != null ? 'a' : ''} ${i === E.i ? 'cur' : ''}" data-act="jump" data-i="${i}">${i + 1}</button>`).join('')}</div>` +
    probHTML(p, E.ans[E.i], true) +
    `<div class="row"><button class="btn alt" data-act="jump" data-i="${Math.max(0, E.i - 1)}">← Prev</button><button class="btn alt" data-act="jump" data-i="${Math.min(E.qs.length - 1, E.i + 1)}">Next →</button>
    <button class="btn" data-act="submit">Submit exam (${E.ans.filter(x => x != null).length}/${E.qs.length} answered)</button></div>`;
}
function cards() {
  if (ui.card === null && !ui.cram) nextCard();
  const boxes = [1, 2, 3, 4, 5].map(b => CARDS.filter(c => (S.cards[c.id] || {box: 1}).box === b).length);
  const head = `<div class="card"><div class="row" style="justify-content:space-between"><span class="mut">${dueCards().length} due · boxes 1–5: ${boxes.join(' / ')} · ${CARDS.length} total</span>
    <button class="btn alt" data-act="cram">${ui.cram ? 'Only due cards' : 'Study all anyway'}</button></div></div>`;
  if (!ui.card) return head + `<div class="card flash">Nothing due right now. Nice. Come back later, or “Study all anyway”.</div>`;
  const c = ui.card;
  return head + `<div class="card"><div class="tag">${ABBR}${c.lec} · ${S.cards[c.id] ? 'box ' + S.cards[c.id].box : 'new'}</div><div class="flash">${ui.flip ? c.back : c.front}</div></div>` +
    (ui.flip ? `<div class="row"><button class="btn alt" data-act="miss">✗ Missed it</button><button class="btn" data-act="got">✓ Got it</button></div>` : `<button class="btn" data-act="flip">Show answer</button><p class="mut">Try to say the answer out loud first.</p>`);
}
function book() {
  const done = b => S.book[b.id] === 1, tot = BQ.filter(done).length;
  return `<div class="card"><h2>${BOOK.tabTitle || 'Assigned textbook problems'}</h2><p class="mut">${BOOK.tabNote || ''} ${tot}/${BQ.length} done.</p>
    <div class="bar"><i style="width:${100 * tot / BQ.length}%"></i></div></div>` +
    UNITS.map(l => { const qs = BQ.filter(b => b.lec === l); if (!qs.length) return '';
      return `<div class="card"><h2>${C.unitWord || 'Lecture'} ${l}: ${unit(l)} <span class="mut">(${qs.filter(done).length}/${qs.length})</span></h2>
        ${BOOK.rows[l] && BOOK.rows[l][2] ? `<p class="mut">${BOOK.rows[l][2]}</p>` : ''}` +
        qs.map(b => `<div class="lo" style="display:block"><div class="row" style="justify-content:space-between"><b>${b.id}</b><span class="mut">p. ${b.page}${b.fig ? ' · <span class="warn">needs the figure in the book</span>' : ''}</span></div>
          <div class="t" style="margin:4px 0">${b.q}</div>
          ${ui.open === b.id ? `<div class="fb ok"><b>Answer:</b> ${b.a}</div>` : ''}
          <div class="row" style="margin-top:6px"><button class="btn alt" style="padding:3px 10px;font-size:13px" data-act="bshow" data-id="${b.id}">${ui.open === b.id ? 'Hide' : 'Show'} answer</button>
          <span class="conf">${[['1', '✓ Got it', 'c3'], ['2', '✗ Redo', 'c1']].map(([v, t, c]) => `<button class="${c} ${S.book[b.id] == v ? 'on' : ''}" data-act="bmark" data-id="${b.id}" data-v="${v}">${t}</button>`).join(' ')}</span></div></div>`).join('') + '</div>'; }).join('');
}
const todoRow = i => `<label class="lo" style="cursor:pointer;justify-content:flex-start;flex-wrap:nowrap"><input type="checkbox" data-act="tcheck" data-id="${i.id}" ${S.todo[i.id] ? 'checked' : ''} style="margin-top:4px;width:18px;height:18px;flex:none">
        <span class="t" style="${S.todo[i.id] ? 'opacity:.55' : ''}">${i.text}</span>
        ${i.lo ? `<button class="btn alt" style="padding:3px 10px;font-size:12px;flex:none" data-act="lo" data-id="${i.lo}">Practice</button>` : ''}
        ${i.tab ? `<button class="btn alt" style="padding:3px 10px;font-size:12px;flex:none" data-act="tab" data-t="${i.tab}">Open</button>` : ''}</label>`;
function todo() {
  const done = todoDone(), all = todoTotal();
  return `<div class="card"><h2>${C.todoTitle || 'To study'}</h2><p class="mut">${C.todoNote || ''} ${done}/${all} done.</p><div class="bar"><i style="width:${all ? 100 * done / all : 0}%"></i></div></div>` +
    (S.auto.length ? `<div class="card"><h2>Added from your mock exams <span class="mut">· ${S.auto.filter(i => S.todo[i.id]).length}/${S.auto.length} done</span></h2>
      <p class="mut">One item per objective you missed. Missing it again in a later mock un-ticks it.</p>${S.auto.map(todoRow).join('')}</div>` : '') +
    TODO.map((g, n) => `<div class="card"><h2>${n + 1}. ${g.title} ${g.time ? `<span class="mut">· ${g.time}</span>` : ''}</h2>${g.why ? `<p class="mut">${g.why}</p>` : ''}${g.items.map(todoRow).join('')}</div>`).join('');
}
function objectives() {
  return UNITS.map(l => `<div class="card"><h2>${C.unitWord || 'Lecture'} ${l}: ${unit(l)}</h2>` + LOS.filter(x => x.lec === l).map(x => { const s = lo(x.id), v = pct(s.r, s.w);
    return `<div class="lo"><div class="t"><b>${x.id}</b> <span class="s">${x.type}</span><br>${x.text}<div class="s">${v == null ? 'not practiced' : `${s.r} right · ${s.w} wrong (${v}%)`}</div></div>
      <div class="conf">${[['1', 'Not yet'], ['2', 'Shaky'], ['3', 'Got it']].map(([c, t]) => `<button class="c${c} ${s.c == c ? 'on' : ''}" data-act="conf" data-id="${x.id}" data-c="${c}">${t}</button>`).join('')} <button class="btn alt" style="padding:3px 10px;font-size:12px" data-act="lo" data-id="${x.id}">Practice</button></div></div>`; }).join('') + '</div>').join('') +
    `<footer><button data-act="reset">Reset all progress</button></footer>`;
}

function render() {
  $('#nav').innerHTML = [['home', 'Home'], ['todo', 'To study'], ['practice', 'Practice'], ['exam', 'Mock exam'], ['cards', 'Cards'], ['book', BOOK && BOOK.tab || 'Book'], ['obj', 'Objectives']].filter(([t]) => has(t)).map(([t, n]) =>
    `<button class="${ui.tab === t ? 'on' : ''}" data-act="tab" data-t="${t}">${n}${t === 'cards' && dueCards().length ? `<span class="n">${dueCards().length}</span>` : ''}</button>`).join('');
  ui.shown = [];
  $('#app').innerHTML = {home, todo, practice, exam, cards, book, obj: objectives}[ui.tab]();
}

// Turn a finished mock into study items: one per missed objective (primary objective of each missed question),
// with the course's fix tip / reading / sample + book problems and one worked example the student missed.
function addToStudy() {
  const E = ui.exam, by = {}, st = C.study || {};
  E.qs.forEach((p, i) => { const id = p.lo[0], b = by[id] || (by[id] = {n: 0, w: 0, p: null}); b.n++; if (E.ans[i] !== p.correct) { b.w++; b.p = b.p || p; } });
  let added = 0, updated = 0;
  Object.entries(by).filter(([, b]) => b.w).forEach(([id, b]) => {
    const o = LOS.find(l => l.id === id), s = st[id] || {}, row = (BOOK && BOOK.rows[o.lec]) || [];
    const read = s.read || row[0], sp = s.sp || row[1], refs = [read && 'Read ' + read, sp, s.book && 'Book problems ' + s.book].filter(Boolean).join(' · ');
    const text = `<b>${id}</b> ${o.text} <span class="mut">— missed ${b.w} of ${b.n} on your last mock.</span>` + (s.tip ? `<br><b>Fix:</b> ${s.tip}` : '') +
      (refs ? `<br><span class="mut">${refs}</span>` : '') +
      `<details style="margin-top:4px"><summary class="mut" style="cursor:pointer">The question you missed</summary><div class="qt" style="margin:6px 0">${b.p.q}</div><div class="steps">${b.p.steps}</div></details>`;
    const it = {id: 'a-' + id, lo: id, text, tab: s.book ? 'book' : ''}, k = S.auto.findIndex(a => a.id === it.id);
    if (k >= 0) { S.auto[k] = it; S.todo[it.id] = 0; updated++; } else { S.auto.push(it); added++; }
  });
  save(); return [added, updated];
}
const plain = h => h.replace(/<[^>]+>/g, '');
function finish() {
  const E = ui.exam; E.done = true; E.score = 0;
  E.qs.forEach((p, i) => { const ok = E.ans[i] === p.correct; if (ok) E.score++; record(p, ok); });
  S.exams.push({t: Date.now(), score: E.score, n: E.qs.length}); save();
}
function act(a, d) {
  switch (a) {
    case 'tab': ui.tab = d.t; if (d.t === 'practice' && !ui.p) nextP(); if (d.t === 'cards') { ui.card = null; ui.cram = false; } break;
    case 'lec': ui.lec = +d.l; ui.lo = ''; ui.queue = false; nextP(); break;
    case 'lo': ui.lo = d.id; ui.lec = 0; ui.queue = false; ui.tab = 'practice'; nextP(); break;
    case 'missed': case 'flagged': { const q = a === 'missed' ? 'missed' : 'flag';
      if (!S[q].length) { alert(q === 'flag' ? 'Nothing flagged yet — tap ⚑ Flag on any question to save it here.' : 'Your missed queue is empty — nothing to redo yet.'); return; }
      ui.queue = q; ui.tab = 'practice'; nextP(); break; }
    case 'flag': { const p = ui.shown[+d.k], i = S.flag.findIndex(f => f.q === p.q);
      if (i >= 0) S.flag.splice(i, 1); else S.flag.push(p); save(); break; }
    case 'pick':
      if (ui.tab === 'exam') { ui.exam.ans[ui.exam.i] = +d.i; break; }
      if (ui.sel != null) return; ui.sel = +d.i; record(ui.p, ui.sel === ui.p.correct); break;
    case 'next': nextP(); break;
    case 'conf': { const s = S.lo[d.id] || (S.lo[d.id] = {c: 0, r: 0, w: 0}); s.c = +d.c; save(); break; }
    case 'examStart': {
      const qs = [], seen = new Set();
      C.exam.blueprint.forEach(([l, n]) => { for (let i = 0; i < n; i++) { let p, t = 0; do { p = makeProblem({lec: l}); } while (seen.has(p.q) && ++t < 30); seen.add(p.q); qs.push(p); } });
      for (let i = qs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [qs[i], qs[j]] = [qs[j], qs[i]]; }
      ui.note = ''; ui.exam = {qs, ans: [], i: 0, end: Date.now() + C.exam.minutes * 60e3, done: false}; ui.tab = 'exam'; break; }
    case 'jump': ui.exam.i = +d.i; break;
    case 'submit': { const un = ui.exam.qs.length - ui.exam.ans.filter(x => x != null).length; if (un && !confirm(`${un} question(s) unanswered. Submit anyway?`)) return; finish(); break; }
    case 'tcheck': S.todo[d.id] = S.todo[d.id] ? 0 : 1; save(); break;
    case 'addstudy': { const [a, u] = addToStudy(); ui.note = ''; ui.tab = 'todo'; window.scrollTo(0, 0); break; }
    case 'copyres': { const E = ui.exam, txt = JSON.stringify({course: C.course, score: `${E.score}/${E.qs.length}`, questions: E.qs.map((p, i) => ({unit: unit(p.lec), objectives: p.lo, question: plain(p.q), options: p.opts.map(plain), correct: 'ABCDE'[p.correct], chosen: E.ans[i] == null ? 'blank' : 'ABCDE'[E.ans[i]], worked: plain(p.steps)}))}, null, 1);
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { ui.note = 'Copied. Paste it into Claude Code and ask: “analyze my mock exam and tell me what to study.”'; render(); }, () => { ui.note = 'Your browser blocked copying — try again from the page you opened by double-clicking index.html.'; render(); });
      return; }
    case 'bshow': ui.open = ui.open === d.id ? null : d.id; break;
    case 'bmark': S.book[d.id] = S.book[d.id] == d.v ? 0 : +d.v; save(); break;
    case 'flip': ui.flip = true; break;
    case 'got': case 'miss': {
      const c = ui.card, s = S.cards[c.id] || {box: 1}, box = a === 'got' ? Math.min(5, s.box + 1) : 1;
      S.cards[c.id] = {box, due: Date.now() + (a === 'got' ? INT[box - 1] * 3600e3 : 60e3)}; save(); nextCard(); break; }
    case 'cram': ui.cram = !ui.cram; ui.card = null; nextCard(); break;
    case 'reset': if (confirm('Erase all progress, ratings, cards and exam history?')) { S.lo = {}; S.cards = {}; S.missed = []; S.exams = []; S.book = {}; S.flag = []; S.todo = {}; S.auto = []; save(); ui.p = null; ui.exam = null; } break;
  }
  render();
}
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) act(b.dataset.act, b.dataset); });
setInterval(() => { // exam timer + home countdown; avoid re-rendering mid-answer
  const E = ui.exam;
  if (ui.tab === 'exam' && E && !E.done) { const left = Math.round((E.end - Date.now()) / 1000); if (left <= 0) { finish(); render(); } else { const t = $('#tm'); if (t) t.textContent = fmtT(left); } }
  else if (ui.tab === 'home' && new Date().getSeconds() === 0) render();
}, 1000);
render();
})();

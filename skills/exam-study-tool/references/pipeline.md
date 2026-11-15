# Pipeline gotchas

Every item here cost real time on the first build. Read before starting the matching step.

## Brightspace (mcp__brightspace__*)

- **"A sign-in is already running in another process."** A stale headless Chrome from an earlier attempt is mid-login. Wait and retry once; if it persists, check for `chrome-headless-shell` processes and ask the user before killing anything. Do not spam retries.
- **`get_course_content` output is enormous** (~140k chars for one course). It gets written to a tool-result file. `grep` that file for module titles (`Exam`, `Objectives`, `Syllabus`, `Textbook`) and `Read` only the matching line ranges. Never re-fetch the whole tree.
- **Course content JSON shape**: modules nest under `children`; files are `{type:"topic", topicType:"file", topicId, title}`. `topicId` is what `download_file` needs. Module `description` fields often hold the real exam logistics (dates, rooms, review sessions) — read them.
- **Most files are posted twice**, once as `.docx` and once as `.pdf`, with adjacent topic ids and identical titles. Download both; the tool names the file by whatever `customFilename` you pass, so a `.docx` saved as `.pdf` will not open. Check the returned `mimeType` and rename.
- **Announcements carry the corrections** (room changes, format clarifications, "no pre-rec quiz this week"). Always pull them; they can contradict a stale syllabus.
- **Ask where to save before downloading** — the tool requires it.

## Reading PDFs

- `Read` on a PDF needs poppler for page rendering, which may not be installed. **pymupdf works** and is the reliable path (`import pymupdf`).
- **Word files extract cleanly without Office**: unzip the `.docx` and strip tags from `word/document.xml` (`</w:p>` → newline). Often easier than the PDF twin.
- **Check the edition/printing before trusting any page number.** Compare the title page against what the syllabus requires.
- **Printed page ≠ PDF page.** Compute the offset and verify it on 2–3 pages — it can shift between chapters (front matter, inserts).
- **Two-column pages come out in the wrong order.** Text extraction may emit right-column content before the left column continues, which silently splices unrelated sentences together. Two defenses: (1) sort blocks into columns (`page.get_text('blocks')`, split on `x0 < width/2`, sort each by `y`), (2) never trust a "longest increasing sequence" filter over numbered items — a page break will drop real items. Prefer looking up each wanted item by its own number.
- **Numbers in body text masquerade as item numbers.** "4.40 g CO₂" inside answer 3.87 looks exactly like answer marker 4.40. Require a marker to be followed by `(` or a non-lowercase token.
- **Scanned/OCR textbooks** (older editions) produce mangled text: `0,327` for `0.327`, `H,0` for `H₂O`. Don't build question data from OCR text. Use page references instead, and say so.
- **Always print every extracted item and read it** before shipping. Spills and mangled formulas are obvious on inspection and invisible to a parser.

## Building the excerpt PDF

`pymupdf`: `out.insert_pdf(src, from_page=a-1, to_page=b-1)` per range, `out.set_toc([[1, title, page], ...])`, save with `garbage=4, deflate=True`. Include, per unit: the reading sections, the chapter review guide (it holds the follow-up problem solutions), the problems pages, and the answers appendix. A 1,200-page book reduces to ~160 pages.

## Verifying in the browser

- **The Chrome extension cannot open `file://` URLs.** Serve the parent folder (`python -m http.server 8765 --bind 127.0.0.1`, run in background) and open `http://127.0.0.1:8765/study-tool/index.html`. Serve the **parent** so relative links to `../*.pdf` resolve.
- **`file://` and `http://127.0.0.1` have separate localStorage.** Progress does not transfer. Pick one for the user (double-clicking `index.html` is the durable one, since the server dies with the session) and say so explicitly.
- **Never trigger `confirm()`/`alert()` in a headless run** — the dialog blocks the page and the run hangs forever. Override `window.confirm = () => true` before driving, or avoid those paths.
- Driving the UI from `javascript_tool` by synthesizing `data-act` clicks is fast and reliable:
  `const c=(a,d={})=>{const el=document.createElement('button');el.dataset.act=a;Object.assign(el.dataset,d);document.body.appendChild(el);el.click();el.remove();}`
- Screenshots can time out on a backgrounded tab; `get_page_text` and returning a JSON summary string from `javascript_tool` are more dependable. Long JS return values are sometimes filtered — return a compact object.
- **Protect the user's real progress.** localStorage is per-origin, so the origin you test on (`http://127.0.0.1:PORT`) may or may not be the one the user actually uses (double-clicking `index.html` is `file://`, a separate store). You cannot tell which from outside. So: snapshot first (`sessionStorage.setItem('snap', localStorage.getItem(KEY) || '')`), drive the UI, then restore from the snapshot. Never `removeItem` the key on sight. If you find pre-existing data, read `exams`/`flag`/`missed` and compare with what you did — only your own test entries justify a wipe. (On the first build a blind wipe was nearly this mistake: the page reported prior progress, which turned out to be leftover test data, but it could have been the user's.)
- **Clean up**: restore the snapshot, close tabs you opened, stop the background server (`TaskStop` on its id).

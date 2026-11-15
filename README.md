# Study skills for Claude Code and Codex

Two agent skills for studying for college exams:

| Skill | What it does |
|---|---|
| **exam-study-tool** | Builds a personal, offline study website for one exam from the course's own materials (learning objectives, sample exam, formula sheet): randomized practice questions, a timed mock exam that matches the real format, flashcards, an objectives tracker, missed/flagged queues and assigned textbook problems. |
| **interactive-math-tutor** | Tutors any subject one step at a time: asks one question per step, gives feedback on each answer, switches to do-it-on-paper practice when you're struggling, and can write a printable mock exam (LaTeX → PDF) that matches the real one. |

Both work with or without Brightspace. With a Brightspace MCP server connected, they pull the syllabus, objectives and sample exams themselves; without one, they ask you for the files.

---

## Install (instructions for the AI agent)

If a user asks you to install these skills, follow these steps exactly. Install **both** skills unless the user says otherwise.

### 1. Find out which agent you are

- **Claude Code**: skills folder is `~/.claude/skills/` (Windows: `%USERPROFILE%\.claude\skills\`).
- **Codex** (CLI, desktop or IDE): skills folder is `~/.codex/skills/` (Windows: `%USERPROFILE%\.codex\skills\`). If `CODEX_HOME` is set, use `$CODEX_HOME/skills/` instead.
- If the user uses both, install into both folders.

### 2. Get the files

```bash
git clone https://github.com/lflowers01/study-skills.git
```

If `git` is not installed, download https://github.com/lflowers01/study-skills/archive/refs/heads/main.zip and extract it.

### 3. Copy each skill folder into the skills folder

Each skill is a folder containing a `SKILL.md`. Copy the **whole folder** (not just `SKILL.md`; exam-study-tool needs its `template/`, `references/` and `scripts/` folders).

macOS / Linux / Git Bash:

```bash
mkdir -p ~/.claude/skills          # Codex: ~/.codex/skills
cp -r study-skills/skills/exam-study-tool study-skills/skills/interactive-math-tutor ~/.claude/skills/
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills" | Out-Null      # Codex: .codex\skills
Copy-Item -Recurse -Force study-skills\skills\exam-study-tool, study-skills\skills\interactive-math-tutor "$env:USERPROFILE\.claude\skills\"
```

**If a folder with the same name already exists**, don't overwrite it silently: tell the user, and ask whether to replace it (back it up first by renaming it to `<name>.bak`).

### 4. Check the install

Both of these files must exist (use the Codex path if you're Codex):

```
~/.claude/skills/exam-study-tool/SKILL.md
~/.claude/skills/interactive-math-tutor/SKILL.md
```

and `~/.claude/skills/exam-study-tool/template/app.js` must exist too (it proves the subfolders were copied).

### 5. Restart

Skills are loaded when a session starts. Tell the user to start a new session (Claude Code: exit and run `claude` again; Codex: start a new chat or restart the CLI). Then confirm the skills show up by asking the agent "what skills do you have?" — both `exam-study-tool` and `interactive-math-tutor` should be listed.

### 6. Optional extras (install only if the user wants that feature)

| Needed for | What | Check |
|---|---|---|
| exam-study-tool: running its self-test | Node.js 18+ | `node --version` |
| exam-study-tool: pulling course files automatically | a Brightspace MCP server such as [`brightspace-mcp-server`](https://www.npmjs.com/package/brightspace-mcp-server) (Purdue students: `npx -y brightspace-mcp-server@latest setup --purdue`; others: follow its README). The user signs in themselves; never ask for or type their password. | the agent has `brightspace` tools |
| exam-study-tool: extracting textbook problems | Python 3 + `pip install pymupdf` | `python -c "import pymupdf"` |
| interactive-math-tutor: printable mock exams | a LaTeX compiler, e.g. [tectonic](https://tectonic-typesetting.github.io/) | `tectonic --version` |

Nothing else is required. Both skills run without any of these and say what's missing when a step needs it.

### 7. Tell the user how to use them

Example prompts:

- "Build me a study tool for my CHM 115 Exam 2." → exam-study-tool
- "I have a calc exam Friday, help me study." → exam-study-tool
- "Tutor me through the questions I missed on my last exam, step by step." → interactive-math-tutor
- "Make me a printable practice exam for MA 162." → interactive-math-tutor

---

## Notes

- **Claude Code** gets the full experience: interactive answer cards (via the `visualize` widget tool) and the built-in browser.
- **Codex and other agents**: each `SKILL.md` has a "Codex and other agents" section. The tutor asks questions as plain text with lettered options, and the study site works the same everywhere because it's plain HTML/JS files.
- The study site keeps progress in the browser (`localStorage`). Opening it by double-clicking `index.html` and opening it through a local web server are separate, so pick one.
- `template/config.example.js` and `template/SPEC.example.md` are a real worked example (a general chemistry exam). Copy them and replace every value for your own course.

## Uninstall

Delete the two folders from the skills folder(s) (`~/.claude/skills/` and/or `~/.codex/skills/`).

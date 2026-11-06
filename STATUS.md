# STATUS.md — course-deadline-board-webapp

Built: November 6, 2026, by Asdale Dynamics, LLC.

## What was built

A single-file, offline, zero-dependency web app that maps a semester's deadlines on one board:

- **Courses as columns** — add, rename (click a course name), delete (with confirm; removes its assignments), color-coded.
- **Assignment cards** — title, weight (% of course grade), status (not started / in progress / submitted / graded, cycled in one click; submitting stamps the timestamp), due date/time, and a **due-date bar** showing how much of the window to the deadline has elapsed, colored by urgency.
- **Chips** — countdown chip (calm → gold within 48h → red overdue), **late** chip (auto when past the effective deadline, or submitted late), **grace** chip (grace period / extension in hours, which extends the effective deadline in all math), weight chip.
- **Next-two-weeks focus view** — one button switches to a triage list grouped into Overdue / Next 7 days / Days 8–14, sorted by effective due date.
- **Syllabus touch-up checklist** — 5 starter items (weights logged, late policy, grace rules, exam date, dues-vs-syllabus), your own items per course or General, progress bar and counter.
- **End-of-term summary export** — one-click Markdown (`term-summary.md`): per-course weight coverage, submitted/graded counts, weighted score on graded work, late/grace counts, untracked-weight syllabus warnings, and a whole-term snapshot.
- **Backup / restore** — JSON backup download and import for moving between machines/profiles.
- **Term & data panel** — term start/end dates (term progress bar + due-date bar anchoring) and a full reset.
- **Local-first** — all state in `localStorage` (key `cdl-board-v1`), populated via a "Load sample semester" button or the empty state; no accounts, no network calls, no secrets or personal data.

## How to run

Open `index.html` in any modern browser (double-click; works from `file://`). No server, no install, no internet needed.

## Tests (for countdown and weight math)

- `test/core.test.mjs` — 30 tests using Node's built-in runner (`node --test`, zero dependencies). It extracts the marked core block (`CORE-START`/`CORE-END`) from `index.html` itself and tests the exact shipped code: countdown formatting and 48h urgency boundary, grace/effective-due math, due-bar fractions and clamping, weight sums, weighted scores, untracked weight, late-flag rules (incl. submitted-late and graded-never-late), and the focus window.
- Run with `npm test` (or `node --test test/`). Node 18+.

## Verification results

- `npm test` → **30/30 pass, 0 fail** (Node v20.19.2).
- Inline script syntax-checked (`node --check`) → clean.
- Structure check of required UI hooks/elements → present.
- Headless Chrome (google-chrome) smoke test of the real page: initial empty state renders, "Load sample semester" creates 3 courses / 9 cards, 2 late chips, 1 grace chip, focus view shows 5 rows and toggles back to board, summary export content correct, localStorage persistence confirmed (9 assignments), checklist add works, edit dialog loads the right assignment, one-click status cycle submits, delete removes a card. Two bugs found in smoke testing were fixed (card edit/delete buttons were not resolving their assignment id) and re-verified.

## Known gaps

- Countdown of 1–24h overdue formats as hours ("30h 5m late"); days+hours above 24h.
- Due-date bars need term start (or fall back to 28 days before the due date); term dates live under "Term & data".
- Editing an assignment's due time after submission does not re-stamp submission; lateness uses the recorded submitted-at value.
- Reordering columns/cards is not supported; courses appear in creation order.
- No on-screen "overall GPA-style" projection beyond the per-course weighted score in the summary export (deliberate — grade scales vary).
- Import replaces the whole board by design; there is no merge.
- Accessibility tested with keyboard/native dialogs and ARIA labels, but not with a full screen reader audit.

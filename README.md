# Course Deadline Board

Map a whole semester's deadlines on one board. Courses are columns, assignments are cards with their course weight, status, and a due-date bar — plus late-work and grace chips, a next-two-weeks focus view, a syllabus touch-up checklist, and an end-of-term summary you can export as Markdown.

Built local-first by **Asdale Dynamics, LLC** (copyright (c) 2026 Asdale Dynamics, LLC): no accounts, no network calls, no dependencies — one HTML file that runs from `file://`. Everything you type is stored in your browser's localStorage on your own machine.

Different tools for different jobs: this one is for **students**. If you are tracking job applications instead, see job-application-tracker-webapp; nursing students logging clinical hours should look at clinical-rotation-log-webapp.

## Run it

Open `index.html` in any modern browser (double-click it, or File > Open). That's it — it works from `file://` with no install, no server, and no internet connection.

## What's on the board

- **Courses as columns.** Add, rename (click a course name), recolor by palette, or delete a course (deletes its assignments, with a confirm).
- **Assignment cards.** Each card shows its title, weight (% of the course grade), due date/time, and status pill (not started > in progress > submitted > graded, cycled by clicking; submitting stamps the time so lateness is recorded automatically when you submit past the deadline).
- **Countdown & due-date bars.** Each card has a countdown chip (color-coded: calm / within 48h / overdue) and a bar showing how much of the window to that deadline has elapsed — colored by urgency.
- **Late-work and grace chips.** A red `late` chip appears when work is past its effective deadline (or was submitted late); a gold `grace` chip shows a grace period / extension in hours, which extends the effective deadline in all the math.
- **Next-2-weeks focus view.** One button switches the board to an overdue / next 7 days / days 8–14 triage list, sorted by effective due date.
- **Syllabus touch-up checklist.** A startup checklist (weights logged, late policy confirmed, exam date checked, etc.) with per-course or General items and a progress bar.
- **End-of-term summary export.** One-click Markdown summary: per-course weight coverage, submitted/graded counts, weighted score on graded work, late and grace counts, untracked weight reminders, and a term snapshot. Suitable for a retro or a syllabus-debrief.
- **Backup / restore.** Export the whole board as JSON and re-import it on another machine or browser profile — that's the "sync" story, deliberate and simple.

## Data stays with you

State lives in `localStorage` under the key `cdl-board-v1`; nothing is ever transmitted anywhere. "Term & data" in the header holds term start/end dates (used for the term progress bar and due-date bars) and a reset button.

## Tests

The countdown, grace, bar, and weight math lives in a marked core block inside `index.html`; the tests extract and run that exact code:

```sh
npm test        # runs: node --test test/
```

Use Node 18 or newer. Zero dependencies.

## Accessibility & style

Keyboard-friendly (native dialogs, focus-visible outlines), plain-language labels, and a warm, low-contrast-friendly dark theme. Works down to phone widths.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Asdale Dynamics, LLC.

From Dylan Asdale's *The Massive AI Manual* family of practical tools: local-first, beginner-friendly, no accounts. Find more at dylanasdale.github.io.

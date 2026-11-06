import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const m = html.match(/\/\* ===CORE-START=== \*\/([\s\S]*?)\/\* ===CORE-END=== \*\//);
if (!m) throw new Error("CORE block not found in index.html");

const CORE = vm.runInNewContext(m[1] + "\nCORE", vm.createContext({}));

const now = Date.now();
const OFF = (base, ms) => new Date(base + ms).toISOString();

test("core block was extracted from index.html", () => {
  assert.equal(typeof CORE.fmtCountdown, "function");
  assert.equal(typeof CORE.weightedScore, "function");
});

// --- countdown math ---

test("fmtCountdown: 2 days 1 hour out reads '2d 1h', urgency ok (2d = 48h is the soon boundary)", () => {
  const r = CORE.fmtCountdown(OFF(now, 2 * CORE.DAY + CORE.HOUR), now);
  assert.equal(r.text, "2d 1h");
  assert.equal(r.urgency, "ok");
});

test("fmtCountdown: 6 days 5 hours out reads '6d 5h'", () => {
  const r = CORE.fmtCountdown(OFF(now, 6 * CORE.DAY + 5 * CORE.HOUR), now);
  assert.equal(r.text, "6d 5h");
  assert.equal(r.urgency, "ok");
});

test("fmtCountdown: 90 minutes out reads '1h 30m', urgency soon", () => {
  const r = CORE.fmtCountdown(OFF(now, 90 * CORE.MIN), now);
  assert.equal(r.text, "1h 30m");
  assert.equal(r.urgency, "soon");
});

test("fmtCountdown: under an hour reads minutes only", () => {
  const r = CORE.fmtCountdown(OFF(now, 5 * CORE.MIN), now);
  assert.equal(r.text, "5m");
  assert.equal(r.urgency, "soon");
});

test("fmtCountdown: boundary at exactly 48h is 'soon', at 48h+1m is 'ok'", () => {
  assert.equal(CORE.fmtCountdown(OFF(now, 48 * CORE.HOUR), now).urgency, "soon");
  assert.equal(CORE.fmtCountdown(OFF(now, 48 * CORE.HOUR + CORE.MIN), now).urgency, "ok");
});

test("fmtCountdown: zero ms reads '0m' and is not late", () => {
  const r = CORE.fmtCountdown(OFF(now, 0), now);
  assert.equal(r.text, "0m");
  assert.equal(r.urgency, "soon");
  assert.equal(r.ms, 0);
});

test("fmtCountdown: 3 days overdue reads '3d 0h late', urgency late", () => {
  const r = CORE.fmtCountdown(OFF(now, -3 * CORE.DAY), now);
  assert.equal(r.text, "3d 0h late");
  assert.equal(r.urgency, "late");
});

test("fmtCountdown: 30 hours overdue reads '1d 6h late', urgency late", () => {
  const r = CORE.fmtCountdown(OFF(now, -30 * CORE.HOUR), now);
  assert.equal(r.text, "1d 6h late");
  assert.equal(r.urgency, "late");
});

// --- effective due / grace math ---

test("effDue: no grace flag returns the plain due time", () => {
  const a = { due: OFF(now, 10 * CORE.HOUR), grace: false, graceHours: 48 };
  assert.equal(CORE.effDue(a), now + 10 * CORE.HOUR);
});

test("effDue: grace true with explicit graceHours extends the deadline", () => {
  const a = { due: OFF(now, 10 * CORE.HOUR), grace: true, graceHours: 24 };
  assert.equal(CORE.effDue(a), now + 34 * CORE.HOUR);
});

test("effDue: grace true with no graceHours defaults to 48h", () => {
  const a = { due: OFF(now, 10 * CORE.HOUR), grace: true };
  assert.equal(CORE.effDue(a), now + 58 * CORE.HOUR);
});

// --- due-date bar math ---

test("dueBarFrac: halfway between term start and due", () => {
  const start = 0, due = 10;
  assert.equal(CORE.dueBarFrac(start, due, 5), 0.5);
});

test("dueBarFrac: clamps to 0 before window and 1 after due", () => {
  assert.equal(CORE.dueBarFrac(0, 10, -1), 0);
  assert.equal(CORE.dueBarFrac(0, 10, 15), 1);
});

test("dueBarFrac: start after due is degenerate, only 0 or 1", () => {
  assert.equal(CORE.dueBarFrac(10, 5, 20), 1);
  assert.equal(CORE.dueBarFrac(10, 5, 3), 0);
});

// --- weight math ---

test("sumWeights: adds weights of all items", () => {
  assert.equal(CORE.sumWeights([{ weight: 15 }, { weight: 22.5 }, { weight: 10 }]), 47.5);
});

test("sumWeights: skips zero and negative weights", () => {
  assert.equal(CORE.sumWeights([{ weight: 20 }, { weight: 0 }, { weight: -5 }]), 20);
});

test("sumWeights: empty list is 0", () => {
  assert.equal(CORE.sumWeights([]), 0);
});

test("weightedScore: 20% at 100 + 30% at 60 = 76", () => {
  const r = CORE.weightedScore([{ weight: 20, pct: 100 }, { weight: 30, pct: 60 }]);
  assert.ok(Math.abs(r - 76) < 1e-9);
});

test("weightedScore: items without a score are ignored", () => {
  const r = CORE.weightedScore([{ weight: 20, pct: 100 }, { weight: 30, pct: null }]);
  assert.equal(r, 100);
});

test("weightedScore: weights of 0 or less are ignored", () => {
  const r = CORE.weightedScore([{ weight: 0, pct: 100 }, { weight: -10, pct: 40 }, { weight: 50, pct: 80 }]);
  assert.equal(r, 80);
});

test("weightedScore: nothing scored returns null", () => {
  assert.equal(CORE.weightedScore([]), null);
  assert.equal(CORE.weightedScore([{ weight: 20, pct: null }]), null);
});

test("weightedScore: untracked weight = 100 - logged weights", () => {
  const logged = CORE.sumWeights([{ weight: 15 }, { weight: 22.5 }]);
  assert.equal(100 - logged, 62.5);
});

// --- late flag ---

test("isLate: not submitted and past effective due = late", () => {
  const a = { due: OFF(now, -2 * CORE.HOUR), grace: false, status: "todo", submittedAt: null };
  assert.equal(CORE.isLate(a, now), true);
});

test("isLate: within grace window is not late", () => {
  const a = { due: OFF(now, -1 * CORE.HOUR), grace: true, graceHours: 24, status: "todo", submittedAt: null };
  assert.equal(CORE.isLate(a, now), false);
});

test("isLate: submitted before effective due = on time", () => {
  const a = { due: OFF(now, 0), grace: false, status: "submitted", submittedAt: OFF(now, -CORE.HOUR) };
  assert.equal(CORE.isLate(a, now), false);
});

test("isLate: submitted after effective due = late", () => {
  const a = { due: OFF(now, 0), grace: false, status: "submitted", submittedAt: OFF(now, CORE.MIN) };
  assert.equal(CORE.isLate(a, now), true);
});

test("isLate: graded work is never flagged late", () => {
  const a = { due: OFF(now, 0), grace: false, status: "graded", submittedAt: OFF(now, 5 * CORE.DAY) };
  assert.equal(CORE.isLate(a, now), false);
});

// --- focus window ---

test("focusWindow: keeps todo due within window, drops graded/submitted/far-future, overdue sorts first", () => {
  const items = [
    { id: "w", title: "in 20 days", due: OFF(now, 20 * CORE.DAY), status: "todo", grace: false },
    { id: "x", title: "overdue", due: OFF(now, -3 * CORE.DAY), status: "todo", grace: false },
    { id: "y", title: "due today", due: OFF(now, CORE.HOUR), status: "todo", grace: false },
    { id: "z", title: "graded", due: OFF(now, CORE.HOUR), status: "graded", grace: false },
    { id: "q", title: "submitted", due: OFF(now, 2 * CORE.DAY), status: "submitted", grace: false }
  ];
  const got = CORE.focusWindow(items, now, 14);
  assert.deepEqual(got.map(a => a.id), ["x", "y"]);
});

test("focusWindow: submitted-late counts as done and is excluded", () => {
  const items = [
    { title: "was late", due: OFF(now, -CORE.DAY), status: "submitted", grace: false, submittedAt: OFF(now, CORE.MIN) }
  ];
  assert.deepEqual(CORE.focusWindow(items, now, 14), []);
});

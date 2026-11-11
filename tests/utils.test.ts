import test from "node:test";
import assert from "node:assert/strict";
import {
  generateReferenceNo,
  addDays,
  isOverdue,
  daysUntil,
  percentage,
  truncate,
  parsePage,
  pluralise,
  normaliseWhitespace,
  maskEmail,
  buildSearchParams,
} from "../src/lib/utils";

test("reference numbers follow the KLG pattern with an unambiguous alphabet", () => {
  const reference = generateReferenceNo(new Date("2026-11-12T00:00:00.000Z"));
  assert.match(reference, /^KLG-2026-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  const suffix = reference.split("-")[2];
  assert.equal(suffix.includes("0"), false);
  assert.equal(suffix.includes("O"), false);
  assert.equal(suffix.includes("I"), false);
});

test("reference numbers are unique across a batch", () => {
  const batch = new Set(Array.from({ length: 500 }, () => generateReferenceNo()));
  assert.equal(batch.size, 500);
});

test("addDays keeps the time of day and handles month boundaries", () => {
  const start = new Date("2026-01-30T10:15:00.000Z");
  assert.equal(addDays(start, 3).toISOString(), "2026-02-02T10:15:00.000Z");
});

test("isOverdue ignores resolved cases and respects due dates", () => {
  assert.equal(isOverdue({ status: "RESOLVED", dueAt: "2000-01-01T00:00:00.000Z" }), false);
  assert.equal(isOverdue({ status: "IN_PROGRESS", dueAt: "2000-01-01T00:00:00.000Z" }), true);
  assert.equal(isOverdue({ status: "IN_PROGRESS", dueAt: "2999-01-01T00:00:00.000Z" }), false);
});

test("daysUntil rounds up to whole days", () => {
  const now = Date.now();
  assert.equal(daysUntil(new Date(now + 60 * 60 * 1000)), 1);
  assert.equal(daysUntil(new Date(now - 25 * 60 * 60 * 1000)), -1);
});

test("percentage guards against a zero total", () => {
  assert.equal(percentage(3, 4), 75);
  assert.equal(percentage(0, 0), 0);
  assert.equal(percentage(1, 3), 33);
});

test("truncate adds an ellipsis only when needed", () => {
  assert.equal(truncate("short text", 50), "short text");
  assert.equal(truncate("a".repeat(20), 10), `${"a".repeat(10)}…`);
});

test("parsePage falls back safely and clamps to the last page", () => {
  assert.equal(parsePage(undefined), 1);
  assert.equal(parsePage("0"), 1);
  assert.equal(parsePage("abc"), 1);
  assert.equal(parsePage("2"), 2);
  assert.equal(parsePage("9", 3), 3);
});

test("pluralise picks the right noun form", () => {
  assert.equal(pluralise(1, "grievance"), "1 grievance");
  assert.equal(pluralise(2, "grievance"), "2 grievances");
  assert.equal(pluralise(0, "child", "children"), "0 children");
});

test("normaliseWhitespace collapses repeated whitespace", () => {
  assert.equal(normaliseWhitespace("  a   b \n c  "), "a b c");
});

test("maskEmail hides most of the local part", () => {
  assert.equal(maskEmail("ananya@example.com"), "an****@example.com");
  assert.equal(maskEmail("not-an-email"), "not-an-email");
});

test("buildSearchParams drops empty values and keeps overrides", () => {
  const query = buildSearchParams(
    { status: "SUBMITTED", district: "Kollam", page: "2" },
    { page: undefined, priority: "HIGH" },
  );
  assert.equal(query, "?status=SUBMITTED&district=Kollam&priority=HIGH");
});

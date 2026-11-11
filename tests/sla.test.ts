import test from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES,
  DEMO_ACCOUNTS,
  DEPARTMENTS_SEED,
  DEPARTMENT_BY_CODE,
  DEPARTMENT_DEFAULT_CATEGORY,
  DEPARTMENT_KEYWORDS,
  DISTRICTS,
  PRIORITY_META,
  ROLE_META,
  SLA_DAYS,
  STATUS_META,
} from "../src/lib/constants";

test("the workflow exposes exactly the five required statuses", () => {
  assert.deepEqual(Object.keys(STATUS_META).sort(), [
    "IN_PROGRESS",
    "REOPENED",
    "RESOLVED",
    "SUBMITTED",
    "UNDER_REVIEW",
  ]);
  for (const meta of Object.values(STATUS_META)) {
    assert.ok(meta.label.length > 0);
    assert.ok(meta.description.length > 0);
    assert.match(meta.className, /bg-/);
  }
});

test("SLA windows tighten as priority rises", () => {
  assert.ok(SLA_DAYS.HIGH < SLA_DAYS.MEDIUM);
  assert.ok(SLA_DAYS.MEDIUM < SLA_DAYS.LOW);
  assert.equal(SLA_DAYS.HIGH, 3);
  assert.equal(SLA_DAYS.MEDIUM, 7);
  assert.equal(SLA_DAYS.LOW, 14);
});

test("priority metadata covers every SLA priority", () => {
  assert.deepEqual(Object.keys(PRIORITY_META).sort(), Object.keys(SLA_DAYS).sort());
  assert.equal(PRIORITY_META.HIGH.label, "High");
});

test("Kerala has fourteen districts without duplicates", () => {
  assert.equal(DISTRICTS.length, 14);
  assert.equal(new Set(DISTRICTS).size, 14);
  assert.ok(DISTRICTS.includes("Kasaragod"));
  assert.ok(DISTRICTS.includes("Thiruvananthapuram"));
});

test("every seeded department maps to a valid category", () => {
  const categories = new Set<string>(CATEGORIES);
  for (const department of DEPARTMENTS_SEED) {
    const category = DEPARTMENT_DEFAULT_CATEGORY[department.code];
    assert.ok(category, `missing default category for ${department.code}`);
    assert.ok(categories.has(category), `invalid category for ${department.code}`);
  }
});

test("department codes, keywords and lookup table stay in sync", () => {
  const codes = DEPARTMENTS_SEED.map((department) => department.code);
  assert.equal(new Set(codes).size, codes.length);
  assert.deepEqual(Object.keys(DEPARTMENT_KEYWORDS).sort(), [...codes].sort());
  assert.deepEqual(Object.keys(DEPARTMENT_BY_CODE).sort(), [...codes].sort());
});

test("role metadata routes each role to its workspace", () => {
  assert.equal(ROLE_META.CITIZEN.home, "/citizen");
  assert.equal(ROLE_META.CMO_ADMIN.home, "/cmo");
  assert.equal(ROLE_META.OFFICER.home, "/officer");
});

test("demo accounts cover every role with unique emails", () => {
  assert.ok(DEMO_ACCOUNTS.length >= 4);
  const emails = DEMO_ACCOUNTS.map((account) => account.email);
  assert.equal(new Set(emails).size, emails.length);
  assert.ok(DEMO_ACCOUNTS.some((account) => account.email === "cmo@kerala.demo"));
  assert.ok(DEMO_ACCOUNTS.some((account) => account.role.includes("Officer")));
  assert.ok(DEMO_ACCOUNTS.some((account) => account.role === "Citizen"));
});

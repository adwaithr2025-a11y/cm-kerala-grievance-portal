import test from "node:test";
import assert from "node:assert/strict";
import { detectDuplicates, heuristicAnalysis } from "../src/lib/ai";

test("heuristic analysis routes a water complaint to the water authority", () => {
  const result = heuristicAnalysis({
    subject: "No drinking water for four days",
    description:
      "There has been no drinking water supply in our colony for four days. The pipeline near the junction is leaking and the water tank is empty.",
    district: "Ernakulam",
  });

  assert.equal(result.source, "fallback");
  assert.equal(result.departmentCode, "KWA");
  assert.equal(result.category, "Water Supply");
  assert.equal(result.priority, "MEDIUM");
  assert.match(result.summary, /Ernakulam/);
  assert.match(result.providerLabel, /fallback/i);
  assert.ok(result.confidence >= 0.55 && result.confidence <= 0.86);
});

test("heuristic analysis escalates life-safety complaints to HIGH", () => {
  const result = heuristicAnalysis({
    description:
      "The electricity transformer near our house has been sparking since morning. The KSEB meter box is damaged and there is a risk of electrocution for children.",
    district: "Thrissur",
  });

  assert.equal(result.departmentCode, "KSEB");
  assert.equal(result.category, "Electricity");
  assert.equal(result.priority, "HIGH");
  assert.match(result.rationale, /electrocution/i);
});

test("heuristic analysis marks suggestions as LOW priority", () => {
  const result = heuristicAnalysis({
    description:
      "This is a suggestion for a minor improvement to the portal information page when possible.",
  });

  assert.equal(result.priority, "LOW");
  assert.equal(result.departmentCode, "LSGD");
});

test("heuristic analysis falls back to the citizen category and Other routing", () => {
  const result = heuristicAnalysis({
    description:
      "We would like the decorative fountain near the town square to run on weekends.",
    category: "Transport",
  });

  assert.equal(result.departmentCode, "LSGD");
  assert.equal(result.category, "Transport");
  assert.equal(result.confidence, 0.32);
});

test("heuristic analysis summary is trimmed and never exceeds 280 characters", () => {
  const result = heuristicAnalysis({
    subject: "Long complaint",
    description: "Pipeline leaking badly near the junction and the road is flooded ".repeat(10),
  });

  assert.ok(result.summary.length <= 280);
  assert.ok(result.summary.endsWith("…"));
});

test("duplicate detection scores overlapping complaints and ignores resolved cases", () => {
  const description =
    "There has been no piped water supply in our ward for four days and the pipeline is leaking near the school.";
  const duplicates = detectDuplicates(description, [
    {
      referenceNo: "KLG-2026-AAAAAA",
      subject: "No piped water supply",
      description:
        "Our ward has had no piped water supply for four days; the pipeline is leaking near the school.",
      category: "Water Supply",
      status: "IN_PROGRESS",
      createdAt: "2026-11-01T09:00:00.000Z",
    },
    {
      referenceNo: "KLG-2026-BBBBBB",
      subject: "No piped water supply",
      description:
        "Our ward has had no piped water supply for four days; the pipeline is leaking near the school.",
      category: "Water Supply",
      status: "RESOLVED",
      createdAt: "2026-10-01T09:00:00.000Z",
    },
    {
      referenceNo: "KLG-2026-CCCCCC",
      subject: "Street light repair",
      description: "The street light outside the temple has been dark for a week.",
      category: "Electricity",
      status: "SUBMITTED",
      createdAt: "2026-11-02T09:00:00.000Z",
    },
  ]);

  assert.equal(duplicates.length, 1);
  assert.equal(duplicates[0].referenceNo, "KLG-2026-AAAAAA");
  assert.ok(duplicates[0].score >= 0.45);
});

test("duplicate detection returns at most three candidates sorted by score", () => {
  const base =
    "No water supply in the colony for four days, pipeline leaking and tank empty near the market.";
  const candidates = Array.from({ length: 5 }, (_, index) => ({
    referenceNo: `KLG-2026-${String(index).repeat(6)}`,
    subject: "No water supply",
    description: base,
    category: "Water Supply",
    status: "UNDER_REVIEW",
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
  }));

  const duplicates = detectDuplicates(base, candidates);
  assert.equal(duplicates.length, 3);
  assert.ok(duplicates.every((item, index) => index === 0 || duplicates[index - 1].score >= item.score));
});

test("duplicate detection needs enough signal to compare", () => {
  assert.deepEqual(detectDuplicates("water leak", []), []);
});

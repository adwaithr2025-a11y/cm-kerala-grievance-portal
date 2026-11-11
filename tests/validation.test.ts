import test from "node:test";
import assert from "node:assert/strict";
import {
  registerSchema,
  loginSchema,
  grievanceSubmitSchema,
  aiAnalyzeSchema,
  contactSchema,
  reopenSchema,
  feedbackSchema,
} from "../src/lib/validation";

test("registration accepts a valid citizen and normalises the email", () => {
  const result = registerSchema.parse({
    name: "Ananya Nair",
    email: "  Ananya@Example.COM ",
    mobile: "9847012345",
    password: "Demo@Citizen2026",
  });
  assert.equal(result.email, "ananya@example.com");
});

test("registration rejects weak passwords and invalid Indian mobiles", () => {
  const weak = registerSchema.safeParse({
    name: "Ananya",
    email: "ananya@example.com",
    mobile: "9847012345",
    password: "short",
  });
  assert.equal(weak.success, false);

  const digits = registerSchema.safeParse({
    name: "Ananya",
    email: "ananya@example.com",
    mobile: "9847012345",
    password: "abcdefgh",
  });
  assert.equal(digits.success, false);

  const mobile = registerSchema.safeParse({
    name: "Ananya",
    email: "ananya@example.com",
    mobile: "12345",
    password: "Demo@Citizen2026",
  });
  assert.equal(mobile.success, false);
});

test("login requires an email-shaped identifier", () => {
  assert.equal(loginSchema.safeParse({ email: "cmo@kerala.demo", password: "x" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success, false);
});

test("grievance submission enforces district, category and description length", () => {
  const base = {
    district: "Ernakulam",
    category: "Water Supply",
    subject: "No water for four days",
    description: "There has been no piped water supply in our ward for four days.",
  };
  assert.equal(grievanceSubmitSchema.safeParse(base).success, true);
  assert.equal(grievanceSubmitSchema.safeParse({ ...base, district: "Atlantis" }).success, false);
  assert.equal(grievanceSubmitSchema.safeParse({ ...base, description: "Too short" }).success, false);
});

test("grievance submission defaults priority and AI adoption flags", () => {
  const parsed = grievanceSubmitSchema.parse({
    district: "Kollam",
    category: "Healthcare",
    subject: "PHC without a doctor",
    description: "The primary health centre has had no doctor for two weeks and patients are turned away.",
  });
  assert.equal(parsed.priority, "MEDIUM");
  assert.equal(parsed.aiAdopted, false);
});

test("AI analysis requires at least twenty characters of complaint text", () => {
  assert.equal(aiAnalyzeSchema.safeParse({ description: "short" }).success, false);
  assert.equal(
    aiAnalyzeSchema.safeParse({ description: "A street light has been broken for three weeks." }).success,
    true,
  );
});

test("contact enquiries validate email and message length", () => {
  const valid = contactSchema.safeParse({
    name: "Test User",
    email: "test@example.com",
    subject: "Portal feedback",
    message: "The tracking timeline is easy to follow.",
  });
  assert.equal(valid.success, true);
  assert.equal(
    contactSchema.safeParse({
      name: "Test User",
      email: "bad",
      subject: "Hi",
      message: "short",
    }).success,
    false,
  );
});

test("reopen reasons must be substantive", () => {
  assert.equal(reopenSchema.safeParse({ reason: "Not fixed" }).success, false);
  assert.equal(
    reopenSchema.safeParse({ reason: "The temporary repair failed after two days." }).success,
    true,
  );
});

test("feedback ratings are coerced to an integer from 1 to 5", () => {
  const parsed = feedbackSchema.parse({ rating: "4", comments: "Good response" });
  assert.equal(parsed.rating, 4);
  assert.equal(feedbackSchema.safeParse({ rating: "6" }).success, false);
  assert.equal(feedbackSchema.safeParse({ rating: "0" }).success, false);
});

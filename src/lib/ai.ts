import {
  CATEGORIES,
  DEPARTMENT_BY_CODE,
  DEPARTMENT_DEFAULT_CATEGORY,
  DEPARTMENT_KEYWORDS,
  DEPARTMENTS_SEED,
  HIGH_PRIORITY_SIGNALS,
  LOW_PRIORITY_SIGNALS,
  type Category,
} from "./constants";
import { truncate } from "./utils";

export type AiPriority = "LOW" | "MEDIUM" | "HIGH";

export type DuplicateCandidate = {
  referenceNo: string;
  subject: string;
  status: string;
  createdAt: string;
  score: number;
};

export type AiAnalysis = {
  source: "llm" | "fallback";
  providerLabel: string;
  model: string | null;
  departmentCode: string | null;
  departmentName: string | null;
  category: Category;
  priority: AiPriority;
  summary: string;
  confidence: number;
  rationale: string;
  duplicates: DuplicateCandidate[];
  notice: string;
  elapsedMs: number;
};

export type AiAnalyzeRequest = {
  subject?: string;
  description: string;
  district?: string;
  category?: string;
};

const AI_NOTICE =
  "AI suggestions are advisory only. A citizen or CMO officer must review them before any official action is taken.";
const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "had",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how",
  "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its",
  "let", "put", "say", "she", "too", "use", "that", "with", "have", "this",
  "will", "your", "from", "they", "know", "want", "been", "good", "much",
  "some", "time", "very", "when", "come", "here", "just", "like", "long",
  "make", "many", "over", "such", "take", "than", "them", "well", "were",
  "what", "with", "near", "also", "into", "about", "there", "their", "would",
  "could", "should", "which", "these", "those", "please", "kindly", "request",
  "requesting", "sir", "madam", "complaint", "complaints", "issue", "issues",
  "problem", "problems", "government", "official", "officials", "kerala",
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0d00-\u0d7f\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

function keywordMatches(text: string, keyword: string): boolean {
  if (keyword.includes(" ")) return text.includes(keyword);
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(text);
}

function firstSentences(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  const clipped = clean.slice(0, limit);
  const lastStop = Math.max(clipped.lastIndexOf(". "), clipped.lastIndexOf("; "));
  if (lastStop > limit * 0.45) return clean.slice(0, lastStop + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clean.slice(0, lastSpace > 0 ? lastSpace : limit).trim()}…`;
}

export function detectDuplicates(
  description: string,
  candidates: {
    referenceNo: string;
    subject: string;
    description: string;
    category: string;
    status: string;
    createdAt: Date | string;
  }[],
): DuplicateCandidate[] {
  const targetTokens = new Set(tokenise(description));
  if (targetTokens.size < 4) return [];

  const scored = candidates
    .filter((candidate) => candidate.status !== "RESOLVED")
    .map((candidate) => {
      const candidateTokens = new Set(tokenise(`${candidate.subject} ${candidate.description}`));
      const intersection = [...targetTokens].filter((token) => candidateTokens.has(token));
      const union = new Set([...targetTokens, ...candidateTokens]);
      const jaccard = union.size === 0 ? 0 : intersection.length / union.size;
      const overlap = intersection.length / Math.min(targetTokens.size, Math.max(candidateTokens.size, 1));
      const score = Math.min(1, jaccard * 0.65 + overlap * 0.35);
      return {
        referenceNo: candidate.referenceNo,
        subject: candidate.subject,
        status: candidate.status,
        createdAt:
          typeof candidate.createdAt === "string"
            ? candidate.createdAt
            : candidate.createdAt.toISOString(),
        score: Math.round(score * 100) / 100,
      };
    })
    .filter((candidate) => candidate.score >= 0.45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored;
}

export function heuristicAnalysis(input: AiAnalyzeRequest): Omit<AiAnalysis, "duplicates" | "elapsedMs"> {
  const combined = `${input.subject ?? ""} ${input.description}`.toLowerCase();

  let bestCode: string | null = null;
  let bestHits = 0;
  let bestKeywords: string[] = [];

  for (const [code, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
    const hits = keywords.filter((keyword) => keywordMatches(combined, keyword));
    if (hits.length > bestHits) {
      bestHits = hits.length;
      bestCode = code;
      bestKeywords = hits;
    }
  }

  const highSignals = HIGH_PRIORITY_SIGNALS.filter((signal) =>
    keywordMatches(combined, signal),
  );
  const lowSignals = LOW_PRIORITY_SIGNALS.filter((signal) =>
    keywordMatches(combined, signal),
  );

  let priority: AiPriority = "MEDIUM";
  if (highSignals.length >= 2 || (highSignals.length >= 1 && /(collapse|electrocut|death|fire|outbreak|flood|child|hospital)/i.test(combined))) {
    priority = "HIGH";
  } else if (lowSignals.length > 0 && highSignals.length === 0) {
    priority = "LOW";
  }

  const category: Category =
    (bestCode ? DEPARTMENT_DEFAULT_CATEGORY[bestCode] : undefined) ??
    (input.category && (CATEGORIES as readonly string[]).includes(input.category)
      ? (input.category as Category)
      : "Other");

  const department = bestCode ? DEPARTMENT_BY_CODE[bestCode] : null;
  const confidence = bestCode
    ? Math.min(0.55 + bestHits * 0.07, 0.86)
    : 0.32;

  const place = input.district ? ` from ${input.district}` : "";
  const subject = input.subject?.trim();
  const detail = firstSentences(input.description, 170);
  const summary = truncate(
    `${category} grievance${place}${subject ? ` regarding “${subject}”` : ""}: ${detail}`,
    280,
  );

  const rationale = bestCode
    ? `Matched ${bestHits} signal${bestHits === 1 ? "" : "s"}${
        bestKeywords.length ? ` (${bestKeywords.slice(0, 4).join(", ")})` : ""
      }. Priority signals: ${highSignals.length ? highSignals.slice(0, 3).join(", ") : "none"}.`
    : "No department-specific signals were found; routed to Local Self Government for human triage.";

  return {
    source: "fallback",
    providerLabel: "Labelled heuristic fallback",
    model: null,
    departmentCode: bestCode ?? "LSGD",
    departmentName: department?.name ?? "Local Self Government",
    category,
    priority,
    summary,
    confidence,
    rationale,
    notice: AI_NOTICE,
  };
}

type LlmPayload = {
  departmentCode?: string;
  category?: string;
  priority?: string;
  summary?: string;
  confidence?: number;
  rationale?: string;
};

function buildMessages(input: AiAnalyzeRequest) {
  const departmentLines = DEPARTMENTS_SEED.map(
    (department) => `- ${department.code}: ${department.name} — ${department.description}`,
  ).join("\n");

  const system = `You are the AI Grievance Assistant for the Chief Minister's Grievance Redressal Portal in Kerala, India. You provide advisory triage only; you never make official decisions.

Analyse the citizen complaint and return ONLY a JSON object with these keys:
departmentCode (string), category (string), priority ("LOW" | "MEDIUM" | "HIGH"), summary (string, max 45 words), confidence (number 0-1), rationale (string, max 40 words).

Allowed departments:
${departmentLines}

Allowed categories:
${CATEGORIES.join(", ")}

Priority rules:
- HIGH: immediate risk to life, health or safety; vulnerable people; hazardous infrastructure; outbreak; repeated failure with danger.
- MEDIUM: genuine service disruption or public inconvenience without immediate danger.
- LOW: suggestions, information requests or minor inconvenience.

Rules:
- Never invent names, locations or facts absent from the complaint.
- Do not repeat sensitive personal data in the summary.
- If the complaint is unclear, choose LSGD and set confidence below 0.4.
- The summary must be neutral and factual, suitable for a CMO officer scanning a queue.
- Return valid JSON only. No markdown fences.`;

  const user = JSON.stringify({
    subject: input.subject ?? "",
    description: input.description,
    district: input.district ?? "",
    citizenSelectedCategory: input.category ?? "",
  });

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function extractJson(raw: string): LlmPayload {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1)) as LlmPayload;
}

async function callLlm(
  input: AiAnalyzeRequest,
  apiKey: string,
  baseUrl: string,
  model: string,
  timeoutMs: number,
): Promise<Omit<AiAnalysis, "duplicates" | "elapsedMs">> {
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const body = {
    model,
    temperature: 0.2,
    max_tokens: 400,
    response_format: { type: "json_object" },
    messages: buildMessages(input),
  };

  const request = async (includeResponseFormat: boolean) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(
        includeResponseFormat ? body : { ...body, response_format: undefined },
      ),
      signal: AbortSignal.timeout(timeoutMs),
    });

  let response = await request(true);
  if (!response.ok && (response.status === 400 || response.status === 422)) {
    response = await request(false);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`AI request failed (${response.status}): ${detail.slice(0, 160)}`);
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI response was empty");

  const parsed = extractJson(raw);
  const departmentCode = String(parsed.departmentCode ?? "").trim().toUpperCase();
  const department =
    DEPARTMENT_BY_CODE[departmentCode] ??
    DEPARTMENTS_SEED.find(
      (item) => item.name.toLowerCase() === departmentCode.toLowerCase(),
    );

  if (!department) throw new Error("AI returned an unknown department");
  const category = (CATEGORIES as readonly string[]).includes(parsed.category ?? "")
    ? (parsed.category as Category)
    : DEPARTMENT_DEFAULT_CATEGORY[department.code];
  const priority: AiPriority = ["LOW", "MEDIUM", "HIGH"].includes(parsed.priority ?? "")
    ? (parsed.priority as AiPriority)
    : "MEDIUM";
  const summary = String(parsed.summary ?? "").trim();
  if (summary.length < 10) throw new Error("AI returned an unusable summary");

  return {
    source: "llm",
    providerLabel: `LLM · ${model}`,
    model,
    departmentCode: department.code,
    departmentName: department.name,
    category,
    priority,
    summary: truncate(summary, 600),
    confidence:
      typeof parsed.confidence === "number" && parsed.confidence >= 0 && parsed.confidence <= 1
        ? Math.round(parsed.confidence * 100) / 100
        : 0.7,
    rationale: truncate(String(parsed.rationale ?? "AI triage suggestion.").trim(), 500),
    notice: AI_NOTICE,
  };
}

export async function analyzeGrievance(
  input: AiAnalyzeRequest,
  duplicateCandidates: Parameters<typeof detectDuplicates>[1] = [],
): Promise<AiAnalysis> {
  const startedAt = Date.now();
  const duplicates = detectDuplicates(input.description, duplicateCandidates);
  const apiKey = process.env.AI_API_KEY?.trim();
  const baseUrl = process.env.AI_BASE_URL?.trim() || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL?.trim() || "gpt-4o-mini";
  const timeoutMs = Number.parseInt(process.env.AI_TIMEOUT_MS ?? "15000", 10) || 15000;

  if (apiKey) {
    try {
      const result = await callLlm(input, apiKey, baseUrl, model, timeoutMs);
      return { ...result, duplicates, elapsedMs: Date.now() - startedAt };
    } catch (error) {
      console.warn("[ai] LLM analysis failed, using labelled fallback:", error);
    }
  }

  const fallback = heuristicAnalysis(input);
  return {
    ...fallback,
    providerLabel: apiKey
      ? "Labelled fallback (AI service unavailable)"
      : "Labelled fallback (no AI key configured)",
    duplicates,
    elapsedMs: Date.now() - startedAt,
  };
}

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Copy,
  FilePlus2,
  Info,
  Loader2,
  MapPin,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { CATEGORIES, DISTRICTS, MAX_ATTACHMENT_BYTES, SLA_DAYS } from "@/lib/constants";
import { PriorityBadge, StatusBadge } from "@/components/ui";
import { formatBytes } from "@/lib/utils";

type Analysis = {
  source: "llm" | "fallback";
  providerLabel: string;
  model: string | null;
  departmentCode: string | null;
  departmentName: string | null;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
  confidence: number;
  rationale: string;
  duplicates: { referenceNo: string; subject: string; status: string; score: number }[];
  notice: string;
};

type Submitted = { id: string; referenceNo: string };

export function GrievanceForm() {
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [applied, setApplied] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<Submitted | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const descriptionCount = description.trim().length;

  async function runAnalysis() {
    setAiError("");
    if (description.trim().length < 20) {
      setAiError("Write at least 20 characters about the issue, then run the assistant.");
      return;
    }
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim() || undefined,
          description: description.trim(),
          district: district || undefined,
          category: category || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setAiError(payload?.error ?? "The assistant could not analyse this complaint. You can continue without it.");
        return;
      }
      setAnalysis((payload?.data?.analysis ?? null) as Analysis | null);
      setApplied(false);
    } catch {
      setAiError("Network error while contacting the assistant. You can still submit the grievance.");
    } finally {
      setAnalyzing(false);
    }
  }

  function applySuggestions() {
    if (!analysis) return;
    if ((CATEGORIES as readonly string[]).includes(analysis.category)) {
      setCategory(analysis.category);
    }
    setPriority(analysis.priority);
    setApplied(true);
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setErrors((current) => ({ ...current, attachment: "" }));
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.size > MAX_ATTACHMENT_BYTES) {
      setErrors((current) => ({ ...current, attachment: "Attachment must be 4 MB or smaller" }));
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setFile(selected);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    const nextErrors: Record<string, string> = {};
    if (!district) nextErrors.district = "Select the district where the issue is located";
    if (!category) nextErrors.category = "Select a category";
    if (subject.trim().length < 6) nextErrors.subject = "Subject must be at least 6 characters";
    if (descriptionCount < 30) nextErrors.description = "Please describe the grievance in at least 30 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById("grievance-form-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setPending(true);
    try {
      const form = new FormData();
      form.set("district", district);
      form.set("category", category);
      form.set("subject", subject.trim());
      form.set("description", description.trim());
      form.set("priority", priority);
      if (file) form.set("attachment", file);

      if (analysis) {
        form.set(
          "ai",
          JSON.stringify({
            aiAdopted: applied,
            aiSummary: analysis.summary,
            aiSuggestedCategory: analysis.category,
            aiSuggestedDepartment: analysis.departmentName ?? analysis.departmentCode ?? undefined,
            aiSuggestedPriority: analysis.priority,
            aiConfidence: analysis.confidence,
            aiProvider: analysis.providerLabel,
            aiModel: analysis.model ?? undefined,
            aiDuplicateRefs: analysis.duplicates.map((duplicate) => ({
              referenceNo: duplicate.referenceNo,
              subject: duplicate.subject,
              score: duplicate.score,
            })),
          }),
        );
      }

      const response = await fetch("/api/grievances", { method: "POST", body: form });
      const payload = await response.json().catch(() => ({}));
      const data = payload?.data ?? {};

      if (!response.ok) {
        const fieldErrors: Record<string, string> = {};
        if (Array.isArray(payload?.details)) {
          for (const detail of payload.details) {
            if (detail && typeof detail.field === "string") {
              fieldErrors[detail.field] = String(detail.message ?? "");
            }
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setServerError(payload?.error ?? "Could not submit the grievance. Please try again.");
        }
        return;
      }

      setCreated({ id: data.id, referenceNo: data.referenceNo });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Network error. Your grievance was not submitted — please try again.");
    } finally {
      setPending(false);
    }
  }

  async function copyReference() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.referenceNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (created) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card overflow-hidden">
          <div className="bg-brand-900 px-6 py-8 text-center text-white">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10 text-gold-300">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold">Grievance submitted</h1>
            <p className="mt-1.5 text-[12.5px] text-brand-100/70">
              Your complaint is now queued for review by the Chief Minister&apos;s Office.
            </p>
          </div>
          <div className="p-6">
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-800">Your reference number</p>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <p className="font-mono text-2xl font-bold tracking-wide text-brand-900">{created.referenceNo}</p>
                <button
                  type="button"
                  onClick={copyReference}
                  className="rounded-lg p-1.5 text-brand-800 transition hover:bg-white"
                  aria-label="Copy reference number"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-brand-900/60">Save this number. You will need it to track the grievance.</p>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">What happens next</p>
              <ol className="mt-3 space-y-3">
                {[
                  "The CMO office reviews your grievance and confirms the department.",
                  "The department officer investigates and records updates.",
                  "The action-taken report is verified by the CMO before the case is closed.",
                  "You can track every public update using your reference number.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3 text-[12.5px] leading-5 text-muted">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-800">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href={`/track?ref=${created.referenceNo}`} className="btn btn-primary flex-1">
                Track this grievance
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/citizen/grievances" className="btn btn-secondary flex-1">
                My grievances
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreated(null);
                setAnalysis(null);
                setApplied(false);
                setSubject("");
                setDescription("");
                setCategory("");
                setDistrict("");
                setPriority("MEDIUM");
                setFile(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
              className="mt-3 w-full text-center text-[11.5px] font-semibold text-brand-800 hover:underline"
            >
              Submit another grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start" noValidate>
      <div id="grievance-form-top" className="space-y-5">
        {serverError ? (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
            <p className="text-[12px] font-medium leading-5 text-rose-900">{serverError}</p>
          </div>
        ) : null}

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">1</span>
            <h2 className="text-[15.5px] font-semibold">Where is the issue?</h2>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="district" className="label">District</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <select
                  id="district"
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  className="select pl-10"
                  aria-invalid={Boolean(errors.district)}
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              {errors.district ? <p className="field-error">{errors.district}</p> : null}
            </div>
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="select"
                aria-invalid={Boolean(errors.category)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {errors.category ? <p className="field-error">{errors.category}</p> : null}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="subject" className="label">Subject</label>
            <input
              id="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={120}
              placeholder="A short title, e.g. Streetlight not working on MG Road"
              className="input"
              aria-invalid={Boolean(errors.subject)}
            />
            <div className="flex items-center justify-between">
              {errors.subject ? <p className="field-error">{errors.subject}</p> : <p className="hint">Keep it specific — officers use this to triage the case.</p>}
              <span className="mt-1.5 text-[10.5px] text-muted">{subject.length}/120</span>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">2</span>
            <h2 className="text-[15.5px] font-semibold">Describe the grievance</h2>
          </div>
          <p className="mt-1.5 text-[11.5px] leading-5 text-muted">
            Include what happened, where exactly, who is affected and what action you expect. Specific
            details help the department act faster.
          </p>
          <div className="mt-4">
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={8}
              maxLength={4000}
              placeholder="Example: The footpath along the eastern side of Government UP School, Kazhakkoottam, has collapsed, leaving an open drain. Around 300 students use this path every morning. Two children have already fallen in. The slab has been broken for three weeks and no warning board has been placed."
              className="textarea min-h-44"
              aria-invalid={Boolean(errors.description)}
            />
            <div className="flex items-center justify-between">
              {errors.description ? <p className="field-error">{errors.description}</p> : <p className="hint">Minimum 30 characters. Avoid including sensitive personal information.</p>}
              <span className={`mt-1.5 shrink-0 text-[10.5px] ${descriptionCount < 30 ? "text-muted" : "text-brand-700"}`}>
                {descriptionCount}/4000
              </span>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">3</span>
            <h2 className="text-[15.5px] font-semibold">Priority and evidence</h2>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="priority" className="label">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as "LOW" | "MEDIUM" | "HIGH")}
                className="select"
              >
                <option value="LOW">Low — general request or suggestion</option>
                <option value="MEDIUM">Medium — disrupts daily services</option>
                <option value="HIGH">High — safety risk or emergency</option>
              </select>
              <p className="hint">
                Target closure: {SLA_DAYS[priority]} days. The CMO office may adjust priority after review.
              </p>
            </div>
            <div>
              <label htmlFor="attachment" className="label">Supporting file (optional)</label>
              <input
                ref={fileInput}
                id="attachment"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                onChange={onFileChange}
                className="block w-full cursor-pointer rounded-xl border border-line bg-white text-[11.5px] text-muted file:mr-3 file:border-0 file:bg-brand-50 file:px-3 file:py-2.5 file:text-[11px] file:font-semibold file:text-brand-800 hover:file:bg-brand-100"
              />
              {errors.attachment ? (
                <p className="field-error">{errors.attachment}</p>
              ) : file ? (
                <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg bg-brand-50 px-2.5 py-1.5">
                  <span className="flex min-w-0 items-center gap-1.5 text-[10.5px] font-medium text-brand-900">
                    <Paperclip className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-brand-800/60">({formatBytes(file.size)})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInput.current) fileInput.current.value = "";
                    }}
                    className="shrink-0 rounded p-1 text-brand-800 hover:bg-white"
                    aria-label="Remove attachment"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <p className="hint">PNG, JPG, WebP or PDF · up to 4 MB.</p>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-5 text-muted">
            By submitting, you confirm the information provided is accurate and complete.
          </p>
          <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            {pending ? "Submitting…" : "Submit grievance"}
          </button>
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <div className="overflow-hidden rounded-2xl border border-brand-200 bg-white">
          <div className="bg-brand-900 px-5 py-4">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI Grievance Assistant
            </p>
            <h2 className="mt-1.5 text-lg font-semibold text-white">Not sure which department?</h2>
            <p className="mt-1 text-[11.5px] leading-5 text-brand-100/70">
              The assistant reads your description and recommends a department, category and priority.
            </p>
          </div>

          <div className="p-5">
            <button
              type="button"
              onClick={runAnalysis}
              disabled={analyzing || descriptionCount < 20}
              className="btn btn-secondary w-full"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wand2 className="h-4 w-4" aria-hidden="true" />}
              {analyzing ? "Analysing complaint…" : analysis ? "Re-run analysis" : "Analyse my complaint"}
            </button>
            {descriptionCount < 20 ? (
              <p className="mt-2 text-center text-[10.5px] text-muted">Write at least 20 characters to enable the assistant.</p>
            ) : null}

            {aiError ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">
                {aiError}
              </p>
            ) : null}

            {analysis ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-800">
                    <Bot className="h-2.5 w-2.5" aria-hidden="true" />
                    {analysis.source === "llm" ? "Live model" : "Labelled fallback"}
                  </span>
                  <span className="text-[9.5px] text-muted">Confidence {Math.round(analysis.confidence * 100)}%</span>
                </div>

                <div className="space-y-2 rounded-xl border border-line bg-canvas/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10.5px] text-muted">Department</span>
                    <span className="text-right text-[11.5px] font-semibold text-ink">
                      {analysis.departmentName ?? "Not identified"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10.5px] text-muted">Category</span>
                    <span className="text-right text-[11.5px] font-semibold text-ink">{analysis.category}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] text-muted">Priority</span>
                    <PriorityBadge priority={analysis.priority} />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Summary for the CMO</p>
                  <p className="mt-1 text-[11.5px] leading-5 text-ink/80">{analysis.summary}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Why this suggestion</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted">{analysis.rationale}</p>
                </div>

                {analysis.duplicates.length > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-800">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      Possible duplicate
                    </p>
                    <ul className="mt-1.5 space-y-1.5">
                      {analysis.duplicates.map((duplicate) => (
                        <li key={duplicate.referenceNo} className="text-[10.5px] leading-4 text-amber-900/80">
                          <span className="font-mono font-semibold">{duplicate.referenceNo}</span> ·{" "}
                          {Math.round(duplicate.score * 100)}% similar — {duplicate.subject}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-[9.5px] leading-4 text-amber-900/60">
                      For human review only. This does not block your submission.
                    </p>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={applySuggestions}
                  className="btn btn-primary btn-sm w-full"
                >
                  {applied ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
                  {applied ? "Suggestions applied" : "Apply suggestions"}
                </button>
                <p className="text-[9.5px] leading-4 text-muted">{analysis.notice}</p>
                <p className="text-[9.5px] leading-4 text-muted">
                  Provider: {analysis.providerLabel}
                  {analysis.model ? ` · ${analysis.model}` : ""}
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {[
                  "Suggested department & category",
                  "Priority recommendation with SLA hint",
                  "A short briefing summary for the CMO",
                  "Possible duplicate complaints flagged for review",
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2 text-[11px] leading-4 text-muted">
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-brand-500" aria-hidden="true" />
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold text-ink">
            <Info className="h-3.5 w-3.5 text-brand-700" aria-hidden="true" />
            After you submit
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status="SUBMITTED" />
            <ArrowRight className="h-3 w-3 text-muted" aria-hidden="true" />
            <StatusBadge status="UNDER_REVIEW" />
            <ArrowRight className="h-3 w-3 text-muted" aria-hidden="true" />
            <StatusBadge status="IN_PROGRESS" />
          </div>
          <p className="mt-2 text-[10.5px] leading-5 text-muted">
            The CMO office first reviews every grievance before forwarding it to a department.
          </p>
        </div>

        <Link href="/citizen/grievances" className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-[11.5px] font-semibold text-brand-800 transition hover:border-brand-300 hover:bg-brand-50">
          View my previous grievances
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    </form>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type Errors = Record<string, string>;

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      subject: String(form.get("subject") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const next: Errors = {};
        if (Array.isArray(result?.details)) {
          for (const detail of result.details) {
            if (detail && typeof detail.field === "string") {
              next[detail.field] = String(detail.message ?? "");
            }
          }
        }
        if (Object.keys(next).length > 0) {
          setErrors(next);
        } else {
          setMessage(result?.error ?? "Could not send your message. Please try again.");
        }
        return;
      }

      setDone(true);
      setMessage(result?.data?.message ?? "Your message has been received.");
      formElement.reset();
    } catch {
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-semibold">Message received</h2>
        <p className="mt-2 max-w-sm text-[13px] leading-6 text-muted">{message}</p>
        <button type="button" onClick={() => setDone(false)} className="btn btn-secondary mt-6">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card p-6">
      <h2 className="text-xl font-semibold">Write to the CMO office</h2>
      <p className="mt-1.5 text-[12.5px] leading-6 text-muted">
        For general enquiries, suggestions or feedback about the portal. Please avoid sharing
        sensitive personal information.
      </p>

      {message ? (
        <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[12px] font-medium text-rose-800">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">Full name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Ananya Menon"
            className="input"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="field-error">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="contact-email" className="label">Email address</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="input"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-subject" className="label">Subject</label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          placeholder="What is this about?"
          className="input"
          aria-invalid={Boolean(errors.subject)}
        />
        {errors.subject ? <p className="field-error">{errors.subject}</p> : null}
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="label">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Tell us how we can help…"
          className="textarea"
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? <p className="field-error">{errors.message}</p> : null}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-5 w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {pending ? "Sending…" : "Send message"}
      </button>
      <p className="mt-3 text-[11px] leading-5 text-muted">
        Enquiries are saved to the portal database and reviewed by the CMO help desk.
      </p>
    </form>
  );
}

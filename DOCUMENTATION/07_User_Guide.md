# 07 — User Guide

This guide walks through every role in the prototype. All data is fictional.

## 1. Getting started

| I want to… | Go to |
| --- | --- |
| Browse the public site | `/` |
| Sign in | `/login` |
| Create a citizen account | `/register` |
| Track a grievance without an account | `/track` |
| Submit a grievance | `/citizen/new` |
| Review all grievances as CMO | `/cmo` |
| Work the department queue as an officer | `/officer` |

Demo accounts are listed in the README and on the login page. For the quickest tour, sign in as the CMO administrator:

```text
cmo@kerala.demo
Demo@CMO2026
```

## 2. Public website

### Home (`/`)
Shows live portal counts, the four-step citizen journey, feature highlights, featured departments and calls to submit or track a grievance. The numbers come from the database, so they change as demo cases are added.

### About Us (`/about`)
Explains the single-window concept, transparency, prioritisation, auditable administration and the human accountability model.

### How It Works (`/how-it-works`)
Describes the five workflow stages and what each role is responsible for. Use this page in the demo to explain the process before showing it.

### Departments (`/departments`)
Lists the 11 fictional departments with descriptions, heads, email addresses and phone numbers. These are demonstration contacts, not real government contacts.

### FAQ (`/faq`)
Answers common questions about submitting, tracking, resolutions and feedback.

### Contact Us (`/contact`)
Use the form to send a general enquiry. Name, email, subject and message are required; the message must be at least 10 characters. On success the page shows **Message received**. Enquiries are stored in PostgreSQL and appear in the CMO inbox at `/cmo/enquiries`. No email is sent in this prototype.

### Track a grievance (`/track`)
Enter a reference such as `KLG-2026-7K2M9P`. The result shows the subject, category, district, priority, status, department, due date, public timeline, resolution report and feedback. Personal contact details and internal notes are never shown. Tracking is rate limited to 60 lookups per 15 minutes per IP.

## 3. Citizen guide

### 3.1 Create an account

1. Open `/register`.
2. Enter full name, email, a 10-digit mobile number starting with 6–9, and a password.
3. Password rules: at least 8 characters, including a letter and a number.
4. Submit. You are signed in automatically and taken to `/citizen?welcome=1`.

Errors appear inline under the relevant field. An existing email returns a clear conflict message.

### 3.2 Sign in and out

- `/login` accepts your email and password and sends you to the correct workspace based on your role.
- Sign out from the bottom of the sidebar (desktop) or the mobile drawer.
- If you try to open another role's workspace, you are redirected to your own home.

### 3.3 Citizen dashboard (`/citizen`)

The dashboard shows four counts — **Total**, **Pending**, **Resolved** and **Reopened** — plus your most recent grievances. Use **Submit grievance** or **My grievances** from the sidebar.

### 3.4 Submit a grievance (`/citizen/new`)

1. Select a **District** (14 Kerala districts).
2. Select a **Category** (12 categories).
3. Enter a **Subject** (6–120 characters).
4. Write a **Description** (30–4000 characters). Include location, duration, impact and any immediate risk.
5. Choose a **Priority**: Low, Medium or High. The default is Medium.
6. Optionally attach a **PNG, JPG, WebP or PDF** up to 4 MB.
7. Optionally use the **AI Grievance Assistant** (section 6).
8. Submit. The success screen shows your unique reference number, for example `KLG-2026-3KMJ6W`. Save it.

SLA due dates are set from the priority: High 3 days, Medium 7 days, Low 14 days.

If validation fails, the form highlights the specific field. If the attachment is too large or the wrong type, it is rejected before submission.

### 3.5 My grievances (`/citizen/grievances`)

Lists your cases with status, priority, reference, subject, district, department and dates. Open any case to see:

- Current status, priority, SLA and escalation level.
- Assigned department and officer.
- The public timeline of actions with names, roles and timestamps.
- Attachments you uploaded.
- The department's resolution report once approved.
- A feedback form when the case is resolved.
- A reopen action when the case is resolved and you are not satisfied.

You can only open your own grievances. Attempting another citizen's URL is denied.

### 3.6 Feedback and reopen

**Feedback**: after the CMO confirms a resolution, choose 1–5 stars and optionally add a comment. Feedback can be submitted once per grievance and feeds the CMO's satisfaction metrics.

**Reopen**: if the issue is not actually fixed, select **Not satisfied? Reopen this grievance**, explain why in at least 10 characters, and confirm. The case returns to the CMO queue with the status **Reopened** and your reason in the timeline. A citizen can reopen only a resolved grievance they own.

### 3.7 Track without signing in

Open `/track` and enter the reference number. The page is safe to share: it hides your identity, email, mobile, internal remarks and attachments. Use this when you do not want to sign in or when someone else needs to check the status.

## 4. CMO administrator guide

### 4.1 Command centre (`/cmo`)

The dashboard shows:

- **Total**, **Pending**, **Resolved** and **Overdue** counts.
- Average resolution days, feedback count and average rating.
- Awaiting CMO review and escalated case counts.
- Charts by status, priority, district, department, category and an eight-week created/resolved trend.
- Recent grievances.

All charts are generated from stored database values.

### 4.2 All grievances (`/cmo/grievances`)

Use the filter bar to narrow by district, category, priority, status, department, overdue flag or free text. Pagination shows eight cases per page. Preset views in the sidebar jump to **Awaiting CMO review** and **Overdue cases**.

### 4.3 Review a grievance (`/cmo/grievances/:id`)

The detail page shows the citizen and department context, AI triage record, attachments, assignment history and the complete internal timeline (including internal remarks that citizens cannot see).

Available actions:

1. **Forward / reassign** — choose a department, optionally an officer in that department, add instructions, and optionally override the due date. The case moves to **Under Review** (or stays **In Progress** if already there).
2. **Add official remark** — write an internal note or tick **Visible to citizen** to publish it to the timeline. Internal notes are hidden from citizens and public tracking.
3. **Escalate** — provide a reason. The escalation level increases and priority rises (`LOW → MEDIUM`, `MEDIUM → HIGH`). Escalation is recorded internally.
4. **Review the action-taken report** — when an officer submits a report, the case appears in the review queue. Read the report, add an optional review note, then:
   - **Confirm resolved** → status **Resolved**; the citizen can see the outcome and give feedback.
   - **Reject & reopen** → a reason is required; status **Reopened** and the department must act again.

Resolved cases cannot be assigned or escalated. Approval is one-time; a reviewed resolution cannot be approved again.

### 4.4 Contact enquiries (`/cmo/enquiries`)

Read messages submitted through the public contact form. Each row shows the sender, subject, message, status and date. This is a read-only inbox in the prototype.

## 5. Department officer guide

### 5.1 Department overview (`/officer`)

Shows counts for the own department: total, active, resolved and reports awaiting CMO review, plus cases ordered by due date. Officers never see another department's queue.

### 5.2 Assigned grievances (`/officer/grievances`)

Lists the department's cases with status, priority, citizen, reference, due date and attachments. Use **In progress** in the sidebar to focus on active investigations.

### 5.3 Work a case (`/officer/grievances/:id`)

1. Read the complaint, citizen context and attachments.
2. Select **Mark investigation started** to move the case to **In Progress** (if it is not already).
3. Add an **investigation update**. Officer remarks are visible to the citizen in this implementation, so write them as public-facing updates.
4. After completing the work, write an **action-taken report** of at least 20 characters describing what was done, when, by whom, and the outcome. Submit it to the CMO.

Important rules:

- Submitting a report **does not resolve** the case. Status stays **In Progress** and the CMO must verify it.
- Only one report can await review at a time.
- Officers cannot assign, escalate, resolve directly or access other departments.
- The CMO may reject the report and reopen the case; the department then continues work.

## 6. Using the AI Grievance Assistant

1. On `/citizen/new`, enter at least 20 characters in the description.
2. Select **Analyse my complaint**.
3. Review the suggestion card:
   - **Source / provider** — shows whether a real LLM or the labelled fallback produced the result.
   - **Department** and **category**.
   - **Priority** with confidence.
   - **CMO summary** and **rationale**.
   - **Possible duplicates** with reference numbers and match scores.
   - The advisory notice.
4. Choose **Apply suggestions** to fill the form, or ignore them and keep your own selections. You can change any field afterwards.
5. Submit. The grievance records which AI suggestions were adopted.

The assistant is advisory. It cannot submit, assign, resolve or reopen anything. If the deployment has no LLM key, the card explicitly says **Labelled fallback (no AI key configured)**. See [05_AI_Integration.md](05_AI_Integration.md) for how to enable a real model.

## 7. Status and priority reference

| Status | Meaning | Who moves it there |
| --- | --- | --- |
| **Submitted** | Queued for CMO review | Citizen submission |
| **Under Review** | CMO has opened/routed the case | CMO assignment or status action |
| **In Progress** | Department is investigating | Officer (or CMO assignment) |
| **Resolved** | CMO confirmed the action-taken report | CMO approval |
| **Reopened** | Resolution rejected or citizen dissatisfied | CMO rejection or citizen reopen |

| Priority | SLA | Typical use |
| --- | --- | --- |
| **High** | 3 days | Danger to life/health/safety, hazardous infrastructure, outbreak |
| **Medium** | 7 days | Service disruption without immediate danger |
| **Low** | 14 days | Suggestions, information requests, minor inconvenience |

An **Overdue** case is past its due date and not Resolved. **Escalated** means the CMO has raised the escalation level at least once.

## 8. Attachments

- Accepted: PNG, JPEG, WebP, PDF.
- Maximum: 4 MB.
- Uploaded with the grievance and stored in PostgreSQL.
- Only the owning citizen, an officer in the assigned department, or a CMO administrator can retrieve the file.
- Downloads are served through an authenticated route; there are no public attachment URLs.
- Do not upload real personal or sensitive documents in this prototype.

## 9. Accessibility and mobile use

- Forms use explicit labels, focus styles and inline error messages.
- The layout is responsive; the portal sidebar becomes a drawer on small screens.
- Status is conveyed with text and colour, not colour alone.
- A skip link is available at the top of the page.
- The prototype has not been through a formal accessibility audit.

## 10. Common questions and fixes

| Problem | What to do |
| --- | --- |
| "Invalid email or password" | Check the demo credentials; passwords are case-sensitive. Wait 15 minutes after repeated failures. |
| "Please sign in to continue" | The session expired or cookies are blocked. Sign in again and allow cookies. |
| I lost my reference number | Sign in and open `/citizen/grievances`; the reference is shown on every card. |
| Tracking says no grievance found | Check the format `KLG-YYYY-XXXXXX`; letters are case-insensitive, but the reference must exist. |
| I cannot reopen | Reopen is available only for a resolved grievance you own. |
| I cannot submit feedback | Feedback is available only after the CMO confirms resolution, and only once. |
| My file was rejected | Use PNG/JPG/WebP/PDF and keep it at or below 4 MB. |
| The AI says "fallback" | The hosted deployment has no LLM key or the provider failed. The result is still usable but is explicitly labelled. |
| I cannot see a case as an officer | It may belong to another department. Ask the CMO to assign it to your department. |
| "Too many attempts" | Rate limits apply to login, tracking, contact and AI. Wait and retry. |

## 11. Suggested demo walkthrough (for the video)

1. Public home → show live stats and workflow.
2. Citizen signs in → dashboard → submit a water grievance with an attachment.
3. Run the AI assistant → show source label → adopt suggestions → submit → copy the reference.
4. Sign out → track the reference publicly → show the timeline and privacy filtering.
5. Sign in as CMO → find the case → assign to KWA → add an internal note → escalate.
6. Sign in as the KWA officer → mark In Progress → add an investigation update → submit an action-taken report.
7. Sign back in as CMO → confirm resolved.
8. Sign in as the citizen → give 5-star feedback → reopen with a reason.
9. Show the CMO command centre charts and the contact enquiry inbox.
10. Close with the documentation, tests and deployment note.

A timed version of this plan is in [08_Demo_Video_Script.md](08_Demo_Video_Script.md).

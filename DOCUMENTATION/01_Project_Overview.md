# 01 — Project Overview

## 1. Purpose

The **CM Kerala – Chief Minister's Public Grievance Redressal Portal** is a working end-to-end prototype of a citizen grievance system for the Chief Minister's Office (CMO) of Kerala. It was built for the WhiteMatrix **AI Full Stack Engineer** machine test.

The prototype demonstrates one complete, auditable loop:

> A citizen submits a grievance → the CMO reviews and routes it → a department investigates and files an action-taken report → the CMO verifies the outcome → the citizen tracks, gives feedback, or reopens the case.

The build is deliberately honest about its status:

> **Independent demonstration project.** No affiliation with, authorisation by, or endorsement from the Government of Kerala or the Chief Minister's Office. Every person, department, grievance, attachment and contact detail is fictional demonstration data.

## 2. Problem statement

Citizens who raise public grievances often cannot answer three basic questions:

1. **Where is my complaint?** Reference numbers are lost, and status updates are not visible.
2. **Who is responsible now?** Cases move between offices without a visible owner.
3. **Was the outcome verified?** A department may report closure without the citizen accepting it.

The portal addresses these with a unique reference number, a single five-stage workflow, named officers and departments, a timestamped audit trail, CMO verification before closure, and a citizen feedback/reopen loop.

## 3. Goals and success criteria

| Goal | Success criterion in this build |
| --- | --- |
| One place to submit | Citizen registration/login and a validated grievance form with attachment |
| One visible workflow | Exactly five statuses; every transition recorded with actor and timestamp |
| Clear ownership | Every case can be assigned to a department and optionally an officer |
| CMO oversight | Queue, filters, statistics, escalation, resolution approval/rejection |
| Citizen trust | Public tracking, citizen-visible remarks, resolution report, feedback, reopen |
| Responsible AI | Advisory suggestions only, human adoption required, labelled fallback |
| Deployable demo | Hosted on Vercel + Neon with seeded demo accounts and no local setup for reviewers |

## 4. Users and permissions

| Role | Who | Can do |
| --- | --- | --- |
| **Citizen** | Member of the public with a registered account | Submit and track own grievances, attach evidence, read public updates, give feedback after resolution, reopen a resolved case, contact the CMO office, use the AI assistant |
| **CMO Administrator** | Chief Minister's Office special officer | See all grievances, filter and search, review AI triage, assign/forward to departments and officers, add internal or citizen-visible remarks, escalate, review action-taken reports, approve/resolve or reject/reopen, read contact enquiries, view statistics and charts |
| **Department Officer** | Officer attached to one department | See only the own department's queue, read details/attachments, add investigation remarks, move a case to In Progress, submit an action-taken report to the CMO. Cannot resolve, assign, escalate, or see another department's cases |
| **Public visitor** | No account | Browse the public website, browse the department directory, track a grievance by reference, send a contact enquiry, register or sign in |

Role checks are enforced in both page guards (`requirePageUser`) and API routes (`requireApiUser`). Hiding a button is never the only control.

## 5. Mandatory workflow

```text
Submitted ──► Under Review ──► In Progress ──► Resolved
                   │                │              │
                   │                │              └──► Reopened (citizen or CMO)
                   │                └── action-taken report (still In Progress)
                   └── CMO review, assignment and escalation
```

- **Submitted** — the citizen has filed the grievance and it is queued for CMO review.
- **Under Review** — the CMO has opened the case and/or forwarded it to a department.
- **In Progress** — a department is investigating. An officer files an action-taken report while the status remains In Progress.
- **Resolved** — only the CMO can confirm the department's report and close the case.
- **Reopened** — the CMO rejected the report, or the citizen rejected the outcome; the case returns to the queue.

SLA windows: **HIGH = 3 days, MEDIUM = 7 days, LOW = 14 days**. An escalation raises the escalation level and, where possible, the priority. A case is overdue when `dueAt` has passed and the status is not Resolved.

Every transition writes a `GrievanceHistory` row with a title, optional note, status, visibility flag, actor name, actor role and timestamp. Citizens and public trackers never receive internal notes.

## 6. Scope delivered

### Public website
Home, About Us, How It Works, Departments, Contact Us (persisted enquiries), FAQ, and Track by Reference.

### Citizen portal
Registration, login/logout, dashboard counts, submit grievance (district, category, subject, description, priority, optional attachment), unique reference, list/detail, timeline, feedback and reopen.

### CMO dashboard
Command centre metrics and Recharts visualisations, all-grievance list with filters (district, category, priority, status, department, overdue, search) and pagination, detail view with AI record and history, assignment, remarks, escalation, resolution review, and contact enquiries.

### Department officer dashboard
Department-scoped overview and queue, detail view with attachments and internal timeline, remarks, In Progress update, action-taken report submission.

### AI Grievance Assistant
Department/category/priority suggestions, CMO summary, duplicate candidates, confidence and rationale. Supports a real OpenAI-compatible LLM and a clearly labelled deterministic fallback. See [05_AI_Integration.md](05_AI_Integration.md).

### Platform
REST APIs, RBAC, PostgreSQL schema and migration, seeded fictional data, unit tests, security headers, rate limiting, documentation, architecture and ER diagrams.

## 7. Database entities

| Entity | Purpose |
| --- | --- |
| `User` | Citizens, CMO administrators and department officers, with role and optional department |
| `Department` | 11 state departments with codes, descriptions and contact details |
| `Grievance` | Complaint, status, priority, SLA dates, assignment, resolution and AI metadata |
| `GrievanceHistory` | Append-only audit trail; internal entries hidden from citizens |
| `Assignment` | Every forward/assignment with department, officer, assigner, note and status |
| `Attachment` | Evidence file metadata and bytes (`bytea`) |
| `CitizenFeedback` | One rating (1–5) and optional comment per resolved grievance |
| `ContactEnquiry` | Public contact messages with NEW/READ/RESPONDED status |
| `Department` ↔ `User`/`Grievance` | Ownership and queue scoping |

Full ER diagram and column details: [03_Database_Design.md](03_Database_Design.md).

## 8. Demo data

The seed creates:

- 11 departments (PWD, Health, Education, Water Authority, Electricity Board, Revenue, Local Self Government, Transport, Agriculture, Social Justice, Home).
- 1 CMO administrator, 11 department officers, 4 citizens.
- 17 fictional grievances across all 14 districts and all five statuses, including resolved cases with feedback, an overdue case, an escalated case, an in-progress case with an attachment, and reopened cases.
- 3 contact enquiries.
- Fictional PDF attachments generated in memory for selected grievances.

The seed is idempotent for an existing database: it skips when grievances already exist.

## 9. Explicit non-goals

- No real Government of Kerala systems, credentials, citizen data or Aadhaar integration.
- No official decisions by AI. No automatic assignment, resolution or closure.
- No email/SMS gateway, payment, e-signature or physical file-room integration.
- No production-grade horizontal rate limiting, media storage, antivirus scanning or disaster recovery.
- Not a certified accessible or localised government service.

## 10. Deliverables

| Deliverable | Location |
| --- | --- |
| Source code | Repository root |
| Setup and env example | `README.md`, `.env.example`, [06_Setup_and_Testing.md](06_Setup_and_Testing.md) |
| Documentation | This folder, documents 01–07 |
| Architecture diagram | [02_System_Architecture.md](02_System_Architecture.md), `diagrams/system-architecture.mmd` |
| ER diagram | [03_Database_Design.md](03_Database_Design.md), `diagrams/database-er.mmd` |
| Demo credentials | README section 1 |
| Hosted link | https://cm-kerala-grievance-portal-zkt7.vercel.app |
| Demo video | Recorded by the candidate |

## 11. Project status (12 November 2026)

- Production build verified (`npm run build`).
- Strict TypeScript check verified (`npm run typecheck`).
- 37 automated tests passing (`npm test`).
- End-to-end flows manually verified for all three roles, file upload/download, AI assistant, feedback, reopen, contact and tracking.
- Deployment package prepared for Vercel + Neon; the hosted URL must be generated by the candidate's Vercel account.

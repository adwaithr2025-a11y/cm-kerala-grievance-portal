# 04 — API Documentation

Base URL locally: `http://localhost:3000`. In production: `https://<your-project>.vercel.app`.

All endpoints are Next.js Route Handlers. JSON requests must send `Content-Type: application/json`; grievance submission may use `multipart/form-data`. Authentication uses the httpOnly `klg_session` cookie set by login/registration.

## 1. Response envelope

Success:

```json
{
  "ok": true,
  "data": { }
}
```

Failure:

```json
{
  "ok": false,
  "error": "Human-readable message",
  "details": [{ "field": "email", "message": "Enter a valid email address" }]
}
```

`details` is present for validation errors (HTTP 422) and occasionally for extra context. The health endpoint is the one exception: it returns a direct object whose `ok` boolean reflects database connectivity.

## 2. Authentication and roles

| Concept | Value |
| --- | --- |
| Cookie | `klg_session` |
| Token | HS256 JWT signed with `AUTH_SECRET` |
| Lifetime | 7 days |
| Claims | subject = user id, role, name, email, issuer `cm-kerala-grievance-portal` |
| Cookie flags | `httpOnly`, `sameSite=lax`, `secure` in production, `path=/` |
| Roles | `CITIZEN`, `CMO_ADMIN`, `OFFICER` |

Role checks are repeated in every protected route. Object-level checks are in the service layer. A signed-in officer whose account has no department cannot access department data.

### HTTP status codes

| Code | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 400 | Malformed JSON or missing request body |
| 401 | Not signed in, invalid credentials, expired session |
| 403 | Authenticated but not allowed (role or object ownership) |
| 404 | Resource not found |
| 409 | State conflict (already resolved, already reviewed, duplicate feedback, etc.) |
| 422 | Validation failure, invalid attachment or invalid workflow transition |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
| 503 | Health check: database unavailable |

### Rate limits

Limits are in-memory per server instance.

| Action | Limit |
| --- | --- |
| Login | 10 attempts / 15 minutes per IP + email |
| Registration | 5 / hour per IP |
| Contact enquiry | 5 / hour per IP |
| Public tracking | 60 / 15 minutes per IP |
| Grievance submission | 10 / hour per user + IP |
| AI analysis | 30 / hour per user |

When exceeded, the API returns `429` with a short retry message.

---

## 3. Authentication endpoints

### POST `/api/auth/register`

Public. Creates a citizen account and signs the user in.

Request:

```json
{
  "name": "Ananya Nair",
  "email": "ananya@example.com",
  "mobile": "9847012345",
  "password": "Demo@Citizen2026"
}
```

Validation: name 2–80 characters; valid email (lowercased); mobile matches `^[6-9]\d{9}$`; password 8–72 characters with at least one letter and one number.

Response `201`:

```json
{
  "ok": true,
  "data": {
    "user": { "id": "cm...", "name": "Ananya Nair", "email": "ananya@example.com", "role": "CITIZEN" },
    "redirectTo": "/citizen"
  }
}
```

Errors: `409` if the email exists, `422` for validation.

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ananya Nair","email":"ananya@example.com","mobile":"9847012345","password":"Demo@Citizen2026"}'
```

### POST `/api/auth/login`

Public. Verifies credentials and sets the session cookie.

```json
{ "email": "cmo@kerala.demo", "password": "Demo@CMO2026" }
```

Response `200`:

```json
{
  "ok": true,
  "data": {
    "user": { "id": "ccmoadmin0000000000000000", "name": "S. Harish", "email": "cmo@kerala.demo", "role": "CMO_ADMIN" },
    "redirectTo": "/cmo"
  }
}
```

`redirectTo` is one of `/citizen`, `/cmo`, `/officer`. Errors: `401` for invalid email/password, `429` after repeated attempts.

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cmo@kerala.demo","password":"Demo@CMO2026"}'
```

### POST `/api/auth/logout`

Signed in. Deletes the cookie.

```json
{ "ok": true, "data": { "loggedOut": true } }
```

### GET `/api/auth/me`

Public. Returns the current user and role menu, or `user: null`.

```json
{ "ok": true, "data": { "user": null } }
```

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "cm...",
      "name": "Ananya Nair",
      "email": "ananya@example.com",
      "mobile": "9847012345",
      "role": "CITIZEN",
      "designation": null,
      "department": null
    },
    "menu": { "label": "Citizen", "home": "/citizen" }
  }
}
```

---

## 4. Grievance endpoints

### GET `/api/grievances`

Signed in. Returns a paginated, role-scoped list.

Query parameters:

| Parameter | Values | Notes |
| --- | --- | --- |
| `district` | One of 14 districts | Exact match |
| `category` | One of 12 categories | Exact match |
| `priority` | `LOW`, `MEDIUM`, `HIGH` | Exact match |
| `status` | One of the five statuses | Exact match |
| `departmentId` | Department cuid | CMO only in practice; officers are already scoped |
| `q` | Free text | Case-insensitive match on reference, subject or description |
| `overdue` | `1` | `dueAt < now` and status ≠ Resolved |
| `view` | `awaiting` | Action-taken report submitted and not yet approved |
| `page` | Positive integer | Default 1; page size 8 |

Citizens only ever receive their own rows. Officers only receive rows whose department equals their own. CMO receives all rows.

Response:

```json
{
  "ok": true,
  "data": {
    "grievances": [
      {
        "id": "cm...",
        "referenceNo": "KLG-2026-7K2M9P",
        "district": "Thiruvananthapuram",
        "category": "Roads & Infrastructure",
        "subject": "Deep pothole near Kazhakkoottam junction is causing accidents",
        "priority": "HIGH",
        "status": "SUBMITTED",
        "dueAt": "2026-11-15T08:00:00.000Z",
        "createdAt": "2026-11-11T08:00:00.000Z",
        "department": { "id": "cm...", "name": "Public Works Department", "code": "PWD" },
        "citizen": { "id": "cm...", "name": "Ananya Nair", "email": "ananya@example.com" },
        "assignedOfficer": null,
        "_count": { "attachments": 1, "history": 3 }
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "pageSize": 8
  }
}
```

```bash
curl -b cookies.txt "http://localhost:3000/api/grievances?status=SUBMITTED&priority=HIGH&page=1"
```

### POST `/api/grievances`

Citizen only. Accepts JSON or `multipart/form-data`. Returns `201`.

JSON body:

```json
{
  "district": "Ernakulam",
  "category": "Water Supply",
  "subject": "No piped water for four days",
  "description": "There has been no piped water supply in our ward for four days and the pipeline is leaking.",
  "priority": "HIGH",
  "aiAdopted": true,
  "aiSummary": "No piped water for four days in the ward; pipeline leaking.",
  "aiSuggestedCategory": "Water Supply",
  "aiSuggestedDepartment": "Kerala Water Authority",
  "aiSuggestedPriority": "HIGH",
  "aiConfidence": 0.83,
  "aiProvider": "LLM · gpt-4o-mini",
  "aiModel": "gpt-4o-mini",
  "aiDuplicateRefs": [{ "referenceNo": "KLG-2026-4R8T2N", "subject": "Salty water", "score": 0.52 }]
}
```

Multipart fields:

| Field | Required | Notes |
| --- | --- | --- |
| `district` | Yes | Must be one of the 14 districts |
| `category` | Yes | Must be one of the 12 categories |
| `subject` | Yes | 6–120 characters |
| `description` | Yes | 30–4000 characters |
| `priority` | No | Defaults to `MEDIUM` |
| `attachment` | No | PNG, JPEG, WebP or PDF; ≤ 4 MB |
| `ai` | No | JSON string containing `aiAdopted`, `aiSummary`, AI suggestion fields and duplicates |

Validation: subject 6–120, description 30–4000, district/category enum, priority enum. AI fields are optional; `aiAdopted` defaults to false.

Response `201`:

```json
{
  "ok": true,
  "data": {
    "id": "cm...",
    "referenceNo": "KLG-2026-3KMJ6W",
    "message": "Grievance submitted. Your reference number is KLG-2026-3KMJ6W."
  }
}
```

On creation the service sets `slaDays` and `dueAt` from the priority, writes a `CREATED` history row, an optional `AI_ANALYSIS` row, and stores the attachment in the same transaction. A reference collision is retried up to five times.

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/grievances \
  -F "district=Ernakulam" \
  -F "category=Water Supply" \
  -F "subject=No piped water for four days" \
  -F "description=There has been no piped water supply in our ward for four days and the pipeline is leaking." \
  -F "priority=HIGH" \
  -F "attachment=@evidence.png"
```

### GET `/api/grievances/:id`

Signed in. Returns one grievance with citizen/department/officer context, feedback, attachments, assignments and history.

Access: citizen owner, officer in the grievance's department, or CMO.

```json
{
  "ok": true,
  "data": {
    "grievance": {
      "id": "cm...",
      "referenceNo": "KLG-2026-9W3H6J",
      "status": "REOPENED",
      "priority": "HIGH",
      "citizen": { "id": "cm...", "name": "Ananya Nair", "email": "ananya@example.com", "mobile": "9847012345" },
      "department": { "id": "cm...", "name": "Kerala Water Authority", "code": "KWA", "contactEmail": "kwa@example.gov.in" },
      "assignedOfficer": { "id": "cm...", "name": "Er. Prakash Nair", "designation": "Assistant Executive Engineer", "email": "kwa.officer@kerala.demo" },
      "attachments": [{ "id": "cm...", "filename": "sample.png", "mimeType": "image/png", "size": 68, "createdAt": "2026-11-11T10:00:00.000Z" }],
      "assignments": [],
      "history": [
        {
          "id": "cm...",
          "type": "CREATED",
          "status": "SUBMITTED",
          "title": "Grievance submitted",
          "note": "Reference KLG-2026-9W3H6J generated and queued for CMO review.",
          "isInternal": false,
          "actorName": "Ananya Nair",
          "actorRole": "CITIZEN",
          "createdAt": "2026-11-09T10:00:00.000Z"
        }
      ],
      "feedback": null
    }
  }
}
```

For a citizen, internal history entries are removed from `history` before returning. Officers and CMO see all entries.

### POST `/api/grievances/:id/assign`

CMO only. Forwards the grievance to a department and optionally an officer.

```json
{
  "departmentId": "cm...",
  "officerId": "cm...",
  "note": "Please inspect the pipeline within 48 hours.",
  "dueAt": "2026-11-17T12:00:00.000Z"
}
```

- `departmentId` required (cuid).
- `officerId` optional but, if supplied, must be an active officer in that department.
- `note` ≤ 500 characters; `dueAt` optional ISO datetime.
- Status becomes `UNDER_REVIEW` unless the case was already `IN_PROGRESS`.
- A resolved case cannot be assigned (`409`).
- Clears any previous resolution fields, creates an `Assignment` and an `ASSIGNMENT` history row.

Response:

```json
{
  "ok": true,
  "data": {
    "department": "Kerala Water Authority",
    "officer": "Er. Prakash Nair",
    "status": "UNDER_REVIEW",
    "message": "Grievance forwarded successfully."
  }
}
```

### PATCH `/api/grievances/:id/status`

CMO or officer. Updates the workflow status with an optional note.

```json
{ "status": "IN_PROGRESS", "note": "Field inspection started." }
```

Allowed statuses: `UNDER_REVIEW`, `IN_PROGRESS`, `RESOLVED`, `REOPENED` (not `SUBMITTED`).

- **Officer:** only `IN_PROGRESS`, and only for the own department. Attempting another status returns `403` with an explanation to submit an action-taken report.
- **CMO:** may use the endpoint for administrative transitions, but the normal resolution path is the review endpoint.
- Setting the same status returns `409`.
- `RESOLVED` sets `resolvedAt` and `cmoApprovedAt`.
- `REOPENED` sets `reopenedAt`, stores the note as `reopenReason`, and clears resolution timestamps.

Response:

```json
{ "ok": true, "data": { "message": "Status updated successfully." } }
```

### POST `/api/grievances/:id/remarks`

CMO or officer. Adds a remark to the audit trail.

```json
{ "note": "Citizen called; inspection scheduled for Friday.", "visibleToCitizen": true }
```

- Note 2–1000 characters.
- CMO controls visibility with `visibleToCitizen` (default `false`).
- **Officer remarks are always visible to the citizen** in this implementation (`isInternal = false`), regardless of the flag. This is intentional: officers have no private channel equivalent to the CMO's internal note.
- Officer access is limited to the own department.

Response:

```json
{ "ok": true, "data": { "internal": false, "message": "Remark shared with the citizen." } }
```

### POST `/api/grievances/:id/escalate`

CMO only. Raises escalation level and priority.

```json
{ "reason": "SLA breached and the department has not responded." }
```

- Reason 5–500 characters.
- `LOW → MEDIUM`, `MEDIUM → HIGH`, `HIGH → HIGH`.
- Increments `escalationLevel`; writes an internal `ESCALATION` history row.
- Resolved cases cannot be escalated (`409`).

Response:

```json
{
  "ok": true,
  "data": {
    "level": 1,
    "priority": "HIGH",
    "message": "Escalated to Level 1. Priority is now HIGH."
  }
}
```

### POST `/api/grievances/:id/resolution`

Officer only. Submits an action-taken report for CMO review.

```json
{ "report": "The damaged pipeline was replaced on 12 November and water supply was restored to all 42 households. Chlorination was completed and the sample tested safe." }
```

- Report 20–4000 characters.
- Officer must belong to the grievance's department.
- Status remains `IN_PROGRESS`; the case enters the CMO review queue.
- Only one unreviewed report at a time (`409`).
- Resolved cases reject new reports.
- Marks outstanding assignments `ACKNOWLEDGED` and writes a `RESOLUTION` history row.

Response:

```json
{
  "ok": true,
  "data": {
    "message": "Action-taken report submitted. The CMO office will review it before closing the case."
  }
}
```

### POST `/api/grievances/:id/review`

CMO only. Approves or rejects the pending action-taken report.

```json
{ "action": "APPROVE", "note": "Verified with the ward member; supply restored." }
```

```json
{ "action": "REOPEN", "note": "Only a temporary clamp was fitted; the leak continues." }
```

- `action` is `APPROVE` or `REOPEN`.
- A report must exist and not have been reviewed (`409`).
- Rejecting requires a note (`422`).
- Approve: status `RESOLVED`, sets `resolvedAt`/`cmoApprovedAt`, completes assignments, adds a status history row.
- Reject: status `REOPENED`, stores `reopenReason`, clears approval/resolution timestamps, adds a reopen history row.

Response:

```json
{
  "ok": true,
  "data": { "message": "Resolution confirmed. The citizen can now see the outcome." }
}
```

### POST `/api/grievances/:id/feedback`

Citizen owner only. Records satisfaction after resolution.

```json
{ "rating": 5, "comments": "The repair team came the next morning and the supply is back to normal." }
```

- Rating integer 1–5 (numeric strings are coerced by Zod).
- Comments optional, ≤ 1000 characters.
- Grievance must be `RESOLVED`, must belong to the citizen, and must not already have feedback (`409`).
- Creates a `CitizenFeedback` row and an internal `FEEDBACK` history row.

Response:

```json
{ "ok": true, "data": { "message": "Thank you. Your feedback has been recorded." } }
```

### POST `/api/grievances/:id/reopen`

Citizen owner only. Reopens a resolved grievance.

```json
{ "reason": "The temporary slab has already cracked and the footpath is unsafe again." }
```

- Reason 10–1000 characters.
- Grievance must be `RESOLVED` and owned by the citizen.
- Status becomes `REOPENED`; `reopenedAt` and `reopenReason` are set; approval/resolution timestamps are cleared.
- Writes a `REOPEN` history row.

Response:

```json
{
  "ok": true,
  "data": { "message": "Grievance reopened. The CMO office will review your reason and take further action." }
}
```

---

## 5. Public endpoints

### GET `/api/track/:reference`

Public. Looks up a grievance by reference number and returns a privacy-filtered projection.

- Reference shape: `KLG-YYYY-XXXXXX` (case-insensitive; normalised to uppercase).
- Rate limit: 60 / 15 minutes per IP.
- Invalid format → `422`; unknown reference → `404`.
- No citizen identity, contact details, internal notes or attachment metadata.
- Description truncated to 600 characters.
- Includes `isOverdue`, department, public history, feedback and resolution report.

```bash
curl http://localhost:3000/api/track/KLG-2026-7K2M9P
```

```json
{
  "ok": true,
  "data": {
    "grievance": {
      "referenceNo": "KLG-2026-7K2M9P",
      "subject": "Deep pothole near Kazhakkoottam junction is causing accidents",
      "description": "A deep pothole has formed on the main road near Kazhakkoottam junction…",
      "category": "Roads & Infrastructure",
      "district": "Thiruvananthapuram",
      "priority": "HIGH",
      "status": "SUBMITTED",
      "createdAt": "2026-11-11T08:00:00.000Z",
      "dueAt": "2026-11-14T08:00:00.000Z",
      "isOverdue": false,
      "department": { "name": "Public Works Department", "code": "PWD" },
      "history": [
        {
          "id": "cm...",
          "type": "CREATED",
          "status": "SUBMITTED",
          "title": "Grievance submitted",
          "note": "Reference KLG-2026-7K2M9P generated and queued for CMO review.",
          "actorName": "Ananya Nair",
          "actorRole": "CITIZEN",
          "createdAt": "2026-11-11T08:00:00.000Z"
        }
      ],
      "feedback": null
    }
  }
}
```

### GET `/api/departments`

Public. Returns departments with grievance counts.

- When a user is signed in, the response also includes active officers per department (needed by the CMO assignment picker).
- Public responses omit officer lists.

```json
{
  "ok": true,
  "data": {
    "departments": [
      {
        "id": "cm...",
        "code": "KWA",
        "name": "Kerala Water Authority",
        "description": "Drinking water supply, pipelines, treatment plants and public water tanks.",
        "headName": "Er. Anil Mathew",
        "contactEmail": "kwa@example.gov.in",
        "contactPhone": "0471-251 8300",
        "_count": { "grievances": 3 }
      }
    ]
  }
}
```

### POST `/api/contact`

Public. Saves a contact enquiry. Rate limit 5/hour per IP.

```json
{
  "name": "Meera S.",
  "email": "meera@example.com",
  "subject": "Question about tracking",
  "message": "Can I track a grievance submitted by my father using his reference number?"
}
```

- Name 2–80; valid email; subject 4–120; message 10–2000.
- No email is sent; the enquiry is stored for CMO staff.

Response `201`:

```json
{
  "ok": true,
  "data": {
    "id": "cm...",
    "message": "Your message has been received. The CMO office will respond by email."
  }
}
```

### GET `/api/health`

Public. Not wrapped in the standard envelope.

```json
{
  "ok": true,
  "service": "cm-kerala-grievance-portal",
  "database": true,
  "aiConfigured": false,
  "time": "2026-11-11T16:27:00.885Z"
}
```

Returns `503` when `SELECT 1` fails. Use this for deployment verification.

---

## 6. CMO endpoints

### GET `/api/contact`

CMO only. Returns up to 100 enquiries, newest first.

```json
{
  "ok": true,
  "data": {
    "enquiries": [
      {
        "id": "cm...",
        "name": "Meera S.",
        "email": "meera@example.com",
        "subject": "Question about tracking",
        "message": "Can I track a grievance…",
        "status": "NEW",
        "createdAt": "2026-11-10T11:00:00.000Z",
        "updatedAt": "2026-11-10T11:00:00.000Z"
      }
    ]
  }
}
```

### GET `/api/stats`

CMO only. Returns dashboard totals, breakdowns, trend and recent grievances.

```json
{
  "ok": true,
  "data": {
    "stats": {
      "totals": {
        "total": 17,
        "pending": 13,
        "resolved": 4,
        "overdue": 4,
        "awaitingReview": 1,
        "escalated": 1,
        "reopened": 2,
        "avgResolutionDays": 5.5,
        "feedbackCount": 4,
        "avgRating": 4.8
      },
      "byStatus": [
        { "status": "SUBMITTED", "count": 3 },
        { "status": "UNDER_REVIEW", "count": 4 },
        { "status": "IN_PROGRESS", "count": 5 },
        { "status": "RESOLVED", "count": 4 },
        { "status": "REOPENED", "count": 2 }
      ],
      "byPriority": [{ "priority": "HIGH", "count": 9 }],
      "byDistrict": [{ "district": "Ernakulam", "count": 4 }],
      "byDepartment": [{ "name": "Kerala Water Authority", "count": 3 }],
      "byCategory": [{ "category": "Water Supply", "count": 3 }],
      "trend": [{ "label": "21 Sep", "created": 1, "resolved": 0 }],
      "recent": []
    }
  }
}
```

`pending` is the sum of Submitted, Under Review, In Progress and Reopened. `awaitingReview` counts reports with `resolutionSubmittedAt` set, no `cmoApprovedAt`, and status not Resolved. `overdue` excludes Resolved.

---

## 7. AI endpoint

### POST `/api/ai/analyze`

Citizen or CMO. Returns advisory triage for a draft complaint. Rate limit 30/hour per user.

```json
{
  "subject": "No water for four days",
  "description": "There has been no piped water supply in our ward for four days and the pipeline is leaking near the school.",
  "district": "Ernakulam",
  "category": "Water Supply"
}
```

- Description 20–4000 characters.
- Subject ≤ 160; district/category optional but validated when present.
- Duplicate candidates are searched among non-resolved grievances from the last 180 days, optionally filtered to the same district, up to 80 rows.

Response:

```json
{
  "ok": true,
  "data": {
    "analysis": {
      "source": "llm",
      "providerLabel": "LLM · gpt-4o-mini",
      "model": "gpt-4o-mini",
      "departmentCode": "KWA",
      "departmentName": "Kerala Water Authority",
      "category": "Water Supply",
      "priority": "HIGH",
      "summary": "No piped water supply for four days in the ward; a leaking pipeline near the school may be contaminating the supply.",
      "confidence": 0.83,
      "rationale": "Water supply interruption and pipeline leak; children at risk.",
      "duplicates": [
        { "referenceNo": "KLG-2026-4R8T2N", "subject": "Salty drinking water", "status": "UNDER_REVIEW", "createdAt": "2026-11-07T09:00:00.000Z", "score": 0.51 }
      ],
      "notice": "AI suggestions are advisory only. A citizen or CMO officer must review them before any official action is taken.",
      "elapsedMs": 812
    }
  }
}
```

When no key is configured or the provider fails, the same shape is returned with:

```json
{
  "source": "fallback",
  "providerLabel": "Labelled fallback (no AI key configured)",
  "model": null
}
```

The fallback never claims to be an LLM. See [05_AI_Integration.md](05_AI_Integration.md).

---

## 8. Attachment endpoint

### GET `/api/attachments/:id`

Signed in and authorised. Streams the original bytes.

- CMO: any attachment.
- Citizen: only attachments on own grievances.
- Officer: only attachments on grievances in the own department.
- Query `?download=1` forces `Content-Disposition: attachment`; otherwise inline.
- Headers include the stored MIME type, `Content-Length`, `X-Content-Type-Options: nosniff` and `Cache-Control: private, no-store`.
- Errors use the JSON envelope (`403`, `404`); success is a binary response.

```bash
curl -b cookies.txt -o evidence.png http://localhost:3000/api/attachments/cm...?download=1
```

---

## 9. Demo seed endpoint

### POST `/api/admin/seed`

Requires `ALLOW_DEMO_SEED=true`. Requires header `x-seed-token` equal to `SEED_TOKEN`.

```bash
curl -X POST https://<your-project>.vercel.app/api/admin/seed \
  -H "x-seed-token: <SEED_TOKEN>"
```

Response when seeding or when data already exists:

```json
{
  "ok": true,
  "data": {
    "seeded": true,
    "departments": 11,
    "users": 16,
    "grievances": 17,
    "message": "Demo data ready: 17 new grievances, 4 citizens, 11 officers."
  }
}
```

Errors: `403` when disabled, `401` for a missing/wrong token, `500` when `SEED_TOKEN` is not configured. The seed skips when grievances already exist (`seeded: false`).

---

## 10. Client integration notes

- Always unwrap `payload.data`. For example, tracking uses `payload.data.grievance`, login uses `payload.data.redirectTo`, and submit uses `payload.data.referenceNo`.
- Validation errors arrive in `details` as an array of `{ field, message }`; map them to form fields.
- Send cookies with same-origin `fetch` (the default) or `curl -b cookies.txt`.
- For multipart submission, do not set `Content-Type` manually; let the browser set the boundary.
- Mutations are not idempotent by design: retrying a review, feedback or reopen can return `409`. The UI disables submit buttons while pending.
- On `401`, redirect to `/login`; on `403`, show a permission message rather than retrying.

## 11. API-to-requirement traceability

| Machine-test operation | Endpoint |
| --- | --- |
| Registration | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Submit grievance | `POST /api/grievances` |
| List grievances | `GET /api/grievances` |
| Retrieve grievance | `GET /api/grievances/:id` |
| Track by ID | `GET /api/track/:reference` |
| Update status | `PATCH /api/grievances/:id/status` |
| Retrieve departments | `GET /api/departments` |
| CMO statistics | `GET /api/stats` |
| AI analysis | `POST /api/ai/analyze` |
| Assignment / forward | `POST /api/grievances/:id/assign` |
| Internal remarks | `POST /api/grievances/:id/remarks` |
| Escalation | `POST /api/grievances/:id/escalate` |
| Action-taken report | `POST /api/grievances/:id/resolution` |
| Review resolution | `POST /api/grievances/:id/review` |
| Citizen feedback | `POST /api/grievances/:id/feedback` |
| Reopen | `POST /api/grievances/:id/reopen` |
| Contact enquiry | `POST /api/contact` |
| File upload | `POST /api/grievances` (multipart) |
| File retrieval | `GET /api/attachments/:id` |

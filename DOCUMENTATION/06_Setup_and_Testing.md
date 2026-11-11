# 06 — Setup and Testing

This document covers local setup, automated and manual testing, GitHub/Vercel/Neon deployment, verification, and troubleshooting.

## 1. Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | 20.9 or newer (22/24 recommended) |
| npm | 10 or newer |
| PostgreSQL | 14 or newer (Docker, native, or a managed provider) |
| Git | Any recent version |
| OpenSSL (optional) | For generating secrets in Git Bash/macOS/Linux |
| Vercel account | For the hosted deployment |
| Neon account | Free PostgreSQL project, or any managed Postgres |

The author's development environment used Node 24 and a portable PostgreSQL instance on `127.0.0.1:55432`. Any standard PostgreSQL on port 5432 works equally well; only `DATABASE_URL` changes.

## 2. Local setup

### 2.1 Install dependencies

```bash
cd cm-kerala-grievance-portal
npm install
```

`postinstall` runs `prisma generate`. If Prisma reports an `EPERM` error on Windows, stop any running `next dev` process first (it holds the query-engine DLL), then rerun `npx prisma generate`.

### 2.2 Start PostgreSQL

Using Docker:

```bash
docker run --name klg-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cmo_grievance \
  -p 5432:5432 -d postgres:16
```

Using an existing PostgreSQL server, create a database:

```sql
CREATE DATABASE cmo_grievance;
```

### 2.3 Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cmo_grievance?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/cmo_grievance?schema=public"
AUTH_SECRET="<at least 32 random characters>"
AI_API_KEY=""
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o-mini"
AI_TIMEOUT_MS="15000"
SEED_TOKEN="<a long random token>"
ALLOW_DEMO_SEED="true"
```

Generate secrets:

```bash
openssl rand -base64 48   # AUTH_SECRET
openssl rand -hex 24      # SEED_TOKEN
```

Never commit `.env`.

### 2.4 Apply the migration

```bash
npx prisma migrate deploy
```

This applies `prisma/migrations/20261111000000_init/migration.sql` and creates all tables, enums, indexes and foreign keys.

For schema development:

```bash
npx prisma migrate dev --name describe-your-change
npx prisma generate
```

### 2.5 Start the app

```bash
npm run dev
```

Open <http://localhost:3000>. If port 3000 is busy, use `npm run dev -- -p 3100`.

### 2.6 Seed the demo data

With the server running and `ALLOW_DEMO_SEED="true"`:

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "x-seed-token: <SEED_TOKEN>"
```

Expected response:

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

The seed skips if grievances already exist. To force a fresh demo dataset, reset the database (section 8) and call the endpoint again.

### 2.7 Verify

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/departments
```

Then sign in at `/login` with `cmo@kerala.demo` / `Demo@CMO2026`.

## 3. Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | `prisma generate && next build` |
| `npm run vercel-build` | `prisma generate && prisma migrate deploy && next build` |
| `npm start` | Start the production server after a build |
| `npm run typecheck` | Strict TypeScript check (`tsc --noEmit`) |
| `npm test` | Compile tests with `tests/tsconfig.json` and run with Node's test runner |
| `npm run db:deploy` | Apply committed migrations |
| `npm run db:migrate` | Create/apply a development migration |
| `npm run db:push` | Push schema without a migration (development convenience) |
| `npm run db:studio` | Open Prisma Studio |
| `postinstall` | Automatically runs `prisma generate` |

## 4. Environment variables

| Variable | Required | Example / notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled Postgres URL in production; local Postgres URL in development |
| `DIRECT_URL` | Yes | Unpooled URL for migrations; can equal `DATABASE_URL` locally |
| `AUTH_SECRET` | Yes | 32+ characters; invalid/missing in production causes auth failures |
| `AI_API_KEY` | No | Enables the real LLM path |
| `AI_BASE_URL` | No | Defaults to OpenAI |
| `AI_MODEL` | No | Defaults to `gpt-4o-mini` |
| `AI_TIMEOUT_MS` | No | Defaults to 15000 |
| `SEED_TOKEN` | For seeding | Shared secret for `x-seed-token` |
| `ALLOW_DEMO_SEED` | For seeding | Must be `"true"`; set to `"false"` after seeding |

`src/lib/auth.ts` falls back to a development-only secret when `NODE_ENV !== "production"`. Production requires a valid `AUTH_SECRET`.

## 5. Automated testing

### 5.1 Run the suite

```bash
npm test
```

This compiles the TypeScript tests to `.test-build/` and runs 37 tests with `node --test`.

Expected tail:

```text
ℹ tests 37
ℹ pass 37
ℹ fail 0
```

### 5.2 What is covered

| File | Tests | Coverage |
| --- | --- | --- |
| `tests/utils.test.ts` | 12 | Reference number format/uniqueness, `addDays`, `isOverdue`, `daysUntil`, `percentage`, `truncate`, `parsePage`, `pluralise`, whitespace normalisation, email masking, query-string building |
| `tests/validation.test.ts` | 9 | Registration email normalisation and password/mobile rules, login shape, grievance district/category/description constraints, priority/AI defaults, AI minimum length, contact validation, reopen minimum, feedback coercion |
| `tests/ai.test.ts` | 8 | Fallback department/category/priority, confidence, summary limits, duplicate scoring, resolved exclusion, top-3 limit, short-input guard |
| `tests/sla.test.ts` | 8 | Exact five statuses, SLA ordering, priority metadata, 14 districts, department-to-category mapping, keyword/lookup sync, role homes, demo account uniqueness |

### 5.3 Quality gates

```bash
npm run typecheck
npm test
npm run build
```

All three passed on 12 November 2026 before documentation was finalised.

### 5.4 Why the test setup uses `tsc`

The environment did not have a working `vitest`/`tsx`/`esbuild` toolchain. The tests therefore compile with the project's TypeScript compiler and run on Node's built-in test runner, adding no production dependency. `.test-build/` is a generated directory and is gitignored.

## 6. Manual end-to-end test matrix

Run these against a production build (`npm run build && npm start`) or the hosted URL.

### 6.1 Public website

| # | Test | Expected |
| --- | --- | --- |
| P1 | Open `/` | Hero, live stats, workflow, departments render; no console errors |
| P2 | Open `/about`, `/how-it-works`, `/departments`, `/faq` | Content renders; department contact details visible |
| P3 | Submit `/contact` with valid data | "Message received"; enquiry appears in CMO inbox |
| P4 | Submit `/contact` with a short message | Inline field error, no enquiry created |
| P5 | Track a seeded reference (`KLG-2026-7K2M9P`) | Status, department, public timeline render |
| P6 | Track a malformed/unknown reference | Friendly error; no stack trace |
| P7 | Open `/does-not-exist` | Custom 404 with links to home/login/track |

### 6.2 Authentication and RBAC

| # | Test | Expected |
| --- | --- | --- |
| A1 | Register a new citizen | Redirect to `/citizen?welcome=1`; session cookie set |
| A2 | Register with an existing email | 409 message shown |
| A3 | Login as CMO | Redirect to `/cmo`; CMO navigation visible |
| A4 | Login as Health officer | Redirect to `/officer`; only Health queue |
| A5 | Login as citizen | Redirect to `/citizen` |
| A6 | Citizen visits `/cmo` | Redirect to `/citizen` |
| A7 | Officer visits another department's grievance URL | 403/not found; no data leak |
| A8 | Sign out | Cookie cleared; protected pages redirect to `/login` |
| A9 | Call `/api/grievances` without a cookie | 401 JSON envelope |

### 6.3 Citizen flow

| # | Test | Expected |
| --- | --- | --- |
| C1 | Submit grievance with all fields and a PNG/PDF | Success screen with unique `KLG-2026-XXXXXX` |
| C2 | Submit with a 5 MB or `.exe` file | Inline error; no grievance created |
| C3 | Run AI analysis on a 20+ character complaint | Suggestions, source label, confidence, rationale, advisory notice |
| C4 | Adopt AI suggestions and submit | Saved AI fields; AI record in timeline |
| C5 | Dashboard counts | Total/pending/resolved/reopened match the citizen's cases |
| C6 | Open own grievance | Public timeline, department, SLA, attachments |
| C7 | Download own attachment | File opens/downloads with correct type |
| C8 | Attempt another citizen's grievance/attachment | 403/not found |
| C9 | Give feedback on a resolved case | Success; rating shown; cannot submit twice |
| C10 | Reopen a resolved case with a 10+ character reason | Status becomes Reopened; CMO queue updated |
| C11 | Track own reference publicly | No email/mobile/internal notes exposed |

### 6.4 CMO flow

| # | Test | Expected |
| --- | --- | --- |
| M1 | Command centre | Total, pending, resolved, overdue; charts from stored data; recent cases |
| M2 | Filter by district/category/priority/status | Result count and rows update |
| M3 | Search by reference or subject | Matching rows |
| M4 | Overdue filter / awaiting-review view | Only matching cases |
| M5 | Open grievance detail | Citizen context, AI record, attachments, assignment history, full timeline |
| M6 | Assign to KWA + officer | Status Under Review; assignment and history rows added |
| M7 | Add internal remark | Visible to CMO/officer, hidden from citizen/public |
| M8 | Add citizen-visible remark | Appears in citizen timeline |
| M9 | Escalate | Level increments; priority rises; internal escalation entry |
| M10 | Review officer's action-taken report → Approve | Status Resolved; assignment completed; citizen sees outcome |
| M11 | Reject a report with a reason | Status Reopened; reason recorded |
| M12 | Contact enquiries | Submitted public messages listed |
| M13 | Download an attachment | Served only with a CMO session |

### 6.5 Officer flow

| # | Test | Expected |
| --- | --- | --- |
| O1 | Department overview | Only own department counts and cases |
| O2 | Open assigned grievance | Details, attachments, internal timeline |
| O3 | Add investigation remark | Visible to citizen (officer remarks are citizen-visible) |
| O4 | Move to In Progress | Status updated with officer attribution |
| O5 | Submit action-taken report | Status stays In Progress; appears in CMO review queue |
| O6 | Attempt to resolve directly | Blocked with an explanation |
| O7 | Attempt to assign/escalate | 403 |
| O8 | Open another department's case | 403/not found |

### 6.6 Cross-cutting

| # | Test | Expected |
| --- | --- | --- |
| X1 | Every status change | Timestamp + actor name/role in history |
| X2 | Refresh after actions | Server-rendered data reflects changes |
| X3 | Mobile viewport | Sidebar becomes a drawer; forms remain usable |
| X4 | Keyboard navigation | Focus states and labels on inputs/buttons |
| X5 | Rate limits | Repeated login/track/contact requests eventually return 429 |
| X6 | Health | `/api/health` returns `database: true`; `aiConfigured` matches env |

## 7. API smoke tests

Use a cookie jar:

```bash
# Login as CMO
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cmo@kerala.demo","password":"Demo@CMO2026"}'

# Statistics
curl -b cookies.txt http://localhost:3000/api/stats

# List submitted cases
curl -b cookies.txt "http://localhost:3000/api/grievances?status=SUBMITTED"

# Departments with officer lists
curl -b cookies.txt http://localhost:3000/api/departments

# AI analysis
curl -b cookies.txt -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"description":"The water pipeline near our school has been leaking for three days and children are falling sick."}'

# Public tracking
curl http://localhost:3000/api/track/KLG-2026-7K2M9P
```

## 8. Resetting demo data

> **Destructive.** This drops all rows in the configured database. Use only on a demo/local database, never on shared production data.

```bash
npx prisma migrate reset
# Server must be running to call the seed endpoint:
curl -X POST http://localhost:3000/api/admin/seed \
  -H "x-seed-token: <SEED_TOKEN>"
```

Alternatively, create a new Neon branch/database and redeploy.

## 9. GitHub repository

From the project root:

```bash
git init
git add .
git status --short          # verify .env is NOT listed
git commit -m "CM Kerala grievance portal - full-stack prototype"
git branch -M main
git remote add origin https://github.com/<your-account>/cm-kerala-grievance-portal.git
git push -u origin main
```

Before pushing:

```bash
git check-ignore .env        # should print .env
git ls-files | grep -i "\.env"   # should print nothing
```

If `.env` was ever committed, remove it from tracking and history before pushing, and rotate every secret it contained.

## 10. Deployment (Vercel + Neon)

### 10.1 Create the Neon database

1. Sign in at <https://neon.tech> and create a project (any region close to the reviewer; choose a Kerala/India-adjacent region if available).
2. Create a database named `cmo_grievance`.
3. Copy two connection strings from the dashboard:
   - **Pooled** (host contains `-pooler`) → `DATABASE_URL`.
   - **Direct/unpooled** → `DIRECT_URL`.
4. Both should include `sslmode=require`.
5. If Prisma reports prepared-statement issues over the pooled connection, append `&pgbouncer=true` to `DATABASE_URL` (keep `DIRECT_URL` unpooled).

Example shapes:

```env
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/cmo_grievance?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/cmo_grievance?sslmode=require"
```

### 10.2 Import into Vercel

1. Sign in at <https://vercel.com> and choose **Add New → Project**.
2. Import the GitHub repository.
3. Framework preset: **Next.js**. Root directory: repository root.
4. Build command: leave default; Vercel uses the `vercel-build` script, which runs:
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```
5. Install command: default `npm install` (postinstall generates Prisma).
6. Node.js version: 20.x or 22.x.
7. Add environment variables for **Production** (and Preview if desired):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled URL |
| `DIRECT_URL` | Neon unpooled URL |
| `AUTH_SECRET` | `openssl rand -base64 48` output |
| `AI_API_KEY` | Optional real LLM key |
| `AI_BASE_URL` | e.g. `https://api.openai.com/v1` |
| `AI_MODEL` | e.g. `gpt-4o-mini` |
| `AI_TIMEOUT_MS` | `15000` |
| `SEED_TOKEN` | `openssl rand -hex 24` output |
| `ALLOW_DEMO_SEED` | `true` for the first deployment |

8. Deploy. The first deployment creates all tables via `prisma migrate deploy`.

### 10.3 Seed once

```bash
curl -X POST https://<your-project>.vercel.app/api/admin/seed \
  -H "x-seed-token: <SEED_TOKEN>"
```

Verify the response reports 11 departments, 16 users and 17 grievances.

### 10.4 Lock the seed endpoint

In Vercel → Settings → Environment Variables, set `ALLOW_DEMO_SEED="false"` and redeploy. The endpoint then returns 403 even with a valid token. Keep `SEED_TOKEN` secret regardless.

### 10.5 Verify the deployment

1. `GET https://<your-project>.vercel.app/api/health` → `database: true`; `aiConfigured` reflects whether a key is set.
2. Public pages return 200 and render on mobile.
3. Sign in with each demo role.
4. Submit a test grievance, track it publicly, attach a file, download it.
5. Run the assign → officer report → CMO approve → citizen feedback → reopen loop.
6. Check `/cmo/enquiries` after sending a contact message.
7. Confirm `/cmo` is inaccessible to a citizen account.
8. For the AI demo, call `/api/ai/analyze` and confirm `source` is `llm` when a key is configured.

### 10.6 Update the submission fields

Replace the placeholders in `README.md` section 1 and in the submission message with:

- Hosted application URL.
- GitHub repository URL.
- Demo video URL.
- Demo credentials (already listed).
- AI mode used in the hosted demo (LLM or labelled fallback).

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `P1001: Can't reach database server` | Postgres not running or wrong host/port | Start the container/server; check `DATABASE_URL` port (5432 vs 55432) |
| `P1000: Authentication failed` | Bad DB username/password or missing SSL | Check credentials; add `sslmode=require` for Neon |
| `Environment variable not found: DIRECT_URL` | `.env` missing the variable | Add `DIRECT_URL` (same as `DATABASE_URL` locally) |
| `EPERM ... query_engine-windows.dll.node` on `prisma generate` | Dev server holds the DLL | Stop `next dev`, rerun generate, restart |
| `AUTH_SECRET is missing or too short` in production | Env var absent/short | Set a 32+ character secret and redeploy |
| Login succeeds but pages redirect to `/login` | Cookie blocked or `AUTH_SECRET` changed | Use HTTPS, allow cookies, verify env consistency; sign in again |
| Seed returns 403 | `ALLOW_DEMO_SEED` not `"true"` | Set it and redeploy |
| Seed returns 401 | Missing/wrong `x-seed-token` | Use the exact `SEED_TOKEN` value |
| Seed returns 500 "SEED_TOKEN is not configured" | Missing env | Set `SEED_TOKEN` and redeploy |
| Demo data missing after redeploy | Seed skipped or DB empty | Call the seed endpoint once; it skips only when grievances exist |
| Upload fails on Vercel | File too large for the function body limit | Keep attachments under 4 MB; the server rejects larger files |
| AI always says fallback | No `AI_API_KEY`, or provider error | Set the key/base URL/model; inspect server logs for the provider status |
| `prisma migrate deploy` fails in build | Wrong `DIRECT_URL` or DB unreachable | Use the unpooled Neon URL; confirm the database exists |
| Neon connection timeouts after idle | Free-tier scale-to-zero | Retry; the first request wakes the database |
| Rate limits behave differently across requests | In-memory limits per serverless instance | Production would use Redis; for the demo, wait or restart |
| Tests fail with "Cannot find module .test-build/tests" | Node version lacks directory test discovery | Use the committed `npm test` script (explicit glob) on Node 20+ |
| Build fails on fonts | No network access to Google Fonts during build | Retry with network access; Next fetches Inter and Source Serif 4 |

## 12. Security checklist before submission

- [ ] `.env` is untracked and absent from Git history.
- [ ] No `sk-...`, database passwords, seed tokens or private URLs in any committed file.
- [ ] `AUTH_SECRET` is unique and 32+ characters in production.
- [ ] `SEED_TOKEN` is unique and not reused from documentation.
- [ ] `ALLOW_DEMO_SEED` is `false` after seeding.
- [ ] Demo accounts contain only fictional names/emails.
- [ ] No real grievance data or government credentials are present.
- [ ] Repository README states the independent-demonstration disclaimer.
- [ ] Public tracking exposes no personal data or internal notes.
- [ ] Attachments are access-checked.
- [ ] Hosted app uses HTTPS so the session cookie is `secure`.

## 13. Final submission checklist

- [ ] Hosted URL loads without local setup.
- [ ] GitHub repository is public (or access has been granted to the evaluator).
- [ ] README has demo credentials, hosted URL, repo URL and AI-mode note.
- [ ] `DOCUMENTATION/01`–`07` and the demo script are present.
- [ ] Architecture and ER diagrams render.
- [ ] `/api/health` reports the database as reachable.
- [ ] All three demo roles sign in successfully.
- [ ] End-to-end workflow has been demonstrated in the video.
- [ ] Video is 3–5 minutes and shows the hosted URL.
- [ ] Submission message includes links and credentials (template in README section 11).
- [ ] Deadline: **12 November 2026, 8:00 PM IST**.

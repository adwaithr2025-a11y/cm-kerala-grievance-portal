# 08 — Demo Video Script (3–5 minutes)

The video is recorded by the candidate. This script covers every mandatory workflow, the failed-login check, all five statuses and the labelled AI fallback.

**Record the final take on the hosted deployment, with the browser address bar visible.** A localhost recording does not demonstrate that the app is deployed.

Target length: **4:30–4:50**.

---

## 1. Before you record

### Deploy and seed first

Complete the deployment in [06 Setup and Testing](06_Setup_and_Testing.md#10-deployment-vercel--neon) or README section 10. Then:

1. Open the hosted URL and confirm `/api/health` returns `database: true`.
2. Seed the hosted database once using the `x-seed-token` header.
3. Set `ALLOW_DEMO_SEED=false` and redeploy after seeding.
4. Sign in once with each demo role to confirm the hosted build works.

The seed creates 11 departments, 1 CMO administrator, 11 officers, 4 citizens, 17 grievances and 3 contact enquiries.

### Retakes on the hosted app

The script registers `rahul.k@example.com`. On a fresh database it is free. If you need a second take, use `rahul2.k@example.com`, then `rahul3.k@example.com`, and keep the failed-login email unchanged. Contact enquiries and grievances can be submitted repeatedly; only the email must be unique.

### Local rehearsal only

Rehearse locally before the final take if you want. A local reset helper is not part of the repository; reset your local database and re-run the protected seed endpoint as described in [06 Setup and Testing](06_Setup_and_Testing.md). The final recording must still be made on the hosted URL.

### Browser and recorder

- Chrome maximised, bookmarks bar hidden (Ctrl+Shift+B), zoom 100% (Ctrl+0).
- Close personal tabs and notifications. Hide `.env`, Vercel settings and terminal windows.
- Record at 1920×1080. OBS Studio or Windows Game Bar both work.
- Test the microphone first. Keep the address bar visible at the start so the hosted URL is on screen.
- Keep this script on a second screen or phone, not on the recorded screen.
- Attachment: any JPG or PNG under 4 MB.

---

## 2. Data cheat sheet

| What | Value |
|---|---|
| Failed login attempt | `rahul.k@example.com` / `WrongPassword123` |
| New citizen registration | Rahul Krishnan · `rahul.k@example.com` · `9847012345` · `Demo@Citizen2026` |
| CMO login | `cmo@kerala.demo` / `Demo@CMO2026` |
| Officer login | `kwa.officer@kerala.demo` / `Demo@Officer2026` |
| Grievance district / category | Ernakulam / Water Supply |
| Grievance subject | No piped water for four days in ward 12 |
| Assigned department | Kerala Water Authority |
| Assigned officer | Er. Prakash Nair — Assistant Executive Engineer |

Contact enquiry:

- Name: `Rahul Krishnan`
- Email: `rahul.k@example.com`
- Subject: `Wheelchair access at the Ernakulam taluk office`
- Message: `The ramp at the Ernakulam taluk office is blocked by parked vehicles almost every afternoon. Could the help desk look into it? I can share photos.`

---

## 3. Shot-by-shot script

### 0:00 – 0:20 · Intro (home page)

**On screen:** Hosted home page, address bar visible.

**Do:** Move the mouse slowly, scroll once to show the statistics and departments, then return to the top.

**Say:**

> Hi, this is my submission for the AI Full Stack Engineer machine test. I've built the CM Kerala Grievance Redressal Portal using Next.js, PostgreSQL and Prisma, with an AI assistant for triage. All the records you'll see are sample data.

---

### 0:20 – 0:42 · Public site and departments

**Do:** Open **Departments**, scroll once. Open **How it works** and scroll to the five stages.

**Say:**

> The public site explains the five stages — submitted, under review, in progress, resolved and reopened. Eleven departments take part, and each one gets its own officer queue.

---

### 0:42 – 1:05 · Contact enquiry

**Do:** Open **Contact**. Fill the four fields from the cheat sheet. Click **Send message** and wait for the green **Message received** panel.

**Say:**

> Citizens can write to the CMO help desk without logging in. I'll send a quick enquiry about accessibility, and it gets saved to the same PostgreSQL database. The CMO team will see it in their inbox in a moment.

---

### 1:05 – 1:32 · Failed sign-in, then registration

**Do:**
1. Click **Sign in**.
2. Enter `rahul.k@example.com` and `WrongPassword123`. Click **Sign in securely**.
3. Wait for the red **Invalid email or password** banner. Hold for two seconds.
4. Click **Create a citizen account**. Fill the registration fields.
5. Click **Create citizen account** and wait for the citizen dashboard welcome message.

**Say:**

> Now authentication. First, a wrong password — the API rejects it with a four-oh-one, and the form shows "Invalid email or password". Sessions use signed tokens in secure cookies, and each role is redirected to its own workspace. Let me register a new citizen instead. Name, email, mobile, password — and I'm in.

---

### 1:32 – 2:15 · File a grievance with AI triage

**Do:**
1. Click **Submit grievance**. Select Ernakulam and Water Supply.
2. Fill the subject and description.
3. Click **Analyse my complaint** and wait for the assistant panel.
4. Point at **Labelled fallback** and the suggestions.
5. Click **Apply suggestions**. Attach the image. Click **Submit grievance**.
6. Wait for the success screen and the `KLG-...` reference number.
7. Open **My grievances**, then the new case.

**Say:**

> I'll file a grievance. Ernakulam district, water supply category. No piped water for four days, and a health centre is affected. The AI assistant suggests the Kerala Water Authority, high priority, and a briefing for the CMO. These are advisory — I can apply, edit or ignore them. The model isn't configured in this environment, so it's using the clearly labelled fallback. I'll attach a photo and submit. Every grievance gets a reference number, and it starts at Submitted.

If a real model is configured on the hosted deployment, say so and point to the **Live model** label instead. Never claim an LLM is running when the fallback label is shown.

---

### 2:15 – 2:32 · Public tracking

**Do:** Sign out. Open **Track**, enter the reference and click **Track grievance**. Scroll the timeline.

**Say:**

> Anyone with the reference number can track it. The public timeline shows the status, department, target date and public updates — no personal details, internal notes or attachments.

---

### 2:32 – 2:55 · CMO dashboard and enquiries

**Do:** Sign in as CMO. Scroll past the KPI cards and charts. Open **Enquiries** and show the new enquiry. Return to the command centre.

**Say:**

> Now the CMO administrator's view. The dashboard is built from live database queries — totals, charts, SLA alerts and reopened cases. And the enquiry I sent is already in the inbox.

---

### 2:55 – 3:25 · Forward, remark and escalate

**Do:**
1. Open the new case from **All grievances**.
2. Assign **Kerala Water Authority** and **Er. Prakash Nair — Assistant Executive Engineer**.
3. Add the internal note and click **Forward to department**.
4. Add the official remark and click **Add official remark**.
5. Click **Escalate case**, enter the reason and confirm.
6. Pause on the **Under Review** badge and the history.

**Say:**

> I'll open the new case. I can see the AI analysis, the full status history and the audit trail. I'm forwarding it to the Kerala Water Authority and assigning Er. Prakash Nair. Then an internal remark, and an escalation, which raises the priority and records who did it and when. The status is now Under Review.

---

### 3:25 – 3:55 · Officer investigation and report

**Do:**
1. Sign in as the KWA officer. Show the department queue briefly.
2. Open the case and click **Mark investigation started**.
3. Add the investigation update.
4. Fill the action-taken report, submit it and wait for the "awaiting CMO review" message.

**Say:**

> Officers only see cases assigned to their department. I'll start the investigation — that moves it to In Progress. Then a public update, and the action-taken report. The report doesn't close the case; it stays In Progress and goes back to the CMO.

---

### 3:55 – 4:08 · CMO resolves

**Do:** Sign in as CMO, open the case and click **Confirm resolved**. Show the **Resolved** badge.

**Say:**

> Only the CMO can close a case. Confirming the report marks it Resolved and records the approver and the time.

---

### 4:08 – 4:32 · Citizen feedback and reopen

**Do:** Sign in as the citizen. Open the case, click five stars, add the comment and submit. Then reopen with a reason and show the **Reopened** badge.

**Say:**

> Back as the citizen, I can rate the resolution. Five stars. But the leak returns, so I'm reopening it with a reason. It's now Reopened and back in the CMO queue. That's all five statuses.

---

### 4:32 – 4:52 · Close-out

**Do:** Sign in as CMO. Show the dashboard with the increased **Reopened** count. Scroll once. Stop moving the mouse.

**Say:**

> Behind the scenes: role-based access control, file uploads through the API, thirty-seven automated tests, API documentation, and architecture and ER diagrams. The hosted link, repository and demo credentials are in my submission. Thank you for watching.

Stop recording.

---

## 4. Narration only (teleprompter)

> Hi, this is my submission for the AI Full Stack Engineer machine test. I've built the CM Kerala Grievance Redressal Portal using Next.js, PostgreSQL and Prisma, with an AI assistant for triage. All the records you'll see are sample data.
>
> The public site explains the five stages — submitted, under review, in progress, resolved and reopened. Eleven departments take part, and each one gets its own officer queue.
>
> Citizens can write to the CMO help desk without logging in. I'll send a quick enquiry about accessibility, and it gets saved to the same PostgreSQL database. The CMO team will see it in their inbox in a moment.
>
> Now authentication. First, a wrong password — the API rejects it with a four-oh-one, and the form shows "Invalid email or password". Sessions use signed tokens in secure cookies, and each role is redirected to its own workspace. Let me register a new citizen instead. Name, email, mobile, password — and I'm in.
>
> I'll file a grievance. Ernakulam district, water supply category. No piped water for four days, and a health centre is affected. The AI assistant suggests the Kerala Water Authority, high priority, and a briefing for the CMO. These are advisory — I can apply, edit or ignore them. The model isn't configured in this environment, so it's using the clearly labelled fallback. I'll attach a photo and submit. Every grievance gets a reference number, and it starts at Submitted.
>
> Anyone with the reference number can track it. The public timeline shows the status, department, target date and public updates — no personal details, internal notes or attachments.
>
> Now the CMO administrator's view. The dashboard is built from live database queries — totals, charts, SLA alerts and reopened cases. And the enquiry I sent is already in the inbox.
>
> I'll open the new case. I can see the AI analysis, the full status history and the audit trail. I'm forwarding it to the Kerala Water Authority and assigning Er. Prakash Nair. Then an internal remark, and an escalation, which raises the priority and records who did it and when. The status is now Under Review.
>
> Officers only see cases assigned to their department. I'll start the investigation — that moves it to In Progress. Then a public update, and the action-taken report. The report doesn't close the case; it stays In Progress and goes back to the CMO.
>
> Only the CMO can close a case. Confirming the report marks it Resolved and records the approver and the time.
>
> Back as the citizen, I can rate the resolution. Five stars. But the leak returns, so I'm reopening it with a reason. It's now Reopened and back in the CMO queue. That's all five statuses.
>
> Behind the scenes: role-based access control, file uploads through the API, thirty-seven automated tests, API documentation, and architecture and ER diagrams. The hosted link, repository and demo credentials are in my submission. Thank you for watching.

---

## 5. If something goes wrong

| Problem | Recovery |
|---|---|
| Email already registered | Use the next retake address, e.g. `rahul2.k@example.com`, and update the registration section. |
| Red login error does not appear | You typed the correct password. Sign out and repeat the failed-login step. |
| AI card shows the fallback label | That is expected without an API key. Say the fallback line honestly. |
| New grievance missing from the officer queue | Confirm the case was forwarded to Kerala Water Authority and assigned to the KWA officer. |
| **Escalate case** not visible | Scroll down to the escalation panel on the CMO case page. |
| CMO cannot approve | The officer must submit the action-taken report first. |
| Neon slow on first load | The database is waking up. Wait, reload, then start recording. |
| Video over 5:00 | Cut the Departments visit and the final All grievances list. |

---

## 6. Do not show on camera

- `.env`, Vercel environment variables, database passwords, `AUTH_SECRET`, `SEED_TOKEN` or API keys.
- GitHub settings, billing pages or account email addresses.
- Real personal data, real grievances or real government documents.
- Any claim that this is an official Government of Kerala service.

---

## 7. Final video checklist

- [ ] 3–5 minutes long.
- [ ] Hosted URL visible at the start.
- [ ] Failed login and successful registration shown.
- [ ] Contact enquiry submitted and seen in the CMO inbox.
- [ ] Public site, citizen, CMO and officer flows shown.
- [ ] AI assistant shown; its source described honestly.
- [ ] Attachment upload, feedback and reopen shown.
- [ ] All five statuses appear: Submitted, Under Review, In Progress, Resolved, Reopened.
- [ ] Dashboard charts and counts shown.
- [ ] No secrets or personal data on screen.
- [ ] Audio clear; text readable at 1080p.
- [ ] Video uploaded as YouTube Unlisted or a Drive link and added to the README and submission message.

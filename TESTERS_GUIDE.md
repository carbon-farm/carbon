# Testers Guide — Organic Carbon Farming

Practical guide for clicking through the live app. Not a formal SDLC document (see `000-Project-Charter.md` and `01-Product/` for those) — this is an operational runbook for QA.

**Live site:** https://carbon-xi-sepia.vercel.app
**Backend:** Render service `carbon-backend` (per `render.yaml`), Supabase-hosted Postgres.

## Test accounts

| Role | Mobile | Password | Notes |
|---|---|---|---|
| Administrator | `9999999999` | `ChangeMe123!` | Seeded account. **Change this password** — it's been sitting at the default since seeding; flagged repeatedly, not yet rotated. |
| Moderator / Expert / Vendor / Support Agent | — | — | Create via Admin → Staff accounts, with any temporary password you choose. |
| Farmer | — | — | Self-register via the public "Create an account" link. |

**OTP is on-screen, not SMS'd.** Registration and password-reset OTP appear directly on screen behind a red "Temporary" banner — deliberate, until a real SMS/WhatsApp vendor is chosen. Don't treat a missing SMS as a bug.

## Role walkthroughs

### Farmer
1. Register (or log in) → land on Dashboard.
2. Add a Farm/Land parcel — optionally capture GPS via "Use my location."
3. Report a problem (My Cases → New case): category, optional crop, problem description, optional priority request, optional photo/video evidence.
4. Submit the case.
5. Once a moderator/expert has acted: answer any follow-up question asked; once answered, confirm or dispute the resolution.
6. After confirming, check Knowledge or the dashboard's "Recent advice" — the resolved case auto-generates a draft guide that shows up here once a moderator publishes it, with a link back from the case detail page itself.
7. Watch the notification bell (top-right) — it should light up at each stage above.

### Moderator
1. Log in as a moderator.
2. Moderator Queue: start review on a submitted case, then assign it to a *verified* expert.
3. Article Queue: approve or reject articles experts submit (rejection requires a reason).
4. Try the sort/filter toolbar on both queues.

### Expert
1. Submit qualification/credentials once (Expert Portal) — an Administrator must verify before you can be assigned cases.
2. On an assigned case: start work, optionally ask the farmer a follow-up question, then answer.
3. Once the farmer confirms, check My Articles — a draft auto-generates from the closed case; edit it and submit for moderator review.
4. Watch the notification bell for new assignments and farmer responses.

### Administrator
1. Log in with the seeded account above.
2. Staff accounts: create Moderator/Expert/Vendor/Support Agent accounts.
3. Expert credentials: approve/reject pending qualifications.
4. Taxonomy: manage crops, case categories, tags, regions.
5. Audit log: every material action platform-wide, filterable by entity type and date.
6. Reports: case volume by status/category/crop, average resolution time, article funnel, expert workload, accounts by role.

## What's new this round — worth specifically checking

- **Reports** page (Admin → Reports).
- **Notification bell** (every role, top-right of header) — unread badge, click-through to the relevant screen, mark-as-read / mark-all-read.
- **Sort + filter toolbar** on every list screen: My Cases, Moderator Queue, Expert Cases, My Articles, Article Queue, Knowledge Browse, Staff Accounts, Expert Credentials, Taxonomy.
- Case detail pages (farmer + expert) now link through to the resulting Knowledge guide once it publishes.
- Knowledge nav link is now available to every role, not just Farmer.

## Known intentional limitations (not bugs)

- OTP is shown on-screen, not sent via SMS (see above).
- No Payment, Marketplace, Soil Laboratory, Finance, or Learning Management yet — each is blocked on a business decision (payment gateway, product catalog, lab partner, course content) that hasn't been made.
- Real SMS/WhatsApp/email/push notifications aren't wired yet — in-app notifications are live now as the interim.

## Reporting a bug

Include: your role, exact steps taken, expected vs. actual result, and — if applicable — the case or article ID from the URL.

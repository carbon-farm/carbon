# Organic Carbon Farming — Application Code

Implementation of the Organic Carbon Farming platform, following
[`../000-Project-Charter.md`](../000-Project-Charter.md) and the documentation series in
[`../01-Product/`](../01-Product/).

**Current stage:** Stage 1 (Foundation) is complete. [Stage 2 — Core Trust
Loop](../01-Product/04-Product-Roadmap.md#6-release-stages) is in progress: Case
Management's full state machine is built and verified; Knowledge Repository
publication, Notifications, and a Case-submission/Expert-Portal web UI are not
yet built. The [Pilot Gate](../01-Product/04-Product-Roadmap.md#7-the-pilot-gate)
— real farmers, real cases — is still ahead, not passed.

## Structure

```
app/
├── backend/          NestJS API (Stage 1 modules only)
├── web/               React PWA — login, register/OTP, Farmer Dashboard, Farm/Land
└── docker-compose.yml Local Postgres + Redis for development
```

## Port allocation

Every local service for this project uses a fixed port in **7000–7050**, so it
never collides with other projects' Postgres/Redis/dev-server instances on this
machine again (5433–5435 were already taken by unrelated native Postgres
instances the first time this was set up).

| Port | Service |
|---|---|
| 7000 | Backend API |
| 7001 | Web dev server (Vite) |
| 7002 | Postgres (host-mapped; container still listens on 5432 internally) |
| 7003 | Redis (host-mapped; container still listens on 6379 internally) |
| 7004–7050 | Reserved for future services (e.g. a background worker, a webhook receiver) |

## Running locally

```bash
cd app
docker compose up -d          # Postgres on localhost:7002, Redis on localhost:7003

cd backend
npm install
cp .env.example .env          # adjust JWT secrets before anything beyond local dev
npm run prisma:migrate        # creates the Stage 1 schema
npm run prisma:seed           # creates an initial Administrator + taxonomy data
npm run start:dev             # http://localhost:7000/api/v1
```

In a second terminal:

```bash
cd app/web
npm install
cp .env.example .env
npm run dev                   # http://localhost:7001
```

`GET /api/v1/health` checks the database connection.

The seed script prints the initial Administrator's mobile number and a temporary
password — change it immediately via `POST /api/v1/auth/password/reset` before
using this anywhere beyond a local machine.

## What's implemented (Stage 1)

- `POST /auth/register`, `/auth/login`, `/auth/otp/request`, `/auth/otp/verify`,
  `/auth/password/reset`, `/auth/refresh`, `/auth/logout` — farmer self-registration
  with OTP activation, JWT access + rotating refresh tokens
- `POST /users/staff` (Administrator-only) — creates Expert / Moderator / Vendor /
  Support Agent accounts; there is no public self-registration path for these roles
  (Charter Assumption A4)
- `/farms` — Farm/Land Parcel CRUD, farmer-scoped (Charter v0.4.0)
- `/experts/me/credentials`, `/experts/credentials/pending`,
  `/experts/credentials/:id/verify` — the credential-verification gate required
  before Expert Portal access, per Charter v0.4.0 / Risk R9
- `/configuration/{crops,case-categories,tags,regions}` — Module 14's controlled
  taxonomy, seeded with the Case categories fixed in Charter v0.3.0
- **`web/`** — a farmer-facing PWA covering registration/OTP, login, forgot-password,
  and the Farm/Land dashboard, wired to the API above. Every string is bilingual
  (English line, Telugu line), including native browser validation messages —
  see `web/src/i18n/`.

## What's implemented (Stage 2, in progress)

- `/cases` — the full ten-state Case Lifecycle from `000-Project-Charter.md`
  (Draft → Submitted → Under Review → Assigned → Expert Working ⇄ Waiting
  Farmer → Answered → Farmer Confirmed → Closed, plus Reopened and
  Closed/Abandoned), every transition guarded server-side by `CasesService`,
  not trusted to the caller. Verified end-to-end via a real farmer → moderator
  → expert → farmer walkthrough, not just unit-level — see git history for the
  session that built it.
- Emergency Advisory's anti-abuse gate: `priorityRequested` (the farmer's ask)
  and `isPriority` (a Moderator/Administrator's confirmation) are separate
  fields — a farmer alone can't grant their own case priority.
- Expert assignment is blocked unless the expert's credentials are `VERIFIED`
  (Charter v0.4.0 / Risk R9) — enforced in `CasesService.assign`, not just the UI.

Every write action is recorded in the append-only `AuditLog` table, per the
Charter's Audit Friendly principle — this exists from Stage 1, not added later.

## What's deliberately not here yet

No SMS gateway is wired up — OTPs are logged to the server console and returned
in the API response outside `NODE_ENV=production`, with a `TODO(Stage 2)` marking
where the real Notification module integration goes. No Knowledge Repository
publication workflow (Closed doesn't yet generate a Draft Article), no
Marketplace, no Learning, no Soil Laboratory. No scheduler exists yet, so
`CasesService.abandon()` (Waiting Farmer → Closed/Abandoned) is manually
triggered rather than running automatically past the SLA window. No web UI
for Case submission or the Expert Portal — everything above is proven at the
API level (see the curl walkthrough in the session that built it), not yet
clickable. `CasesService` itself has no unit tests yet, unlike `RolesGuard`
and the DTOs — the state machine is proven by the end-to-end walkthrough
instead; that's a real gap, not a decision to leave it untested forever.

CI is wired (`.github/workflows/ci.yml`) but has never run — it needs a GitHub
remote pushed to before it does anything.

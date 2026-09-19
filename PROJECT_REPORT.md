# Organic Carbon Farming — Project Status Report

Prepared 2026-08-23. Live: https://carbon-xi-sepia.vercel.app · Repo: carbon-farm/carbon
Stack: NestJS + Prisma + PostgreSQL (Supabase) backend · React/Vite PWA frontend · Render (backend) + Vercel (frontend)

An interactive version of this report (with a clickable test-plan checklist) is published separately — ask for the link if you don't have it.

## Snapshot

- **12 of 14** Charter modules fully built
- **74** backend tests, all passing
- **27** real products live in the OCF Marketplace catalog, plus a second, fully separate storefront (HARIHARAA Natural Food Stores) with its own subscription-gated catalog
- **16** database migrations applied to production

## Module status

| # | Module | Status | Note |
|---|---|---|---|
| 1 | Identity & Membership | Partial | Registration, login, on-screen OTP done. Payment/approval workflow blocked on fee + gateway decision. |
| 2 | Farmer Management | Done | Farm/Land parcels with optional GPS capture. |
| 3 | Knowledge Repository | Done | Auto-generation from closed cases, moderation, feedback/flagging, bookmarks, recently viewed. |
| 4 | Advisory – Case Management | Done | Full 10-state guarded lifecycle, evidence upload, priority path, auto-abandon scheduler. |
| 5 | Learning Management | Partial | Course → Lesson → Certificate loop built and verified. Shell only — no real course content yet. |
| 6 | Product Marketplace | Done | Multi-vendor + platform-sold catalog, cart, Cash-on-Delivery checkout, order fulfillment. 27 real products live. |
| 7 | Soil Laboratory | Done | Generic sample lifecycle (submitted → dispatched → received → tested → report). No lab partner integrated yet. |
| 8 | Content Management | Done | Per-module uploads plus a unified, sortable/filterable Media Library (`/admin/media`) aggregating case/article evidence, lessons, soil reports and product images. |
| 9 | Finance | Blocked | Depends entirely on the payment gateway decision (Module 1). |
| 10 | Administration | Done | Staff, credentials, taxonomy, vendor approval, product & order oversight, audit log. |
| 11 | Reporting | Done | Case volume, resolution time, article funnel, expert workload, accounts by role. |
| 12 | Notification | Partial | In-app channel fully built and wired to every real trigger. SMS/WhatsApp/email/push blocked on a vendor decision. |
| 13 | Security | Partial | JWT auth, RBAC, audit trail, admin account deactivate/reactivate (immediate lock-out), self-service change password. Key/password rotation still outstanding — see below. |
| 14 | Configuration | Done | Crops, case categories, tags, regions, product categories — all admin-managed taxonomy. |

## What's been built

### Case Management & Farmer Management (Modules 2, 4)
- Ten-state guarded Case Lifecycle (Draft → Submitted → Under Review → Assigned → Expert Working → Waiting Farmer → Answered → Farmer Confirmed → Closed, plus Reopened), enforced server-side.
- Emergency Advisory path with a Moderator/Administrator confirmation gate against self-declared priority abuse.
- Evidence upload (photo/video) via Supabase Storage.
- Auto-abandonment scheduler for cases stuck past the 72-hour Waiting Farmer SLA.
- Farm/Land parcels with optional GPS capture.
- Verified: 16 unit tests covering every guarded transition and ownership check.

### Knowledge Repository (Module 3)
- Rebuilt to match the Charter exactly: Closed case → Draft Article (auto-generated) → Moderator Approval → Published.
- Helpful/Not Helpful + 1–5 rating + comment feedback; a rating of 2 or below auto-flags the article and alerts Moderators via the same Published → Rejected → resubmit loop as an ordinary rejection.
- Bookmarks and Recently Viewed, persisted per user.
- Browse available to every role.
- Verified: 15 service-level tests plus a full live rating → flag → moderator queue → send-back → author-notified round trip.

### Learning Management (Module 5 — shell, no content yet)
- Course → Lesson (video/audio/PDF/assignment) → completion tracking → auto-issued Certificate on 100% completion.
- Staff-authored, two-state publish workflow.
- Generalized the file-upload service for reuse by Soil Lab and Marketplace.
- Verified live end to end: create → publish → complete → certificate issued.

### Product Marketplace (Modules 6, 9 partial)
- Hybrid model: platform-sold products and third-party vendor products side by side. Vendor accounts require Administrator approval before their products go live.
- Full loop: catalog (search/category/wishlist filter, sort) → product detail with reviews & wishlist → cart → checkout → order tracking → Administrator fulfillment (Confirmed → Shipped → Delivered, restock on cancel).
- Payment explicitly deferred — checkout runs on Cash on Delivery only, swappable for a real gateway later.
- 27 real OCF SPIN products loaded from the Products Utilization Sheet with full bilingual dosage instructions preserved.
- Verified live across four real sessions: admin → vendor onboarding/approval → product listing → farmer purchase (COD) → admin fulfillment → farmer notified → stock decremented.

### Soil Laboratory (Module 7 — generic, no lab partner)
- Five-state guarded lifecycle: Created → Dispatched → Received → Tested → Report Available.
- Farmer confirms a "collection video watched" checkbox before submitting (honesty gate — no real video exists yet).
- Verified live: full submission → staff progression → report upload → farmer notification round trip.

### Administration, Reporting & Configuration (Modules 10, 11, 14)
- Staff account creation, Expert credential approval, full taxonomy management, append-only audit trail.
- Reports: case volume, resolution time, article funnel, expert workload, accounts by role.
- Every list screen in the app (16 total) has sortable columns and relevant filters, per the project's standing UI rule.

### Notification (Module 12 — in-app channel only)
- Bell + unread badge on every role's header, full list with read/unread filter and mark-all-read.
- Wired into every real trigger with an actual recipient across Cases, Knowledge, Learning, Soil Lab, Marketplace, and credentials/vendor approval.
- Real bug caught and fixed during testing: the order-placed notification originally linked to the wrong admin route.

### Portal & navigation (cross-cutting)
- Rebuilt the frontend as a real portal after direct feedback that the previous build read as disconnected pages — persistent branded header, role-aware nav, a real landing page.
- Bilingual (English + Telugu, stacked) on every farmer-facing string without exception.

### HARIHARAA Natural Food Stores (new, 2026-08-23) — a second, unrelated storefront on the same platform
- Public landing page (`/hariharaa`, no login) shows only 6 customer-testimonial videos and a dynamic UPI QR code until a visitor subscribes — nothing else about the business is visible, per the explicit "nothing else till they pay and subscribe" instruction.
- New `CUSTOMER` role, kept fully separate from `FARMER` — its own registration entry point (`/hariharaa/register`), its own dashboard/shop, its own order history (reusing the same Order/Cart tables, partitioned by role so neither storefront's customers can see or buy from the other's catalog).
- Subscription is monthly and manual for now: customer pays via UPI, submits a payment reference, an Administrator reviews and approves it (same submit → pending → approve/reject shape as Expert-credential and Vendor approval) — 30 days of access per approval. Built so a later swap to an automated payment gateway only changes how a claim gets created, not the approval/notification/audit plumbing.
- HARIHARAA's product catalog is its own `VendorProfile` (created and approved through the exact same Staff-account + vendor-approval flow as any OCF vendor) — reuses the existing Vendor dashboard for product management, no new admin UI needed there.
- Price and both UPI IDs are Administrator-editable (`/admin/hariharaa-settings`) — no code deploy needed to change them.
- Per-line **dispatch tracking** (Pending/Sent) added to every Marketplace order, independent of the whole-order status — an order can ship while some lines are still pending (stock shortage on the seller's side: send what's available, the rest waits). Handled by the `SUPPORT_AGENT` role, which existed in the schema but had zero real screens until now — it now has its own dispatch queue (`/support/dispatch-queue`).
- Verified live end to end: public landing → CUSTOMER register/OTP → blocked pre-subscription → claim submitted → Administrator notified/approved → catalog unlocked → COD checkout → order placed with the item defaulting to Pending → SUPPORT_AGENT login → dispatch queue → marked Sent → whole-order status untouched by the item-level change. Cross-tenant isolation confirmed both directions: a CUSTOMER hitting an OCF product's URL directly is rejected, and a FARMER's `/marketplace` still shows exactly the 27 OCF products with no HARIHARAA products mixed in.
- **Real bug caught and fixed during this verification**: the filter meant to exclude HARIHARAA's products from the general OCF catalog used a top-level `NOT: { vendorId: X }`, which — due to SQL's NULL-comparison rules — silently excluded every platform-sold product too (`vendor_id != X` evaluates to NULL, not true, when `vendor_id IS NULL`). This briefly emptied the entire 27-product OCF catalog for every role in production before being caught by the live regression check and fixed (exclusion moved inside the vendor-sold branch specifically, where it can't touch the null-vendor branch).

## Deferred & blocked

| Item | Needs |
|---|---|
| Real SMS / WhatsApp / email delivery | Vendor choice + budget |
| Payment gateway | Is there a fee at all, which gateway |
| Finance (Module 9) | Payment gateway decided first |
| Learning content | Actual course material |
| Product photos & real stock counts | Photos + real inventory numbers |
| Marketplace coupons & returns | Scoping decision if wanted |
| HARIHARAA real subscription price | Currently a ₹499 placeholder — set the real number in `/admin/hariharaa-settings` |
| HARIHARAA real product catalog | Currently 3 placeholder products (oil, millet flour, honey) — replace via the Vendor dashboard |

## Regression pass findings (2026-08-23)

A full live regression pass ran a real farmer through parcel → case → knowledge → soil sample → marketplace purchase, then through Expert/Moderator/Vendor/Administrator to close the loop end to end. Five real issues were found and fixed, all committed and deployed:

- **Missing Expert credential-submission page** — the backend endpoint for an Expert to submit their qualification always worked, but no frontend page ever called it. A newly created Expert account had no way to get verified or assigned cases. Added the page (`/expert/credentials`) plus a supporting `GET /experts/me` endpoint.
- **False "could not add" errors on Add Parcel and case follow-up reply** — both handlers read `event.currentTarget` after an `await`, which the DOM nulls out once the event finishes dispatching, so the save actually succeeded but the UI reported failure every time.
- **Stale Farmer Dashboard notice** — still claimed "Learning and Marketplace aren't built yet" long after both shipped.
- **Confirm/Dispute buttons shared one busy flag** — clicking either button on an Answered case made both show their "in progress" label at once.
- **Product edit page mislabeled its save button "Save as draft"** — copied from the Article/Case editors, which do have a draft status; products don't.

Everything else exercised — registration/OTP, farm parcels, case lifecycle, Knowledge bookmarks/feedback, Soil Lab, Marketplace cart/checkout/fulfillment, Learning course/lesson/certificate, Vendor onboarding/product create/deactivate, Admin staff/audit/reports, dark mode, and mobile-width layout — worked correctly on the first or second pass.

## Test plan

See the interactive report for a clickable checklist. Summary by role:

- **Farmer**: register/OTP, add a parcel, submit/track a case, browse Knowledge + bookmark/feedback, complete a course, request a soil sample, buy from the catalog (browse → cart → checkout → track), wishlist/review a product, notifications firing at each stage.
- **Expert**: credential submission + approval gate, take/answer a case, auto-generated article edit/submit/resubmit.
- **Moderator**: case review/assign, article approve/reject, flagged-article queue (clear/send-back), course publish, soil sample queue.
- **Vendor**: profile submission + approval gate, product create/edit/image/deactivate, deactivated products disappearing from the public catalog.
- **Administrator**: staff/credential management, taxonomy CRUD, audit log + reports sanity check, vendor approval, full order fulfillment + cancel/restock, spot-check the 27 seeded products.
- **Cross-cutting**: sort/filter on every list screen, mobile-width nav for every role, dark mode, bilingual coverage, a hard-refresh mid-session to catch stale PWA cache.
- **HARIHARAA CUSTOMER**: land on `/hariharaa` unauthenticated (testimonials + QR only), register via `/hariharaa/register`, confirm blocked pre-subscription, submit a claim, confirm access unlocks after Administrator approval, browse/buy the HARIHARAA catalog, confirm OCF products stay inaccessible.
- **HARIHARAA Administrator**: review/approve/reject subscription claims, edit price/UPI IDs in settings.
- **SUPPORT_AGENT**: confirm login lands on `/support/dispatch-queue`, can toggle an order item Pending/Sent, cannot see the whole-order confirm/ship/deliver/cancel buttons.

## Security & hygiene pending

- **Seeded Administrator password never rotated** (9999999999) — rotate via the Forgot Password self-service flow.
- **Supabase `service_role` key never rotated** — rotate in the Supabase dashboard, then update Render's env var.
- **Test accounts cleaned up (2026-09-19)**: Administrators can now deactivate/reactivate accounts (Staff page). All 21 known test/QA accounts were deactivated — login blocked immediately, sessions revoked, and re-registering the same number is refused. Deactivation is reversible; nothing was deleted, so their history (cases, orders, articles) is intact and everything downstream was re-checked after (2 published articles, 27 OCF products, 8 orders, HARIHARAA storefront all unaffected).
  Deactivated: Pavan (9000000000), Test Farmer (9123456780), Prod Mode Test (9123456799), Visual Check (9123456798), Visual Check 2 (9123456797), Live Verify (9123456700), Live Vercel Check (9123456701), Stuck Test User Fixed Name (9123450011), Live Resend Check (9123450022), Test Expert (9123456782), Pending Credential Expert (9123450088), Test Moderator (9123456781), Test Support Agent (9123450099), Regression Test Farmer (9123456622), Regression API Test (9123456633), Regression Test Farmer — abandoned registration (9123456611), Regression Moderator (9123456711), Regression Expert (9123456712), Regression Vendor (9123456713), Regression Test Customer (9123456800), Regression Dispatch Agent (9123456900).
  Still active, deliberately: the Administrator, the real HARIHARAA vendor account (9876500001), and three that may be real people and were left alone — Paindla Vamshi Vardhan Reddy (9502829167), Vani (9382828484), "122" (9849957645).
  Test records left in place (all in normal terminal states, not broken): case CASE-2026-665835DB (Closed) and its Published article "Chilli — Pest", orders ORD-2026-CA4ED1C6 (Delivered) and ORD-2026-25DD3C87 (Placed), soil sample SOIL-2026-96EF7980, course "Regression Test Course: Organic Pest Management", vendor profile "Regression Test Agro Supplies" (Approved), product "Regression Test Bio Booster" (Deactivated). The HARIHARAA vendor and its 3 products are real infrastructure, not test data — only the product listings (oil/flour/honey) are placeholders pending your actual catalog.
## Deployment

- **Frontend**: Vercel — https://carbon-xi-sepia.vercel.app
- **Backend**: Render, service `carbon-backend`
- **Database & storage**: Supabase (PostgreSQL + Storage), pinged every 5 minutes to prevent free-tier sleep

Migrations applied (14, all live):
```
20260807183247_init
20260807183413_expert_qualification_nullable
20260808100147_case_management
20260808100224_case_priority_split
20260809174137_add_farmland_geolocation
20260809180320_add_knowledge_repository
20260810022846_add_case_evidence_media
20260811095453_knowledge_repository_charter_alignment
20260820175317_add_notifications
20260821020327_add_article_feedback
20260821055921_add_bookmarks_and_views
20260821115826_add_learning_management
20260821121910_add_soil_laboratory
20260822015831_add_marketplace
20260823151259_add_hariharaa_customer_storefront
20260919031842_add_user_deactivated_at
```

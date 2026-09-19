# Testers Guide — Organic Carbon Farming

Practical guide for clicking through the live app. Not a formal SDLC document (see `000-Project-Charter.md` and `01-Product/` for those) — this is an operational runbook for QA.

**Live site:** https://carbon-xi-sepia.vercel.app
**Backend:** Render service `carbon-backend` (per `render.yaml`), Supabase-hosted Postgres.

## Test accounts

| Role | Mobile | Password | Notes |
|---|---|---|---|
| Administrator | `9999999999` | `ChangeMe123!` | Seeded account. **Change this password** — it's been sitting at the default since seeding; flagged repeatedly, not yet rotated. |
| Moderator / Expert / Vendor / Support Agent | — | — | Create via Admin → Staff accounts, with any temporary password you choose. |
| Farmer | — | — | Self-register via the public "Create an account" link (`/register`). |
| Customer (HARIHARAA) | — | — | Self-register via the separate HARIHARAA landing page's "Register to subscribe" link (`/hariharaa/register`) — a completely different signup entry point from the Farmer one above. |

**OTP is on-screen, not SMS'd.** Registration and password-reset OTP appear directly on screen behind a red "Temporary" banner — deliberate, until a real SMS/WhatsApp vendor is chosen. Don't treat a missing SMS as a bug.

## Role walkthroughs

### Farmer
1. Register (or log in) → land on Dashboard.
2. Add a Farm/Land parcel — optionally capture GPS via "Use my location."
3. Report a problem (My Cases → New case): category, optional crop, problem description, optional priority request, optional photo/video evidence.
4. Submit the case.
5. Once a moderator/expert has acted: answer any follow-up question asked; once answered, confirm or dispute the resolution.
6. After confirming, check Knowledge or the dashboard's "Recent advice" — the resolved case auto-generates a draft guide that shows up here once a moderator publishes it, with a link back from the case detail page itself.
7. Rate/review the guide, bookmark it, check Recently Viewed.
8. Enroll in a course (Courses tab), complete every lesson, confirm a certificate appears once done.
9. Request a soil sample (Soil Testing tab) — you must tick the collection-instructions checkbox to submit.
10. Browse the Marketplace, add a product to cart, checkout with a delivery address (Cash on Delivery only — there's no payment gateway yet), track the order status.
11. Wishlist a product, leave a product review.
12. Watch the notification bell (top-right) — it should light up at every stage above.

### Moderator
1. Log in as a moderator.
2. Moderator Queue: start review on a submitted case, then assign it to a *verified* expert.
3. Article Queue: approve or reject articles experts submit (rejection requires a reason); check the "Flagged for review" section for articles a farmer rated 2★ or below.
4. Manage Courses: publish/unpublish a course (needs at least one lesson to publish).
5. Soil sample queue: dispatch → receive → mark tested → upload a report PDF.
6. Try the sort/filter toolbar on every queue.

### Expert
1. Submit qualification/credentials once (Expert Portal) — an Administrator must verify before you can be assigned cases.
2. On an assigned case: start work, optionally ask the farmer a follow-up question, then answer.
3. Once the farmer confirms, check My Articles — a draft auto-generates from the closed case; edit it and submit for moderator review. If it comes back rejected (including from a low-rating flag), edit and resubmit.
4. Watch the notification bell for new assignments and farmer responses.

### Vendor
1. Submit a vendor profile (business name + description) from the Vendor tab — you can't list products until an Administrator approves it.
2. Once approved: create a product (name, description, price, unit, stock, category), upload an image, edit price/stock later, deactivate/reactivate it.
3. Confirm a deactivated product disappears from the public catalog immediately, and that other vendors' products don't show up under "My products."

### Customer (HARIHARAA Natural Food Stores)
A completely separate storefront on the same site — different branding, different catalog, subscription-gated. Not the same thing as the Farmer's Marketplace.
1. Visit `/hariharaa` while logged out — confirm you see only branding, 6 testimonial videos, and a subscribe/QR section. Nothing else about the business should be visible.
2. Click "Register to subscribe" → register/OTP-verify → you should land on the HARIHARAA shop, not the Farmer dashboard.
3. Before subscribing, confirm the shop shows "An active HARIHARAA subscription is required."
4. Go to My subscription, submit a payment reference (any text works pre-gateway) — status moves to "Submitted."
5. Once an Administrator approves it (see below), refresh the shop — the catalog should now be browsable.
6. Add a product to cart, checkout (Cash on Delivery only, same as the Farmer Marketplace), confirm the order appears under My orders.
7. Confirm you can **not** view an OCF Marketplace product by its direct URL — HARIHARAA and OCF catalogs are fully separated.

### Support Agent (dispatch)
1. Log in — you should land on the Dispatch queue, not a "not built" page.
2. Open any order from the queue (works for both OCF and HARIHARAA orders — dispatch is shared across both storefronts).
3. Toggle an order item between Pending and Sent.
4. Confirm you do **not** see the whole-order Confirm/Ship/Deliver/Cancel buttons — those stay Administrator-only.
5. Confirm an Administrator can still move the whole order to Shipped/Delivered even while some items are still Pending — that's the intended "send what's in stock" behavior, not a bug.

### Administrator
1. Log in with the seeded account above.
2. Staff accounts: create Moderator/Expert/Vendor/Support Agent/Customer accounts.
3. Expert credentials: approve/reject pending qualifications.
4. Taxonomy: manage crops, case categories, tags, regions, and product categories.
5. Audit log: every material action platform-wide, filterable by entity type and date.
6. Reports: case volume by status/category/crop, average resolution time, article funnel, expert workload, accounts by role.
7. Vendor approvals: approve/reject pending vendor profiles.
8. Manage products: oversight of every product (platform + all vendors), filter by seller/status.
9. Order queue: move an order Placed → Confirmed → Shipped → Delivered, or cancel one and confirm the stock restocks.
10. Staff accounts → Deactivate / Reactivate any account. A deactivated user is locked out immediately (even a session that's already open), and can't re-register the same number. You can't deactivate yourself or the last active Administrator.
11. Media library (Administrator and Moderator): every upload across cases, articles, lessons, soil reports and product images in one sortable, filterable table.

### Every role
- **Account** (header link) → change your own password. You'll be logged out afterwards and sign in with the new one.
10. HARIHARAA subscriptions (`/admin/hariharaa-subscriptions`): approve/reject pending payment claims.
11. HARIHARAA settings (`/admin/hariharaa-settings`): edit the monthly price and both UPI IDs — takes effect immediately, no deploy needed.

## What's new this round — worth specifically checking

- **HARIHARAA Natural Food Stores** (`/hariharaa`) — a second, subscription-gated storefront bolted onto the same app: public testimonials + UPI QR page, Customer self-registration, manual payment-claim approval, its own product catalog fully separated from the OCF Marketplace.
- **Per-order dispatch tracking** (Support Agent's Dispatch queue) — each order line can be marked Sent/Pending independently of the whole order's status.
- **Learning Management** (Courses tab / Manage Courses) — full course → lesson → completion → certificate loop.
- **Soil Laboratory** (Soil Testing tab / staff queue) — sample request through report delivery.
- **Marketplace** (Marketplace tab) — real product catalog (27 OCF SPIN products), cart, Cash-on-Delivery checkout, vendor onboarding, order fulfillment.
- **Knowledge feedback** — rating/review an article; a rating of 2★ or below auto-flags it into the Moderator's "Flagged for review" queue.
- **Bookmarks & Recently Viewed** on Knowledge articles.
- Every list screen in the app has a sort + filter toolbar — 16 screens total.

## Known intentional limitations (not bugs)

- OTP is shown on-screen, not sent via SMS (see above).
- Marketplace checkout is Cash on Delivery only — no payment gateway is wired up yet.
- No Finance module (invoicing/GST/refunds) — it depends on the payment gateway decision above.
- Learning Management has no real course content yet — the structure works, but courses need to be authored.
- The 27 seeded Marketplace products have placeholder stock (999) and no photos.
- Real SMS/WhatsApp/email/push notifications aren't wired yet — in-app notifications are live now as the interim.
- HARIHARAA's subscription price (₹499) and product catalog (3 placeholder items) are placeholders pending the real numbers/catalog.

## Reporting a bug

Include: your role, exact steps taken, expected vs. actual result, and — if applicable — the case/article/order/sample ID from the URL.

# Testers Guide — Organic Carbon Farming

A practical guide for clicking through the live app and checking that it behaves. It is an operational runbook for testers, not a formal SDLC document (those are `000-Project-Charter.md` and `01-Product/`). Last updated 2026-10-24.

**Live site:** https://carbon-xi-sepia.vercel.app
**Backend:** Render service `carbon-backend` (see `render.yaml`), PostgreSQL on Supabase.

Everything on screen is **English first, Telugu directly underneath**. If you ever see a line in only one language, that is a bug — report it.

---

## 1. Before you start

### Test accounts

| Role | Mobile | Password | Notes |
|---|---|---|---|
| Administrator | `9999999999` | `ChangeMe123!` | Seeded account. **Still the default password** — rotation is pending (see section 9). |
| Moderator / Expert / Vendor / Support Agent | — | — | Create each under *Administrator → People → Staff accounts* with any temporary password you choose. |
| Member | — | — | Self-register at `/register`. There is **one** account type for everyone — no role to choose. |

**Sign-up codes appear on the screen** (under a red "Temporary" banner) instead of being texted. A missing SMS is not a bug.

**Forgotten passwords are reset by an Administrator, not by a code.** On the log-in screen, "Forgot password" → enter the mobile number → the page says the store has been told (it says the same for any number). The Administrators get a bell notification "Password reset requested". An Administrator then issues a **Temporary password** from *People → Members & free access* (or *Staff accounts*) and reads it out. See "Forgotten passwords" in section 4b.

### Rules for testing on the live system

- Use **your own throwaway accounts**. Do not use the three real members (Paindla Vamshi Vardhan Reddy, Vani, "122") or the real HARIHARAA vendor (9876500001).
- Name anything you create with a `ZZ` prefix (e.g. `ZZ Test Honey`) so it is easy to find and clean up.
- Do **not** leave the membership switch Off (section 7) — it affects every member.
- A shop order of a real product reduces real stock. Cancel your test orders (Administrator → Order queue) so the stock comes back.
- Password boxes all have an eye button — use it to check what you typed.

### A tip: seeing the tour again

The guided tour shows itself once per person per device. To see it again as a returning user, clear this site's data (or use a private window), or use **Help → Take the tour**.

---

## 2. Quick tour of what exists

| Area | Where | Who |
|---|---|---|
| Shop (browse, cart, checkout, orders, addresses) | Marketplace | Visitors browse; Members buy |
| Farm advice (cases, knowledge, courses, soil testing) | Farm advice menu | Members with an active membership |
| Membership (plans, UPI payment, free access) | My subscription / Membership menu | Members / Administrators |
| Products, stock and orders | Shop menu | Administrators, Vendors, Support Agents |
| People, reports, audit log, media | People / Insights menus | Administrators |
| **Help, guided tour and the help assistant** | Help link, round button bottom-right | Everyone |

---

## 3. Role walkthroughs

### Visitor (not signed in)
1. Open the site in a private window. You land on the landing page; the log-in page shows three customer-story video thumbnails that link to the testimonials page.
2. Marketplace works without an account: browse, use Department → Category → Sub-category, search, sort. Heart a couple of products (they survive a reload).
3. Add products to the cart. Put more than the stock in the cart — it must be refused with a message saying how many are left.
4. Register or log in: the cart and the hearts must come with you.

### Member
One sign-up, one catalog, one membership. Anyone can browse and fill a cart; **checkout and the farm-advice features need an active membership.**
1. Register at `/register`, type the 6-digit code shown on screen. The header shows your name and your ID (e.g. `HHC-0042`).
2. While unpaid: a slim "Membership payment pending" strip sits under the title bar on every screen; My cases / Knowledge / Courses / Soil Testing show a "Members only" card; checkout is refused with a clear message.
3. **My subscription → Pay now.** Pick a plan if there is more than one. A UPI QR appears for that exact amount with your ID in the note. Submit any 6+ character reference while testing. Status becomes "waiting for verification".
4. After an Administrator verifies (section below), the strip disappears within about a minute (or on your next page change) and everything unlocks.
5. **Checkout:** Cart → Proceed to checkout. Add an address (receiver, phone, house/street, town, state, 6-digit PIN; landmark, second phone, email optional — bad PINs and phone numbers are refused). Choose Cash on Delivery or UPI. Editing a saved address afterwards must **not** change an order you already placed.
6. **Paying an order by UPI:** on the order page tap Pay now — the QR is for that order's total. Submit the UTR; the order shows "Payment submitted — being verified". The Administrator cannot confirm it until verified. If rejected you see the reason and can submit again. A UTR already used elsewhere is refused.
7. **Orders:** each order shows its status (Placed → Confirmed → Shipped → Delivered), payment status, and each item as Sent or Pending. The price on an order never changes after you place it.
8. **Farm advice:** My cases → New case — **photos first** (take up to 6 with the camera or choose from the gallery; they are shrunk on the phone before upload), then tap the **symptom** pictures (yellow leaves, spots, wilting…), add a few words by typing or the **Speak** button (తెలుగు / English — only shown where the browser supports speech; the phone keyboard's microphone also works), then land, category and crop. Submit; answer any follow-up; confirm or dispute the answer. Knowledge: read, rate, bookmark. Courses: enrol, finish every lesson, check a certificate appears. Soil Testing: request a sample (tick the collection-instructions box), follow it to the report.
9. **Today panel** at the top of the shop: days of membership left (highlighted at 3 days or fewer, or when not active), open cases (highlighted when an expert has answered), latest order, and "Photo your problem". Each card opens the right screen.
9a. **Products that may help:** open a published Knowledge article — under it, shop products that mention the same problem or crop appear (e.g. magnesium sulphate under a magnesium-deficiency article). Nothing appears if nothing matches, and out-of-stock products are never suggested.
9b. **Out-of-stock products:** a member sees "Tell me when it is back". Tap it, then have an Administrator add stock — you get a bell notification and the request clears. Tap again to cancel.
9c. **Order again / Receipt:** on an order, "Order again" refills the cart (as much as is in stock, with a note if some items were skipped) and opens it; "Receipt" opens a printable receipt (print → save as PDF) that says it is not a tax invoice.
9d. **WhatsApp updates** (Account): the box appears only when the server has WhatsApp switched on. Off by default; tick to receive order/payment/membership updates on WhatsApp too.
9e. Watch the bell: it should light up at each stage above.
10. Free access: if an Administrator grants it, My subscription shows "Free access until …" and everything is unlocked; when removed you are locked again (any paid days are untouched).

### Administrator
1. Log in with the seeded account.
2. **People → Staff accounts:** create Moderator / Expert / Vendor / Support Agent / Administrator accounts. *Deactivate* locks someone out immediately (even an open session) and they cannot re-register the same number; you cannot deactivate yourself or the last active Administrator.
3. **People → Members & free access** (`/admin/members`): search, sort by any column, filter Paid / Free / Waiting / Unpaid / Expired. "Give free access" until a date (max 2 years), "Remove free access" to end it, and **"Temporary password"** for a member who forgot theirs (section 4b).
4. **Membership → HARIHARAA subscriptions:** verify the UTR and Approve (30 days or the plan's days start) or Reject with a reason.
5. **Order queue:** sort/filter; the yellow shortcut lists UPI payments waiting. Open an order → verify/reject the payment → Confirm → Ship → Deliver (delivering a COD order marks it paid). Cancel an order and confirm the stock returns **once**.
6. **Manage products** — see section 4.
7. **Vendor approvals:** approve/reject a vendor's business profile. **Expert credentials:** approve/reject qualifications.
8. **Taxonomy → Product categories:** add a department, categories inside it, sub-categories inside those (nothing goes deeper); optional Telugu names; switching one off hides it without deleting.
9. **Membership plans** and **Settings** — see section 7.
10. **Media library:** every upload (case evidence, articles, lessons, soil reports, product images) in one sortable, filterable table (Administrator and Moderator).
11. **Reports** and **Audit log** (filter by type and date): check that your own test actions appear (including "temporary password issued" — the password itself must never appear).
12. **Insights & setup → Usage & questions** (`/admin/usage`): the most opened screens, the help-assistant questions it could not answer, the answers it gave, tour outcomes and errors, for 7 / 14 / 30 / 90 days. Every table sorts and searches. Open a few screens, ask the assistant a nonsense question, then reload this page after a minute — they should show up. Only counts are kept; type a phone number into the assistant and check it appears as `[number]`.
13. **Stock alerts:** a sale that takes a product to 5 or fewer sends you a "Running low on stock" notification (once), and another at zero. *Manage products* has a **Stock** filter (Low / Out of stock).

### Vendor
1. Submit a business profile from the Vendor dashboard. You **cannot** create products until an Administrator approves it (try — you get a refusal).
2. After approval: **Add product** (name, description 10+ characters, price, unit, opening stock, category), upload a photo, then edit price later.
3. Open the product: use the **Stock** panel (section 4) and read **Stock history**.
4. Another vendor must not be able to edit or see the stock history of your products.
5. If an Administrator un-approves your business, your products disappear from the shop until approved again.

### Expert
1. Submit qualifications; an Administrator must verify you before you can be assigned cases.
2. On an assigned case: start work, optionally ask the member a follow-up, then answer.
3. After the member confirms, a draft article appears under My articles; edit and submit for review. If rejected, edit and resubmit.

### Moderator
1. Case queue: start review, assign to a **verified** expert.
2. Article queue: approve/reject (a rejection needs a reason); check "Flagged for review" for articles rated 2★ or below.
3. Courses: publish/unpublish (needs at least one lesson). Soil sample queue: dispatch → receive → tested → upload a report PDF.

### Support Agent
1. Log in: you land on the Dispatch queue (orders ready to pack: COD, or UPI already verified), showing city, PIN and receiver's phone.
2. Open an order and mark items Sent / Pending. You must **not** see whole-order confirm / ship / deliver / cancel buttons.

### Every role
- **Account** (header) → change your password; you are logged out afterwards and sign in with the new one.
- **Bell** → notifications; **Help** → guide, FAQs, tour.

---

## 4. Adding products and managing stock

*Administrator → Shop → Manage products → Add new product.*

1. Fill name, description (10+ chars), price, unit, opening stock and category. Products you add are sold by the platform; after saving you land on the product screen to upload photos.
2. **Price rules:** ₹0.01 to ₹10,00,000, at most 2 decimals. Try ₹0, −1, `1.234`, `10000000000` — each must be refused. **Stock:** 0 to 10,00,000, whole numbers (try −1, `2.5`, `5000000000` — refused). Name too short, description under 10 characters, empty unit, unknown category — all refused.
3. On the product, the **Stock** panel:
   - *Add stock* (reason optional).
   - *Reduce stock* (reason required; reducing more than is in stock is refused; reducing to exactly 0 is allowed).
   - *Set to counted quantity* (a stock-take; reason required; setting the same number changes nothing).
4. **Stock history** (sortable, filterable): opening stock, each sale (with order number and buyer), cancelled-order returns, adds, reduces, corrections, with who did it. The balance column must always add up to the live stock.
5. Things to try:
   - Order a product and watch stock drop and a "Sold" line appear.
   - Cancel that order → units return **once**; cancel again → refused.
   - **Two browsers:** put the *last unit* in two carts and check out at the same moment — exactly one order succeeds, the other gets "not enough stock"; stock never goes below zero.
   - Put more in a cart than is in stock → refused.
   - Switch a product off after it is in someone's cart → checkout is refused and nothing is taken.
   - Edit the price later → old orders keep their old price.
   - Saving the edit screen must not change stock (stock changes only through the Stock panel).

---

## 4b. Sign-in security (changed 2026-10-24)

A review found two ways to take over any account without the password: asking for a password-reset code returned the code on screen, and asking for a *registration* code for an existing account then verifying it logged you in as that person (the Administrator included). Both are closed. Check by hand:

### Forgotten passwords
1. Log-in screen → **Forgot password** → enter a registered number → you see "request sent" and **no code**. Enter an unregistered number — you must see the very same message.
2. As an Administrator: a "Password reset requested" notification appears (once per person per 30 minutes — repeat requests do not spam). Open *Members & free access*, tap **Temporary password** for that person → confirm → a 10-character one-time password appears with a **Copy** button. It is shown once; closing the window loses it.
3. As that person: the old password no longer works. Log in with the temporary one → you land on **Account** with a banner saying you must choose your own password; every other screen redirects back until you do. Choose one (the same one is refused, under 8 characters is refused) → you are logged out → log in with the new password → normal.
4. An Administrator cannot issue a temporary password for themselves (refused with a message). If the only Administrator is locked out, whoever runs the server uses `npm run admin:reset-password -- <mobile number>` in `app/backend`.
5. The seeded Administrator password (`ChangeMe123!`) should be replaced this way — it is the single most important thing still pending.

### Other protections
- **Wrong passwords:** 8 wrong attempts for one number lock it for 15 minutes — even the right password is refused ("Too many wrong attempts"). The limit is per number, so it does not lock out other people.
- **Rate limits:** the log-in, sign-up and code routes allow about 10–20 requests a minute per visitor; everything else allows 600. Hitting a limit shows an error, never a crash.
- **Other websites** cannot call the API from a browser (only the live web app and local development are allowed; extra sites go in the server's `CORS_ORIGINS` setting). Responses carry standard security headers and are compressed.
- **Registration codes** are issued only to a sign-up that is still waiting to be activated — never to an active, deactivated or unknown number.

---

## 5. Help, the guided tour and the help assistant

**Where:** the **Help** link in the title bar (works logged out too) and the round **"Ask a question"** button at the bottom-right of every screen (on a phone it is a round icon).

### Help page
- Sections for your own role, plus a **Questions people ask** list (tap a question to open its answer, English then Telugu, sometimes with a link to the screen).
- The search box searches both. Try `membership`, `UPI`, `stock`, and a Telugu word.
- **Take the tour** replays the tour.

### Guided tour
- Starts by itself once for each person (and again when the app's tour version changes — it is now at **3**, so everyone sees the updated tour once).
- Steps: Visitor 7, Member 17, Administrator 19, Vendor 6, Expert 7, Moderator 8, Support Agent 5 (steps for things not on the current screen are skipped). The Member tour now includes the **Today** panel; the Administrator tour includes **Usage & questions** and the temporary-password tool.
- Check: Next / Back / Skip, arrow keys and Esc all work; it does not return after you finish or skip; on a phone it appears as a card at the bottom without covering what it highlights; the menu opens the right group for each step; **the last-but-one step highlights the help assistant button**.

### Help assistant (FAQ chat)
It answers from a built-in list of 65 questions — no AI service, the same answer every time — so it works without any extra setup. Each answer shows English then Telugu and often a button to open the right screen.

Things to check:
1. Tap the button: a greeting and **Popular questions** for your role appear. Tap one — its answer appears.
2. Type in your own words. Try each of these and confirm a sensible answer:

   | Signed in as | Type | Should answer |
   |---|---|---|
   | Visitor | `how do i create an account` | creating an account |
   | Visitor | `I forgot my password` | "only the store can reset it" steps, with an "Ask the store to reset it" button |
   | Visitor | `why cant i checkout` | membership needed |
   | Member | `I paid but still locked` | payments checked by hand, rejected reason |
   | Member | `where do I find the utr` | what a UTR is |
   | Member | `how do I track my order` | order statuses, button to My orders |
   | Member | `can I cancel my order` | the store cancels, stock returns |
   | Member | `soil test ela cheyali` | soil testing (Telugu typed in English letters) |
   | Member | `సభ్యత్వానికి ఎలా చెల్లించాలి` | paying for membership (Telugu script) |
   | Administrator | `how to add a new product` | the Add new product steps |
   | Administrator | `reduce stock` | the Stock panel |
   | Administrator | `change upi id` | Settings → Where payments go |
   | Administrator | `how does a member pay for membership` | the member answer, **with a note that it is about a different kind of account** |
   | Member | `how do I add photos to my case` | the photo-first New case steps |
   | Member | `can I speak instead of typing` | the Speak button / keyboard microphone |
   | Member | `order the same things again` | Order again |
   | Member | `tell me when it is back in stock` | the watch button |
   | Administrator | `a member forgot their password what do I do` | the temporary-password steps |
   | Administrator | `how will I know when stock is low` | low-stock notifications and the Stock filter |
   | Administrator | `what questions could the assistant not answer` | Usage & questions |
   | Vendor | `how to start selling` | vendor profile + approval |
   | Support Agent | `how to dispatch an order` | the dispatch queue |

3. Type nonsense (`asdfgh`, `what is the weather`): it should say it could not find an answer, offer related questions and an **Open Help** button — never a wrong confident answer.
4. Follow-up chips ("You could also ask") work. **Start over** clears the chat. The conversation survives moving between pages (it is kept per browser tab) but not closing the tab.
5. **Esc** closes it; the input is focused when it opens; Enter sends.
6. Layout: on a phone it fills the width without covering the title; in dark mode every line is readable; nothing needs sideways scrolling.
7. It appears on the log-in, register and forgot-password screens as well.

Anything it cannot answer that you think it should: write the question you typed — it becomes a new FAQ entry (`app/web/src/help/faq.ts`).

---

## 6. Other recent changes worth specifically checking

- **Look and feel ("Earthy Agritech" design):** Plus Jakarta Sans headings, Inter body text, Noto Sans Telugu, warmer neutrals, 16px cards, white inputs with a soft green focus glow. Check light and dark mode on a phone and a laptop.
- **Every screen stretches to the window** — phone, laptop and a very wide monitor; nothing needs sideways scrolling.
- **Grouped menu:** laptop = click a group to open its dropdown; phone = **Menu** button opens one scrollable panel; the current page is highlighted; the menu closes after you pick a link; Esc or tapping elsewhere closes it.
- **Show/hide password:** every password box (log in, register, reset, change password, the administrator's temporary password) has an eye button.
- **Expiry reminders:** as a member whose access ends within 3 days (an Administrator can shorten a free grant to test), a strip says "Membership ends in N days — Renew" and a bell notification appears once; one more notice after it ends. No reminders while a renewal waits for verification or while membership is switched off.
- **Product photos and hearts:** shop cards show the photo (or a leaf tile) with a heart; vendor and administrator product lists show thumbnails; the vendor list has search, status filter and sort. Upload real photos on the product edit screen — **none of the 30 products has one yet.**
- **Sort + filter toolbars** on every list screen (a standing rule).
- **Knowledge feedback:** rating an article 2★ or below flags it into the Moderator's "Flagged for review" queue.
- **Installable phone app:** the site now has real icons (a green leaf) and a manifest, so Chrome offers "Install app" and "Add to Home screen" gives a proper icon with shortcuts to Marketplace and Help. Try it on an Android phone and an iPhone.
- **Faster first load:** screens are now loaded when first opened, so the first download is roughly 300 KB instead of 700 KB (about 100 KB compressed). On a throttled connection (browser dev tools → Slow 3G) the shop and log-in should appear quickly; other screens show "Loading…" briefly the first time.
- **Crash screen:** if a screen ever crashes you see "Something went wrong — Start again" instead of a blank page, and the crash is reported to the Usage screen.
- **Photos are shrunk on the phone** before upload (case photos and product photos), so uploads are much smaller. Upload a 5 MB photo and check it arrives and looks fine.

---

## 7. Membership plans, the membership switch and the UPI ID (Administrator)

*Membership → Membership plans.*
- Add a second plan (e.g. "Quarterly", ₹1,299, 90 days). As an unpaid member the payment screen must offer both; the QR shows the chosen plan's amount; the verification queue shows which plan was bought; after verification access runs for that plan's number of days.
- Switch a plan Off — it vanishes from members' choices and cannot be bought. Try switching off the only plan that is on — refused.
- **"Is membership required?" switch:** Off → an unpaid member immediately gets checkout and farm advice with no payment strip; On → they are locked again. **Do this only briefly, on a test system or when no real members are active.**

*Membership → Settings → Where payments go.*
- Change the UPI ID. A typo like `shop` is refused; you are asked to confirm; the payment QR link uses the new ID at once. Try **Swap** with a spare ID. If moving to a different merchant account, change or clear the merchant ID as well. Check the **Audit log** for the change.

---

## 8. Automated checks (for whoever maintains the code)

| What | Command | Expected |
|---|---|---|
| Backend tests (cases, knowledge, learning, soil, marketplace, stock, membership, sign-in hardening, telemetry, recommendations, stock alerts, WhatsApp…) | `cd app/backend && npx jest` | all pass (258+) |
| **Sign-in security, end to end** | `cd app/backend && npm run e2e:security` | `ALL PASSED` — **local only** (refuses to run against any non-local API or database): take-over routes closed, temporary-password flow, lock-out, rate limit, CORS, headers, compression |
| **Shop features, end to end** | `cd app/backend && npm run e2e:features` | `ALL PASSED` — **local only**: low-stock and out-of-stock alerts, "tell me when it is back" (including after a cancel), recommended products, WhatsApp preference, six simultaneous buyers of three units get exactly three orders |
| Clean up test data | `cd app/backend && npm run cleanup:test-data` (dry run) / `... -- --apply` | lists, then removes, products and people whose names start with "ZZ" (never-ordered products are deleted, ordered ones switched off, people deactivated). Check which database `DATABASE_URL` names first. |
| Type-check backend / web | `npx tsc --noEmit` in `app/backend` and `app/web` | no output |
| **Help, tour and FAQ assistant** | `cd app/web && npm run check:help` | `ALL OK` — 65 FAQs, 47 phrasing checks, 69 tour steps, 25 help sections: every FAQ has English and Telugu, every FAQ is found by its own question, typical phrasings and nonsense behave, and every tour step points at something that exists for that role |

The two end-to-end scripts need a local database: `docker compose up -d postgres` in `app/`, then `npx prisma migrate deploy && npx prisma db seed` with `DATABASE_URL=postgresql://agriai:agriai_dev_password@localhost:7002/agriai?schema=public`, start the backend with the same URL on port 7000, and run them with that `DATABASE_URL` set. Run them a minute apart (they use the sign-up routes, which are rate-limited). The seeded local Administrator is `9999999999` / `ChangeMe123!`; `scripts/e2e/visual-fixture.js` adds a demo member and data for looking at the screens.

Run `npm run check:help` whenever you change a screen, a menu link, `help/content.ts`, `help/faq.ts` or `tour/steps.ts`.

---

## 9. Known limitations and pending items (not bugs)

- Sign-up codes are shown on screen, not sent by SMS/WhatsApp (so a sign-up does not prove the person owns the number). Password resets go through an Administrator. In-app notifications (the bell) are the main channel.
- **WhatsApp updates are built but switched off.** They need the owner's WhatsApp Business account: set `WHATSAPP_MODE=log` on the server to see what would be sent (in the server log), then `live` with `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and an approved two-variable template (default name `agriai_notice`). Until then the Account page does not show the WhatsApp box.
- **No payment gateway / automatic renewals yet** — needs a payment-provider account (Razorpay or similar). The manual UPI-and-UTR flow remains; see `docs/UPGRADE_ROADMAP.md`.
- **Voice input** uses the phone browser's own speech recognition, so the Speak button only appears where the browser provides it (Chrome on Android usually does), and quality in Telugu depends on the phone. A server-side Telugu speech service is not built.
- Product suggestions under articles are matched by words in the product name and description (English and Telugu), so they are only as good as those descriptions.
- **Payments are manual UPI:** the member pays, submits the UTR, an Administrator verifies it against the bank. There is no payment gateway yet, so no automatic refunds and no Finance/invoicing module.
- Learning has no real course content yet — the structure works; courses need to be authored.
- None of the 30 products has a photo yet; stock figures for older products were placeholders and need real counts.
- The membership prices (₹499 monthly placeholder) and the UPI ID need the real values set by the owner, and the QR should be scanned once on a real phone.
- **Security still pending (owner's action):** the seeded Administrator password (`9999999999` / `ChangeMe123!`) has not been replaced — do it with `npm run admin:reset-password` or have another Administrator issue a temporary one; the Supabase `service_role` key has not been rotated.
- Leftover test data on the live site: "ZZ …" test products and members from earlier test rounds. Run `npm run cleanup:test-data` (dry run first) against the live database after checking `DATABASE_URL`.
- The help assistant answers only from its FAQ list; it does not understand every possible question (that is expected — see section 5).

---

## 10. Reporting a bug

Include: your role; the exact steps; what you expected and what happened; a screenshot (phone or laptop, light or dark); and the case / article / order / sample / product ID or the page address if there is one. For the help assistant, include the exact words you typed.

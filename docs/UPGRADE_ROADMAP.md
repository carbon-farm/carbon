# Upgrade roadmap — status after the 2026-10 review

Written 2026-10-24 after a code review and a short round of research (Indian farmer-app UX, competitors, UPI payments, WhatsApp pricing, Telugu speech). It records what was changed, what is deliberately switched off until the owner provides something, and how to finish each remaining piece. Research caveats: the sources were mostly vendor blogs and small studies, not adoption data — treat the UX directions as things to test with real users, and re-check any price or limit before committing money to it.

## 1. Done in this round

| Area | What changed | Where |
|---|---|---|
| **Sign-in security (critical)** | Password reset no longer returns a code (anyone could reset anyone). Registration codes are issued only to a pending sign-up (a code for an existing account used to log you in as them). Resets go through an Administrator: notification → check identity → one-time **temporary password** → forced change at next log in. Wrong-password lock-out (8 tries / 15 min per number), rate limits, CSPRNG codes, command-line admin reset. | `auth.service.ts`, `users.service.ts`, `jwt-auth.guard.ts`, `scripts/e2e/security.e2e.js` |
| **Hardening** | Security headers (helmet), compression, CORS limited to the live site + `CORS_ORIGINS`, trust-proxy so limits are per visitor, global 600/min limit. | `main.ts`, `app.module.ts`, `cors-origins.ts` |
| **Installable app** | Real icons (192/512/maskable/Apple), manifest with shortcuts. | `app/web/public`, `vite.config.ts` |
| **Speed** | Screens load on demand; libraries in their own cached files; initial JS ≈ 300 KB raw (≈100 KB compressed) instead of 684 KB. Photos are shrunk on the phone before upload (≈10× smaller). | `App.tsx`, `lib/image.ts` |
| **Learning from real use** | Own, privacy-light statistics (no third party, no names/numbers, 90-day retention): screens opened, **help questions the assistant could not answer**, tour outcomes, browser errors. Crash screen instead of a blank page. Admin screen *Usage & questions*. | `modules/telemetry`, `AdminUsagePage.tsx`, `telemetry/` |
| **Farmer-friendly cases** | Photo-first New case; symptom picture chips (bilingual, written into the case in both languages); Speak button where the browser supports it. | `NewCasePage.tsx`, `VoiceInput.tsx`, `caseSymptoms.ts` |
| **Advice → shop** | "Products that may help" under each advice article (transparent word-overlap match, English + Telugu). | `recommend.ts`, `RecommendedProducts.tsx` |
| **Member home** | "Today" panel: membership days left, open cases, latest order, photo-your-problem. Order again. Printable receipt. | `TodayPanel.tsx`, `OrderReceiptPage.tsx` |
| **Stock operations** | Low-stock and out-of-stock notifications (once, at the crossing); Stock filter; "Tell me when it is back" with notification on restock or cancel. | `stock-alerts.service.ts`, `StockWatchButton.tsx` |
| **WhatsApp channel** | Built, opt-in per member, **off by default** (see 2). | `whatsapp.service.ts`, `WhatsAppOptIn.tsx` |
| **Quality** | 258+ backend tests; local-only end-to-end scripts; `check:help` now also in CI; test-data clean-up script. | `scripts/e2e`, `.github/workflows/ci.yml` |

## 2. Switched off or blocked until the owner decides or provides something

### WhatsApp updates (built, off)
Needs a WhatsApp Business account. Steps:
1. In Meta's WhatsApp Business dashboard create a **utility template** with two text variables — `{{1}}` headline, `{{2}}` message — and get it approved. Default name `agriai_notice`; Telugu language code `te` (or `en`).
2. On the server set `WHATSAPP_MODE=log` first. Nothing is sent; the server log shows what *would* go to whom (number partly hidden). Check it with a test member who ticked the Account box.
3. Then set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` (and optionally `WHATSAPP_TEMPLATE`, `WHATSAPP_TEMPLATE_LANG`) and `WHATSAPP_MODE=live`.
Only these notices go out, only to members who opted in: order confirmed/shipped/delivered/cancelled, payment verified/rejected, membership verified/rejected/ending/ended, back in stock, case answered, follow-up requested. Reported 2026 prices: utility messages roughly ₹0.12–0.35 each, free for replies inside 24 hours; sources disagree — confirm on Meta's pricing page. Remember Meta's rule: send only to people who asked for it.

### Payment gateway and automatic renewal (not built)
Manual UPI + UTR checking is the largest recurring chore and the cause of "I paid but I'm locked". Replacing it needs a payment-provider account and keys (Razorpay is the usual choice), so it cannot be built or tested without the owner. The code is already shaped for it: payment confirmation goes through one method (`markVerified`) that a gateway webhook would call.
Plan when an account exists:
1. Create the order/payment on the provider (amount from the plan or the order, the member's ID in the notes) and show its checkout instead of the QR.
2. Add a webhook endpoint that checks the provider's signature (HMAC of the raw body with the webhook secret), looks the payment up by the id in the notes, and calls `markVerified`. Keep the UTR screen as a fallback.
3. For renewals, UPI AutoPay mandates (reported limit ₹15,000 per debit, customer notified before each debit; gateway fees vary — check). Until then, keep the "Membership ends in 3 days" reminders, which already exist.
4. Test only in the provider's test mode with their test cards/UPI IDs; refunds and GST invoices come after this (Finance module).

### Telugu voice input on the server (not built)
The Speak button uses the browser's own speech recognition, which exists on Chrome for Android but not everywhere, and Telugu quality varies. If real users need better: record a short clip in the browser, send it to a server-side Telugu speech-to-text service (AI4Bharat's open Telugu model, or a paid API with Telugu support) and fill the box with the result. That needs a hosting/cost decision, so it was left out; the keyboard's own microphone is the fallback shown on screen.

### Owner-only housekeeping
- **Replace the seeded Administrator password** (`ChangeMe123!`): `cd app/backend && npm run admin:reset-password -- 9999999999` against the live database, then log in and choose your own. Rotate the Supabase `service_role` key too.
- **Clean up test data** on the live site: `npm run cleanup:test-data` (dry run lists everything), then `-- --apply`. Check `DATABASE_URL` first. At the time of writing the live shop still listed test products named "ZZ Inv …" from earlier test runs.
- Set real plan prices and the UPI ID; upload product photos; add real descriptions that name the crops and problems each product treats (this is what the article suggestions match on).

## 3. Next ideas, in order of expected value

1. **Read the Usage & questions screen weekly** and turn each unanswered question into an FAQ entry — the cheapest way to make the assistant better.
2. **Crop calendar / seasonal tips** on the Today panel (what to watch for this month for the member's crops) — needs agronomy content from the experts.
3. **Mandi prices and weather** card — needs a data source and a decision on which markets.
4. **Subscription boxes** for the HARIHARAA food products (repeat delivery) once the payment gateway exists.
5. **Expert answer in Telugu audio** (an expert records a short voice reply) for members who cannot read well.
6. **Per-product low-stock level** and reorder suggestions (today the line is one shop-wide figure of 5).
7. **Offline drafts** for the New case form (photos taken in the field with no signal, sent when the signal returns).

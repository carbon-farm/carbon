// Checks that the Help page, the guided tour and the help assistant (FAQ chat) still agree with
// the app. Run with:  npm run check:help
//   - every FAQ has English and Telugu text, ids are unique, every audience has popular questions;
//   - every FAQ is found when its own question is typed (English and Telugu);
//   - typical phrasings reach the right answer, and nonsense reaches none;
//   - every tour step points at a menu link that exists for that role (or a known screen marker);
//   - Help sections are complete and have unique ids.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const entry = `
export * from './src/help/faq';
export * from './src/help/faqMatch';
export { TOURS } from './src/tour/steps';
export { NAV, isGroup } from './src/components/navConfig';
export { HELP_SECTIONS } from './src/help/content';
`;
const out = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'ts', sourcefile: 'check-help-entry.ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'error',
});
const code = out.outputFiles[0].text;
const m = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const { FAQS, answer, popularFor, TOURS, NAV, isGroup, HELP_SECTIONS } = m;

let bad = 0;
const fail = (...a) => {
  bad++;
  console.log('FAIL', ...a);
};

const AUDIENCES = ['GUEST', 'MEMBER', 'ADMINISTRATOR', 'VENDOR', 'EXPERT', 'MODERATOR', 'SUPPORT_AGENT'];

// 1. structure
const ids = new Set();
for (const f of FAQS) {
  if (ids.has(f.id)) fail('duplicate FAQ id', f.id);
  ids.add(f.id);
  if (!f.q.en || !f.q.te || !f.a.length || f.a.some((p) => !p.en || !p.te)) fail('FAQ missing English or Telugu text', f.id);
  if (!f.keywords.length) fail('FAQ has no keywords', f.id);
}
for (const a of AUDIENCES) if (popularFor(a).length === 0) fail('no suggested questions for', a);

// 2. every FAQ is reachable by its own question
for (const aud of AUDIENCES) {
  for (const f of FAQS.filter((x) => x.audience === 'ALL' || x.audience.includes(aud))) {
    for (const lang of ['en', 'te']) {
      const r = answer(f.q[lang], aud);
      if (r.best?.faq.id !== f.id) fail(`own question not matched [${aud}/${lang}]`, f.id, '->', r.best?.faq.id ?? null);
    }
  }
}

// 3. phrasings people use
const cases = [
  ['GUEST', 'how do i create an account', 'register'],
  ['GUEST', 'I forgot my password', 'forgot-password'],
  ['GUEST', 'otp not received', 'otp'],
  ['GUEST', 'why cant i checkout', 'why-locked'],
  ['MEMBER', 'I paid but still locked', 'paid-but-locked'],
  ['MEMBER', 'how to pay membership', 'how-to-pay-membership'],
  ['MEMBER', 'where do I find the utr', 'utr'],
  ['MEMBER', 'how do I track my order', 'order-status'],
  ['MEMBER', 'can I cancel my order', 'cancel-order'],
  ['MEMBER', 'how to place an order', 'checkout-steps'],
  ['MEMBER', 'when does my membership expire', 'renew'],
  ['MEMBER', 'soil test ela cheyali', 'soil'],
  ['MEMBER', 'ask expert about disease in my crop', 'cases'],
  ['MEMBER', 'చెల్లించాను కానీ లాక్', 'paid-but-locked'],
  ['MEMBER', 'సభ్యత్వానికి ఎలా చెల్లించాలి', 'how-to-pay-membership'],
  ['MEMBER', 'నా ఆర్డర్ ఎక్కడ', 'order-status'],
  ['MEMBER', 'పాస్‌వర్డ్ మర్చిపోయాను', 'forgot-password'],
  ['MEMBER', 'wishlist heart', 'hearts'],
  ['MEMBER', 'what is HHC id', 'my-id'],
  ['MEMBER', 'cannot add to cart out of stock', 'out-of-stock'],
  ['ADMINISTRATOR', 'how to add a new product', 'admin-add-product'],
  ['ADMINISTRATOR', 'reduce stock', 'admin-stock'],
  ['ADMINISTRATOR', 'stock history', 'admin-stock'],
  ['ADMINISTRATOR', 'change upi id', 'admin-upi'],
  ['ADMINISTRATOR', 'give free access to a member', 'admin-free-access'],
  ['ADMINISTRATOR', 'approve membership payment', 'admin-verify-membership'],
  ['ADMINISTRATOR', 'cancel order what happens to stock', 'admin-cancel-order'],
  ['ADMINISTRATOR', 'create staff account', 'admin-staff'],
  ['ADMINISTRATOR', 'approve vendor', 'admin-vendors'],
  ['ADMINISTRATOR', 'membership plans price', 'admin-plans'],
  ['ADMINISTRATOR', 'audit log', 'admin-reports'],
  ['ADMINISTRATOR', 'how does a member pay for membership', 'how-to-pay-membership'],
  ['VENDOR', 'how do i add stock', 'admin-stock'],
  ['VENDOR', 'how to start selling', 'vendor-start'],
  ['SUPPORT_AGENT', 'how to dispatch an order', 'support-dispatch'],
  ['MODERATOR', 'assign case to expert', 'moderator-start'],
  ['EXPERT', 'how to answer cases', 'expert-start'],
  ['MEMBER', 'how do I add photos to my case', 'case-photos'],
  ['MEMBER', 'can I speak instead of typing', 'voice'],
  ['MEMBER', 'order the same things again', 'reorder'],
  ['MEMBER', 'I need a receipt for my order', 'receipt'],
  ['MEMBER', 'tell me when it is back in stock', 'back-in-stock'],
  ['MEMBER', 'can I get updates on whatsapp', 'whatsapp'],
  ['MEMBER', 'I forgot my password', 'forgot-password'],
  ['ADMINISTRATOR', 'a member forgot their password what do I do', 'admin-temp-password'],
  ['ADMINISTRATOR', 'how will I know when stock is low', 'admin-low-stock'],
  ['ADMINISTRATOR', 'what questions could the assistant not answer', 'admin-usage'],
  ['MEMBER', 'what if I have no signal', 'offline-case'],
  ['MEMBER', 'what are the seasonal tips', 'seasonal-tips'],
  ['ADMINISTRATOR', 'how do I add a seasonal tip', 'admin-seasonal'],
  ['ADMINISTRATOR', 'how much should I reorder', 'admin-restock'],
  ['ADMINISTRATOR', 'set a warning level for one product', 'admin-low-stock'],
];
for (const [aud, q, want] of cases) {
  const got = answer(q, aud).best?.faq.id ?? null;
  if (got !== want) fail(`[${aud}] "${q}" -> ${got} (wanted ${want})`);
}
for (const q of ['asdfgh qwerty', 'hello', 'what is the weather', '']) {
  const got = answer(q, 'MEMBER').best?.faq.id ?? null;
  if (got) fail(`nonsense "${q}" matched ${got}`);
}

// 4. tour
const markers = new Set(['help', 'bell', 'user', 'chat', 'auth', 'filters', 'products', 'payment-strip', 'today']);
for (const [aud, steps] of Object.entries(TOURS)) {
  const navTargets = new Set((NAV[aud] ?? []).flatMap((e) => (isGroup(e) ? e.items.map((i) => i.to) : [e.to])));
  for (const s of steps) {
    if (!s.en || !s.te) fail('tour step missing text', aud, s.target);
    if (!s.target) continue;
    if (s.target.startsWith('/') ? !navTargets.has(s.target) : !markers.has(s.target)) fail('tour target not on screen for role', aud, s.target);
  }
  if (!steps.some((s) => s.target === 'chat')) fail('tour has no help-assistant step', aud);
  if (!steps.some((s) => s.target === 'help')) fail('tour has no Help step', aud);
}

// 5. help sections
const helpIds = new Set();
for (const h of HELP_SECTIONS) {
  if (helpIds.has(h.id)) fail('duplicate help section id', h.id);
  helpIds.add(h.id);
  if (!h.title.en || !h.title.te || !h.body.length || h.body.some((b) => !b.en || !b.te)) fail('help section missing text', h.id);
}

console.log(
  bad
    ? `\n${bad} PROBLEM(S)`
    : `ALL OK — ${FAQS.length} FAQs, ${cases.length} phrasing checks, ${Object.values(TOURS).reduce((n, t) => n + t.length, 0)} tour steps, ${HELP_SECTIONS.length} help sections`,
);
process.exit(bad ? 1 : 0);

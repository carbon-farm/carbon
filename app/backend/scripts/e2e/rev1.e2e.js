// End-to-end check of the "Rev 1" tester feedback: readable case / order / soil numbers, UPI-only
// checkout, "X of Y items sent" messages, a typed-in crop, follow-up cases that carry the whole
// history, and the store phone number.
// LOCAL ONLY — see local-only.js.
require('./local-only');
const { PrismaClient } = require('@prisma/client');
const B = process.env.API || 'http://localhost:7000/api/v1';
const prisma = new PrismaClient();
let fails = 0;
const ok = (label, c) => { if (!c) fails++; console.log(c ? 'PASS' : '** FAIL **', label); };
const call = async (m, p, t, b) => {
  const r = await fetch(B + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined });
  let d = null; try { d = await r.json(); } catch {}
  return { s: r.status, d };
};
const RUN = Date.now().toString().slice(-6);
const num = (n) => `75${RUN.slice(-5)}${n}${Math.floor(Math.random() * 90 + 10)}`.slice(0, 10);
const today = () => new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10).replace(/-/g, '');

(async () => {
  const admin = (await call('POST', '/auth/login', null, { mobileNumber: '9999999999', password: 'ChangeMe123!' })).d.accessToken;

  const mkMember = async (n, name) => {
    const m = num(n);
    const r = await call('POST', '/auth/register', null, { mobileNumber: m, password: 'Member12345', name });
    const v = await call('POST', '/auth/otp/verify', null, { mobileNumber: m, code: r.d.devOtp, purpose: 'REGISTRATION' });
    const me = (await call('GET', '/users/me', v.d.accessToken)).d;
    await call('POST', `/hariharaa/members/${me.id}/free`, admin, { until: '2027-12-31' });
    return { token: v.d.accessToken, id: me.id, code: me.userCode };
  };
  const mkStaff = async (n, role, name) => {
    const m = num(n);
    const c = await call('POST', '/users/staff', admin, { mobileNumber: m, temporaryPassword: 'Staff12345', name, role });
    const l = await call('POST', '/auth/login', null, { mobileNumber: m, password: 'Staff12345' });
    return { token: l.d.accessToken, id: c.d.id };
  };
  const M = await mkMember(1, 'ZZ Rev1 Farmer');
  const Other = await mkMember(2, 'ZZ Rev1 Stranger');
  const Mod = await mkStaff(3, 'MODERATOR', 'ZZ Rev1 Moderator');
  const Exp = await mkStaff(4, 'EXPERT', 'ZZ Rev1 Expert');
  await call('PATCH', '/experts/me/credentials', Exp.token, { qualification: 'MSc Agronomy (test)' });
  const profile = await prisma.expertProfile.findUnique({ where: { userId: Exp.id } });
  await call('PATCH', `/experts/credentials/${profile.id}/verify`, admin, { approve: true });

  const compact = (M.code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  console.log(`== member ${M.code} -> ${compact}`);

  console.log('== 1. cases: readable numbers, a typed-in crop, follow-ups');
  const cat = await prisma.caseCategoryMaster.findFirst();
  const farm = (await call('POST', '/farms', M.token, { label: 'ZZ Rev1 plot', address: 'Guntur village', landSizeAcres: 1.5, primaryCrops: ['Dragon fruit'] })).d;
  const c1 = (await call('POST', '/cases', M.token, { farmLandId: farm.id, categoryId: cat.id, cropName: 'Dragon fruit', problemDescription: 'Stem tips are rotting' })).d;
  ok('a crop that is not in the list is kept as typed', c1.cropName === 'Dragon fruit' && c1.cropId === null);
  const s1 = await call('POST', `/cases/${c1.id}/submit`, M.token);
  ok(`first case today -> CASE-${compact}-${today()}-001 (got ${s1.d.caseNumber})`, s1.d.caseNumber === `CASE-${compact}-${today()}-001`);
  const c2 = (await call('POST', '/cases', M.token, { farmLandId: farm.id, categoryId: cat.id, cropName: 'Dragon fruit', problemDescription: 'Second problem same day' })).d;
  const s2 = await call('POST', `/cases/${c2.id}/submit`, M.token);
  ok(`second case today ends -002 (got ${s2.d.caseNumber})`, s2.d.caseNumber === `CASE-${compact}-${today()}-002`);
  const bad = await call('POST', '/cases', M.token, { farmLandId: farm.id, categoryId: cat.id, cropName: 'x'.repeat(61), problemDescription: 'Too long a crop name' });
  ok(`a 61-letter crop name is refused -> ${bad.s}`, bad.s === 400);

  // run case 1 to an answer
  await call('POST', `/cases/${c1.id}/review`, Mod.token);
  await call('POST', `/cases/${c1.id}/assign`, Mod.token, { expertId: Exp.id });
  await call('POST', `/cases/${c1.id}/start-work`, Exp.token);
  const ans = await call('POST', `/cases/${c1.id}/answer`, Exp.token, { resolutionNotes: 'FIRST: cut and dust with sulphur.' });
  ok('expert answers the first case', ans.s === 201);
  await call('POST', `/cases/${c1.id}/confirm`, M.token);

  const fu = (await call('POST', '/cases', M.token, { farmLandId: farm.id, categoryId: cat.id, cropName: 'Dragon fruit', relatedCaseId: c1.id, problemDescription: 'Advice did not work, still rotting' })).d;
  ok('a follow-up case links to the earlier one', fu.relatedCaseId === c1.id);
  const stranger = await call('POST', '/cases', Other.token, { farmLandId: (await call('POST', '/farms', Other.token, { label: 'ZZ Stranger plot', address: 'Tenali town', landSizeAcres: 1, primaryCrops: ['Rice'] })).d.id, categoryId: cat.id, relatedCaseId: c1.id, problemDescription: 'Trying to follow up someone else' });
  ok(`someone else's case cannot be followed up -> ${stranger.s}`, stranger.s >= 400 && stranger.s < 500);
  const sfu = await call('POST', `/cases/${fu.id}/submit`, M.token);
  ok(`follow-up gets its own number (${sfu.d.caseNumber})`, /^CASE-.*-003$/.test(sfu.d.caseNumber));
  await call('POST', `/cases/${fu.id}/review`, Mod.token);
  await call('POST', `/cases/${fu.id}/assign`, Mod.token, { expertId: Exp.id });
  const detail = (await call('GET', `/cases/${fu.id}`, Exp.token)).d;
  ok('the case shows what it follows up', detail.relatedCase && detail.relatedCase.id === c1.id && detail.relatedCase.caseNumber === s1.d.caseNumber);
  const hist = (await call('GET', `/cases/${fu.id}/history`, Exp.token)).d;
  const numbers = [...new Set(hist.map((e) => e.caseNumber))];
  ok(`the expert sees the earlier case's history first (${numbers.join(' then ')})`, numbers.length === 2 && numbers[0] === s1.d.caseNumber && numbers[1] === sfu.d.caseNumber);
  ok('...including the first advice', hist.some((e) => e.kind === 'ANSWERED' && e.text.startsWith('FIRST')));

  console.log('== 2. soil test numbers');
  const smp = await call('POST', '/soil-samples', M.token, { farmLandId: farm.id, collectionVideoWatched: true });
  ok(`soil number is SOIL-${compact}-${today()}-001 (got ${smp.d.sampleCode})`, smp.d.sampleCode === `SOIL-${compact}-${today()}-001`);
  const smp2 = await call('POST', '/soil-samples', M.token, { farmLandId: farm.id, collectionVideoWatched: true });
  ok(`...and the next one -002 (got ${smp2.d.sampleCode})`, smp2.d.sampleCode === `SOIL-${compact}-${today()}-002`);

  console.log('== 3. orders: UPI only, readable number, partly-sent message');
  const mk = (suffix, price, stock) => call('POST', '/marketplace/products', admin, { name: `ZZ Rev1 ${RUN} ${suffix}`, description: 'Test product', unit: 'per pack', price, stockQuantity: stock });
  const pA = (await mk('A', 100, 50)).d;
  const pB = (await mk('B', 60, 50)).d;
  const addr = (await call('POST', '/addresses', M.token, { recipientName: 'ZZ Rev1', phone: '9876543210', line1: '12 Test Street', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' })).d;
  await call('POST', '/marketplace/cart', M.token, { productId: pA.id, quantity: 2 });
  await call('POST', '/marketplace/cart', M.token, { productId: pB.id, quantity: 1 });
  const cod = await call('POST', '/marketplace/orders/checkout', M.token, { addressId: addr.id, paymentMethod: 'COD' });
  ok(`Cash on Delivery is refused -> ${cod.s}`, cod.s === 400);
  ok('...and the cart is untouched by the refusal', (await call('GET', '/marketplace/cart', M.token)).d.items.length === 2);
  const o1 = await call('POST', '/marketplace/orders/checkout', M.token, { addressId: addr.id, paymentMethod: 'UPI' });
  ok(`UPI order placed with number ORD-${compact}-${today()}-001 (got ${o1.d.orderNumber})`, o1.s === 201 && o1.d.orderNumber === `ORD-${compact}-${today()}-001`);
  const none = await call('POST', '/marketplace/orders/checkout', M.token, { addressId: addr.id, paymentMethod: 'UPI' });
  ok(`checkout with an empty cart is refused -> ${none.s}`, none.s === 400);
  await call('POST', '/marketplace/cart', M.token, { productId: pA.id, quantity: 1 });
  const o2 = await call('POST', '/marketplace/orders/checkout', M.token, { addressId: addr.id });
  ok(`no payment method given defaults to UPI, number -002 (got ${o2.d.orderNumber}, ${o2.d.paymentMethod})`, o2.d.paymentMethod === 'UPI' && o2.d.orderNumber === `ORD-${compact}-${today()}-002`);

  // pay + verify + confirm the first order, then send one item of two
  await call('POST', `/marketplace/orders/${o1.d.id}/payment/start`, M.token);
  await call('POST', `/marketplace/orders/${o1.d.id}/payment/claim`, M.token, { utr: `UTR${RUN}0001` });
  const rev = await call('POST', `/marketplace/orders/${o1.d.id}/payment/review`, admin, { approve: true });
  ok(`payment verified -> ${rev.s}`, rev.s === 201);
  await call('POST', `/marketplace/orders/${o1.d.id}/confirm`, admin);
  const full = (await call('GET', `/marketplace/orders/${o1.d.id}`, admin)).d;
  const before = (await call('GET', '/notifications', M.token)).d.length;
  await call('POST', `/marketplace/orders/${o1.d.id}/items/${full.items[0].id}/dispatch-status`, admin, { status: 'SENT' });
  const notes = (await call('GET', '/notifications', M.token)).d;
  const partly = notes.find((n) => n.type === 'order.items_sent');
  ok(`marking 1 of 2 items Sent tells the farmer (${notes.length - before} new)`, notes.length === before + 1 && !!partly);
  ok(`...the message says how many (${partly && partly.body})`, partly && /1 of 2/.test(partly.body));
  await call('POST', `/marketplace/orders/${o1.d.id}/items/${full.items[1].id}/dispatch-status`, admin, { status: 'SENT' });
  const notes2 = (await call('GET', '/notifications', M.token)).d.filter((n) => n.type === 'order.items_sent');
  ok(`...and again when everything is sent (${notes2[0] && notes2[0].body})`, notes2.length === 2);

  // nothing is sent before the money is verified, or on a cancelled order, and a double tap does not notify twice
  const unpaid = (await call('GET', `/marketplace/orders/${o2.d.id}`, admin)).d;
  const refuse = await call('POST', `/marketplace/orders/${o2.d.id}/items/${unpaid.items[0].id}/dispatch-status`, admin, { status: 'SENT' });
  ok(`an item of an unpaid UPI order cannot be marked Sent -> ${refuse.s}`, refuse.s === 400);
  const noteCount = (await call('GET', '/notifications', M.token)).d.filter((n) => n.type === 'order.items_sent').length;
  const again = await call('POST', `/marketplace/orders/${o1.d.id}/items/${full.items[1].id}/dispatch-status`, admin, { status: 'SENT' });
  ok(`marking an already-Sent item Sent again changes nothing -> ${again.s}`, again.s === 201 && (await call('GET', '/notifications', M.token)).d.filter((n) => n.type === 'order.items_sent').length === noteCount);
  await call('POST', `/marketplace/orders/${o2.d.id}/cancel`, M.token);
  const cancelledSend = await call('POST', `/marketplace/orders/${o2.d.id}/items/${unpaid.items[0].id}/dispatch-status`, admin, { status: 'SENT' });
  ok(`nothing can be sent on a cancelled order -> ${cancelledSend.s}`, cancelledSend.s === 400);

  console.log('== 4. store phone number');
  // the settings form always sends the UPI ID along with whatever else it changes
  const cur = (await call('GET', '/hariharaa/settings', admin)).d;
  const upi = cur ? cur.primaryUpiId : 'teststore@okaxis';
  const patch = (body) => call('PATCH', '/hariharaa/settings', admin, { primaryUpiId: upi, ...body });
  const set = await patch({ contactPhone: '+91 98765 43210' });
  ok(`admin sets the store phone -> ${set.s}`, set.s === 200);
  const pub = await call('GET', '/hariharaa/settings/public', null);
  ok('visitors can see it', pub.d.contactPhone === '+91 98765 43210');
  ok('...but still not the UPI ID', !JSON.stringify(pub.d).includes(upi) && !('primaryUpiId' in pub.d));
  ok('letters are refused', (await patch({ contactPhone: 'call me' })).s === 400);
  ok('a member cannot change it', (await call('PATCH', '/hariharaa/settings', M.token, { primaryUpiId: upi, contactPhone: '1234567' })).s === 403);
  const cleared = await patch({ contactPhone: '' });
  ok('empty clears it', cleared.s === 200 && (await call('GET', '/hariharaa/settings/public', null)).d.contactPhone === null);
  await patch({ contactPhone: '+91 98765 43210' });

  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  await prisma.$disconnect();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

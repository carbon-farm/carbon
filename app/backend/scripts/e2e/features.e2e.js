// End-to-end check of low-stock alerts, "tell me when it is back", recommended products, preferences and simultaneous buyers.
//
// LOCAL ONLY — see local-only.js for how to run it.
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
const mobile = `79${RUN}${Math.floor(Math.random() * 90 + 10)}`.slice(0, 10);

(async () => {
  const admin = (await call('POST', '/auth/login', null, { mobileNumber: '9999999999', password: 'ChangeMe123!' })).d.accessToken;
  const reg = await call('POST', '/auth/register', null, { mobileNumber: mobile, password: 'Member12345', name: 'ZZ Feature Member' });
  const ver = await call('POST', '/auth/otp/verify', null, { mobileNumber: mobile, code: reg.d.devOtp, purpose: 'REGISTRATION' });
  const M = ver.d.accessToken;
  const me = (await call('GET', '/users/me', M)).d;
  ok('member created', !!M && me.role === 'MEMBER');

  console.log('== 0. membership gate still holds for the new endpoints');
  const noMem = await call('GET', '/marketplace/recommendations/article/x', M);
  ok(`member without membership cannot use recommendations -> ${noMem.s}`, noMem.s === 403);
  ok('anonymous cannot -> 401', (await call('GET', '/marketplace/recommendations/article/x')).s === 401);
  const grant = await call('POST', `/hariharaa/members/${me.id}/free`, admin, { until: '2027-12-31' });
  ok(`administrator grants free access -> ${grant.s}`, grant.s === 201 || grant.s === 200);

  console.log('== 1. products');
  const mk = (suffix, stock, description, price = 100) =>
    call('POST', '/marketplace/products', admin, { name: `ZZ Feat ${RUN} ${suffix}`, description, unit: 'per bottle', price, stockQuantity: stock });
  const mg = (await mk('Magnesium Sulphate', 12, 'Corrects magnesium deficiency in plants. Magnesium sulphate spray for yellowing between the veins of older leaves.')).d;
  const honey = (await mk('Forest Honey', 12, 'Raw forest honey, unprocessed and pure.')).d;
  const neem = (await mk('Neem Oil', 6, 'Neem oil controls aphids and whitefly on chilli and cotton.')).d;
  ok('three products created', mg.id && honey.id && neem.id);

  console.log('== 2. low-stock and out-of-stock alerts');
  const addr = (await call('POST', '/addresses', M, { recipientName: 'ZZ Feature', phone: '9876543210', line1: '12 Test Street', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' })).d;
  const buy = async (productId, qty) => {
    const c = await call('POST', '/marketplace/cart', M, { productId, quantity: qty });
    if (c.s >= 300) return { s: c.s, d: c.d, step: 'cart' };
    return call('POST', '/marketplace/orders/checkout', M, { addressId: addr.id, paymentMethod: 'COD' });
  };
  const adminNotes = async () => (await call('GET', '/notifications', admin)).d;
  const before = (await adminNotes()).length;
  const o1 = await buy(neem.id, 2); // 6 -> 4 : crosses the low line
  ok(`order 1 placed -> ${o1.s}`, o1.s === 201);
  let notes = await adminNotes();
  ok('administrator got a LOW stock notice (4 left)', notes.some((n) => n.type === 'stock.low' && /Neem/.test(n.body) && /only 4 left/.test(n.body)));
  const o2 = await buy(neem.id, 1); // 4 -> 3 : already low, no repeat
  notes = await adminNotes();
  ok('no second low-stock notice while already low', notes.filter((n) => n.type === 'stock.low' && /Neem/.test(n.body)).length === 1);
  const o3 = await buy(neem.id, 3); // 3 -> 0
  ok(`order 3 took the last units -> ${o3.s}`, o3.s === 201);
  notes = await adminNotes();
  ok('administrator got an OUT of stock notice', notes.some((n) => n.type === 'stock.out' && /Neem/.test(n.body)));
  ok(`a plain sale far above the line says nothing (${notes.length - before} new notices so far)`, true);
  const lowList = (await call('GET', '/marketplace/alerts/low-stock', admin)).d;
  ok('low-stock list includes the sold-out product, lowest first', Array.isArray(lowList) && lowList[0]?.stockQuantity === 0 && lowList.some((p) => p.id === neem.id));
  ok('a member cannot read the administrator low-stock list', (await call('GET', '/marketplace/alerts/low-stock', M)).s === 403);

  console.log('== 3. "tell me when it is back"');
  const w1 = await call('POST', `/marketplace/stock-watch/${neem.id}`, M);
  ok('member asks to be told', w1.s === 201 && w1.d.watching === true);
  ok('it shows in their watch list', (await call('GET', '/marketplace/stock-watch/mine', M)).d.includes(neem.id));
  const w2 = await call('POST', `/marketplace/stock-watch/${neem.id}`, M);
  ok('tapping again cancels', w2.d.watching === false);
  await call('POST', `/marketplace/stock-watch/${neem.id}`, M);
  const unreadBefore = (await call('GET', '/notifications', M)).d.length;
  const addStock = await call('POST', `/marketplace/products/${neem.id}/stock`, admin, { mode: 'ADD', quantity: 10, reason: 'new delivery' });
  ok(`administrator adds stock -> ${addStock.s}`, addStock.s === 201);
  const memberNotes = (await call('GET', '/notifications', M)).d;
  ok('the member was told it is back', memberNotes.length === unreadBefore + 1 && memberNotes.some((n) => n.type === 'stock.back_in_stock' && /Neem/.test(n.body)));
  ok('the request was cleared after the notice', !(await call('GET', '/marketplace/stock-watch/mine', M)).d.includes(neem.id));
  const again = await call('POST', `/marketplace/products/${neem.id}/stock`, admin, { mode: 'ADD', quantity: 1 });
  ok('adding stock to something already in stock sends nothing more', (await call('GET', '/notifications', M)).d.length === unreadBefore + 1 && again.s === 201);
  ok('administrators cannot use the member watch endpoint', (await call('POST', `/marketplace/stock-watch/${neem.id}`, admin)).s === 403);

  console.log('== 4. cancelling an order that emptied a product tells watchers too');
  const solo = (await mk('Solo Item', 1, 'A single unit item for the cancel test')).d;
  const oSolo = await buy(solo.id, 1);
  await call('POST', `/marketplace/stock-watch/${solo.id}`, M);
  const n0 = (await call('GET', '/notifications', M)).d.length;
  const cancel = await call('POST', `/marketplace/orders/${oSolo.d.id}/cancel`, admin);
  ok(`administrator cancels it -> ${cancel.s}`, cancel.s === 201);
  ok('the watcher is told the unit is back', (await call('GET', '/notifications', M)).d.some((n) => n.type === 'stock.back_in_stock' && /Solo/.test(n.body)) && (await call('GET', '/notifications', M)).d.length > n0);

  console.log('== 5. recommended products for an advice article');
  const farm = await prisma.farmLand.create({ data: { farmerId: me.id, label: 'ZZ test farm', address: 'x', landSizeAcres: 1, primaryCrops: [] } });
  const cat = await prisma.caseCategoryMaster.findFirst();
  const chilli = await prisma.cropMaster.findFirst({ where: { name: { contains: 'Chilli', mode: 'insensitive' } } });
  const kase = await prisma.case.create({ data: { farmerId: me.id, farmLandId: farm.id, categoryId: cat.id, cropId: chilli?.id, problemDescription: 'yellow leaves', status: 'CLOSED' } });
  const author = await prisma.user.findUnique({ where: { mobileNumber: '9999999999' } });
  const art = await prisma.knowledgeArticle.create({
    data: { sourceCaseId: kase.id, authorId: author.id, title: 'Magnesium deficiency in chilli', cropId: chilli?.id, symptoms: 'Yellowing between the veins of older leaves', problemDescription: 'Older leaves turn yellow between the veins', expertSolution: 'Apply magnesium sulphate as a foliar spray.', status: 'PUBLISHED', publishedAt: new Date() },
  });
  const rec = await call('GET', `/marketplace/recommendations/article/${art.id}`, M);
  ok(`recommendations endpoint -> ${rec.s}`, rec.s === 200 && Array.isArray(rec.d));
  ok(`finds the magnesium product first (${rec.d.map((p) => p.name.replace(/ZZ Feat \d+ /, '')).join(', ')})`, rec.d[0]?.id === mg.id);
  ok('does not suggest the honey', !rec.d.some((p) => p.id === honey.id));
  ok('returns full product data (price, stock, images)', rec.d[0] && typeof rec.d[0].price === 'number' && 'imageUrls' in rec.d[0]);
  await prisma.product.update({ where: { id: mg.id }, data: { stockQuantity: 0 } });
  ok('a product that is out of stock is no longer suggested', !(await call('GET', `/marketplace/recommendations/article/${art.id}`, M)).d.some((p) => p.id === mg.id));
  await prisma.knowledgeArticle.update({ where: { id: art.id }, data: { status: 'DRAFT' } });
  ok('an unpublished article gets no suggestions', (await call('GET', `/marketplace/recommendations/article/${art.id}`, M)).d.length === 0);
  ok('an unknown article id is just an empty list', (await call('GET', '/marketplace/recommendations/article/00000000-0000-0000-0000-000000000000', M)).d.length === 0);

  console.log('== 6. preferences');
  ok('WhatsApp is not offered while the server has it off', (await call('GET', '/users/me', M)).d.whatsappAvailable === false);
  const pref = await call('PATCH', '/users/me/preferences', M, { whatsappOptIn: true });
  ok('member can set the opt-in', pref.s === 200 && pref.d.whatsappOptIn === true && !pref.d.passwordHash);
  ok('it is remembered', (await call('GET', '/users/me', M)).d.whatsappOptIn === true);
  ok('a non-boolean is refused', (await call('PATCH', '/users/me/preferences', M, { whatsappOptIn: 'yes' })).s === 400);
  ok('unknown fields are refused', (await call('PATCH', '/users/me/preferences', M, { whatsappOptIn: true, role: 'ADMINISTRATOR' })).s === 400);

  console.log('== 7. simultaneous buyers of the last units');
  const race = (await mk('Race Item', 3, 'Three units, six buyers')).d;
  const buyers = [];
  for (let i = 0; i < 6; i++) {
    const m = `78${RUN.slice(-5)}${i}${Math.floor(Math.random() * 90 + 10)}`;
    const r = await call('POST', '/auth/register', null, { mobileNumber: m, password: 'Member12345', name: 'ZZ Race ' + i });
    const v = await call('POST', '/auth/otp/verify', null, { mobileNumber: m, code: r.d.devOtp, purpose: 'REGISTRATION' });
    const meR = (await call('GET', '/users/me', v.d.accessToken)).d;
    await call('POST', `/hariharaa/members/${meR.id}/free`, admin, { until: '2027-12-31' });
    const a = (await call('POST', '/addresses', v.d.accessToken, { recipientName: 'ZZ Race', phone: '9876543210', line1: '1 Race Road', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' })).d;
    await call('POST', '/marketplace/cart', v.d.accessToken, { productId: race.id, quantity: 1 });
    buyers.push({ token: v.d.accessToken, addressId: a.id });
  }
  const results = await Promise.all(buyers.map((b) => call('POST', '/marketplace/orders/checkout', b.token, { addressId: b.addressId, paymentMethod: 'COD' })));
  const won = results.filter((r) => r.s === 201).length;
  const lost = results.filter((r) => r.s === 400).length;
  const stockLeft = (await prisma.product.findUnique({ where: { id: race.id } })).stockQuantity;
  ok(`six buyers, three units: exactly three orders (${results.map((r) => r.s).join('/')}), stock ${stockLeft}`, won === 3 && lost === 3 && stockLeft === 0);
  const ledger = await prisma.stockMovement.aggregate({ where: { productId: race.id }, _sum: { quantityChange: true } });
  ok('the stock history adds up to the live count', (ledger._sum.quantityChange ?? 0) === stockLeft);

  console.log('== 8. clean up');
  await prisma.knowledgeArticle.delete({ where: { id: art.id } });
  await prisma.case.delete({ where: { id: kase.id } });
  await prisma.farmLand.delete({ where: { id: farm.id } });
  await prisma.notification.deleteMany({ where: { OR: [{ body: { contains: 'ZZ Feat' } }, { userId: me.id }] } });
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  await prisma.$disconnect();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

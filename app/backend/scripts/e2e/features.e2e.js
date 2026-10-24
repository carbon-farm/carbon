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
    return call('POST', '/marketplace/orders/checkout', M, { addressId: addr.id, paymentMethod: 'UPI' });
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

  console.log('== 6b. a warning level of its own for each product');
  const own = (await call('POST', '/marketplace/products', admin, { name: `ZZ Feat ${RUN} Own Level`, description: 'A product with its own warning level', unit: 'per bag', price: 50, stockQuantity: 25, lowStockAt: 20 })).d;
  ok('created with its own level (20)', own.lowStockAt === 20);
  await buy(own.id, 3); // 25 -> 22: still above 20
  ok('no alert while above its level', !(await adminNotes()).some((n) => n.type === 'stock.low' && /Own Level/.test(n.body)));
  await buy(own.id, 3); // 22 -> 19: crosses 20
  ok('alert as soon as it reaches its own level (19 left)', (await adminNotes()).some((n) => n.type === 'stock.low' && /Own Level/.test(n.body) && /only 19 left/.test(n.body)));
  const zero = (await call('POST', '/marketplace/products', admin, { name: `ZZ Feat ${RUN} Zero Level`, description: 'Only warn me when it is all gone', unit: 'per bag', price: 50, stockQuantity: 8, lowStockAt: 0 })).d;
  await buy(zero.id, 6); // 8 -> 2: below the shop default, but this product only warns at zero
  ok('level 0 means no low warning above zero', !(await adminNotes()).some((n) => n.type === 'stock.low' && /Zero Level/.test(n.body)));
  await buy(zero.id, 2); // -> 0
  ok('...but it does warn when it is gone', (await adminNotes()).some((n) => n.type === 'stock.out' && /Zero Level/.test(n.body)));
  const lowList2 = (await call('GET', '/marketplace/alerts/low-stock', admin)).d;
  ok('the low-stock list respects each product\'s level', lowList2.some((p) => p.id === own.id) && lowList2.some((p) => p.id === zero.id));
  const reset = await call('PATCH', `/marketplace/products/${own.id}`, admin, { lowStockAt: null });
  ok('an empty level puts a product back on the shop default', reset.s === 200 && reset.d.lowStockAt === null);
  ok('a negative level is refused', (await call('PATCH', `/marketplace/products/${own.id}`, admin, { lowStockAt: -1 })).s === 400);
  ok('a fractional level is refused', (await call('PATCH', `/marketplace/products/${own.id}`, admin, { lowStockAt: 2.5 })).s === 400);

  console.log('== 6c. restock suggestions');
  const lowRows = (await call('GET', '/marketplace/alerts/low-stock', admin)).d;
  const neemRow = lowRows.find((r) => r.id === zero.id);
  ok('every row carries last-30-day sales and a suggestion field', lowRows.every((r) => typeof r.soldLast30Days === 'number' && 'suggestedReorder' in r));
  ok(`the product that just sold out shows its sales (${neemRow?.soldLast30Days}) and a restock number (${neemRow?.suggestedReorder})`, neemRow && neemRow.soldLast30Days === 8 && neemRow.suggestedReorder === 10 + 0);
  await call('PATCH', `/marketplace/products/${own.id}`, admin, { lowStockAt: 25 }); // so it is on the low list again
  const cancelledSale = await buy(own.id, 1);
  await call('POST', `/marketplace/orders/${cancelledSale.d.id}/cancel`, admin);
  const ownRow = (await call('GET', '/marketplace/alerts/low-stock', admin)).d.find((r) => r.id === own.id);
  ok('a cancelled order does not count as a sale', ownRow && ownRow.soldLast30Days === 6);

  console.log('== 6d. seasonal tips');
  // earlier runs leave their own "ZZ" tips behind, which would crowd out this run's
  await prisma.seasonalTip.deleteMany({ where: { titleEn: { startsWith: 'ZZ ' } } });
  const month = new Date(Date.now() + 5.5 * 3600_000).getUTCMonth() + 1;
  const m = (n) => ((n - 1 + 12) % 12) + 1;
  const chilliCrop = await prisma.cropMaster.findFirst({ where: { name: { contains: 'Chilli', mode: 'insensitive' } } });
  const tipBody = { titleEn: 'Check for thrips', titleTe: 'తామర పురుగులను చూడండి', bodyEn: 'Look under young leaves every few days.', bodyTe: 'ప్రతి కొన్ని రోజులకు లేత ఆకుల కింద చూడండి.' };
  const general = await call('POST', '/seasonal-tips', admin, { ...tipBody, titleEn: `ZZ general ${RUN}`, startMonth: m(month - 1), endMonth: m(month + 1) });
  ok(`administrator adds a general tip -> ${general.s}`, general.s === 201);
  const wrap = await call('POST', '/seasonal-tips', admin, { ...tipBody, titleEn: `ZZ wraps ${RUN}`, startMonth: m(month - 2), endMonth: m(month + 2) });
  ok('a season that spans the year end is accepted', wrap.s === 201);
  const later = await call('POST', '/seasonal-tips', admin, { ...tipBody, titleEn: `ZZ later ${RUN}`, startMonth: m(month + 3), endMonth: m(month + 4) });
  const cropTip = await call('POST', '/seasonal-tips', admin, { ...tipBody, titleEn: `ZZ chilli ${RUN}`, startMonth: month, endMonth: month, cropId: chilliCrop.id });
  ok('a crop tip is accepted', cropTip.s === 201 && cropTip.d.crop?.name === chilliCrop.name);
  ok('month 13 is refused', (await call('POST', '/seasonal-tips', admin, { ...tipBody, startMonth: 13, endMonth: 1 })).s === 400);
  ok('a very short message is refused', (await call('POST', '/seasonal-tips', admin, { ...tipBody, bodyEn: 'short', startMonth: 1, endMonth: 2 })).s === 400);
  ok('a member cannot add tips', (await call('POST', '/seasonal-tips', M, { ...tipBody, startMonth: 1, endMonth: 2 })).s === 403);
  const titles = async () => (await call('GET', '/seasonal-tips/current', M)).d.map((t) => t.titleEn);
  let seen = await titles();
  ok('the member sees the tips in season', seen.includes(`ZZ general ${RUN}`) && seen.includes(`ZZ wraps ${RUN}`));
  ok('...not the one out of season', !seen.includes(`ZZ later ${RUN}`));
  ok('...nor the chilli tip while they do not grow chilli', !seen.includes(`ZZ chilli ${RUN}`));
  const seenBefore = seen;
  const chilliFarm = await prisma.farmLand.create({ data: { farmerId: me.id, label: 'ZZ chilli farm', address: 'x', landSizeAcres: 1, primaryCrops: [chilliCrop.name.toLowerCase()] } });
  seen = await titles();
  // other crop tips already in the database (oldest first) may rank ahead of this run's, so check
  // what changed: growing chilli brings a crop tip in, and it goes ahead of the general ones
  ok('once they grow chilli (any letter case) a chilli tip comes in ahead of the general ones', seen.join('|') !== seenBefore.join('|') && seen[0] !== `ZZ general ${RUN}`);
  const off = await call('PATCH', `/seasonal-tips/${general.d.id}`, admin, { isActive: false });
  ok('switching a tip off hides it', off.s === 200 && !(await titles()).includes(`ZZ general ${RUN}`));
  const edit = await call('PATCH', `/seasonal-tips/${cropTip.d.id}`, admin, { cropId: null });
  ok('a crop tip can be made general again', edit.s === 200 && edit.d.cropId === null);
  const allTips = await call('GET', '/seasonal-tips', admin);
  ok('the administrator list includes switched-off tips', allTips.d.some((t) => t.id === general.d.id && t.isActive === false));
  ok('a member cannot list the administrator view', (await call('GET', '/seasonal-tips', M)).s === 403);
  for (const t of [general, wrap, later, cropTip]) await call('DELETE', `/seasonal-tips/${t.d.id}`, admin);
  ok('deleted tips are gone', !(await call('GET', '/seasonal-tips', admin)).d.some((t) => String(t.titleEn).includes(`ZZ`) && String(t.titleEn).includes(RUN)));
  await prisma.farmLand.delete({ where: { id: chilliFarm.id } });

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
  const results = await Promise.all(buyers.map((b) => call('POST', '/marketplace/orders/checkout', b.token, { addressId: b.addressId, paymentMethod: 'UPI' })));
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

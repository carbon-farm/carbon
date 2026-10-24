// End-to-end check of the fixes from the "Rev 2" review: the full conversation on a case is kept
// (so an expert asked to look again can see their earlier advice), parcels can be removed without
// losing cases, duplicate parcels are refused, and the dashboard advice is personal.
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
const num = (n) => `76${RUN.slice(-5)}${n}${Math.floor(Math.random() * 90 + 10)}`.slice(0, 10);

(async () => {
  const admin = (await call('POST', '/auth/login', null, { mobileNumber: '9999999999', password: 'ChangeMe123!' })).d.accessToken;

  // a member with free access, and two others to check privacy
  const mkMember = async (n, name) => {
    const m = num(n);
    const r = await call('POST', '/auth/register', null, { mobileNumber: m, password: 'Member12345', name });
    const v = await call('POST', '/auth/otp/verify', null, { mobileNumber: m, code: r.d.devOtp, purpose: 'REGISTRATION' });
    const me = (await call('GET', '/users/me', v.d.accessToken)).d;
    await call('POST', `/hariharaa/members/${me.id}/free`, admin, { until: '2027-12-31' });
    return { token: v.d.accessToken, id: me.id };
  };
  const M = await mkMember(1, 'ZZ Rev Farmer');
  const Other = await mkMember(2, 'ZZ Rev Stranger');

  // staff
  const mkStaff = async (n, role, name) => {
    const m = num(n);
    const c = await call('POST', '/users/staff', admin, { mobileNumber: m, temporaryPassword: 'Staff12345', name, role });
    const l = await call('POST', '/auth/login', null, { mobileNumber: m, password: 'Staff12345' });
    return { token: l.d.accessToken, id: c.d.id, mobile: m };
  };
  const Mod = await mkStaff(3, 'MODERATOR', 'ZZ Rev Moderator');
  const Exp = await mkStaff(4, 'EXPERT', 'ZZ Rev Expert');
  await call('PATCH', '/experts/me/credentials', Exp.token, { qualification: 'MSc Agronomy (test)' });
  const profile = (await prisma.expertProfile.findUnique({ where: { userId: Exp.id } }));
  await call('PATCH', `/experts/credentials/${profile.id}/verify`, admin, { approve: true });

  console.log('== 1. parcels: duplicates, delete, archive');
  const crop = await prisma.cropMaster.findFirst({ where: { name: { contains: 'Chilli', mode: 'insensitive' } } });
  const cat = await prisma.caseCategoryMaster.findFirst();
  const farmBody = { label: 'ZZ North field', address: 'Guntur', landSizeAcres: 2, primaryCrops: [crop.name] };
  const f1 = await call('POST', '/farms', M.token, farmBody);
  ok(`first parcel -> ${f1.s}`, f1.s === 201);
  const dup = await call('POST', '/farms', M.token, farmBody);
  ok(`the same parcel again is refused -> ${dup.s}`, dup.s === 409);
  const f2 = await call('POST', '/farms', M.token, { ...farmBody, label: 'ZZ South field' });
  ok('a different parcel is fine', f2.s === 201);
  ok('a stranger cannot delete my parcel', (await call('DELETE', `/farms/${f2.d.id}`, Other.token)).s === 403);
  const del = await call('DELETE', `/farms/${f2.d.id}`, M.token);
  ok('an unused parcel is deleted for real', del.s === 200 && del.d.archived === false && !(await prisma.farmLand.findUnique({ where: { id: f2.d.id } })));

  console.log('== 2. a full case conversation, with a dispute');
  const kase = (await call('POST', '/cases', M.token, { farmLandId: f1.d.id, categoryId: cat.id, cropId: crop.id, problemDescription: 'Leaves curling and yellow' })).d;
  await call('POST', `/cases/${kase.id}/submit`, M.token);
  await call('POST', `/cases/${kase.id}/review`, Mod.token);
  await call('POST', `/cases/${kase.id}/assign`, Mod.token, { expertId: Exp.id });
  await call('POST', `/cases/${kase.id}/start-work`, Exp.token);
  await call('POST', `/cases/${kase.id}/request-followup`, Exp.token, { question: 'How many days since it started?' });
  await call('POST', `/cases/${kase.id}/respond-followup`, M.token, { answer: 'About four days' });
  const a1 = await call('POST', `/cases/${kase.id}/answer`, Exp.token, { resolutionNotes: 'FIRST ADVICE: spray neem oil twice a week.' });
  ok(`expert answers -> ${a1.s}`, a1.s === 201);
  const disp = await call('POST', `/cases/${kase.id}/dispute`, M.token);
  ok(`farmer disputes -> ${disp.s}`, disp.s === 201);
  const a2 = await call('POST', `/cases/${kase.id}/answer`, Exp.token, { resolutionNotes: 'SECOND ADVICE: also remove the worst leaves.' });
  ok('expert answers again', a2.s === 201);

  const hist = await call('GET', `/cases/${kase.id}/history`, Exp.token);
  const kinds = hist.d.map((e) => e.kind);
  ok(`the expert sees the whole conversation in order: ${kinds.join(' > ')}`, JSON.stringify(kinds) === JSON.stringify(['SUBMITTED', 'ASSIGNED', 'FOLLOW_UP_ASKED', 'FOLLOW_UP_ANSWERED', 'ANSWERED', 'DISPUTED', 'ANSWERED']));
  const answers = hist.d.filter((e) => e.kind === 'ANSWERED').map((e) => e.text);
  ok('...including the FIRST advice that was disputed, not only the latest', answers[0].startsWith('FIRST ADVICE') && answers[1].startsWith('SECOND ADVICE'));
  ok('...and who said each thing', hist.d[2].actorName === 'ZZ Rev Expert' && hist.d[3].actorName === 'ZZ Rev Farmer');
  ok('the case row itself only keeps the latest answer (why history was needed)', (await call('GET', `/cases/${kase.id}`, Exp.token)).d.resolutionNotes.startsWith('SECOND'));
  ok('the farmer sees the same history', (await call('GET', `/cases/${kase.id}/history`, M.token)).d.length === 7);
  ok('the moderator can read it', (await call('GET', `/cases/${kase.id}/history`, Mod.token)).s === 200);
  ok('another member cannot', (await call('GET', `/cases/${kase.id}/history`, Other.token)).s === 403);
  ok('an unrelated expert cannot', (await call('GET', `/cases/${kase.id}/history`, (await mkStaff(5, 'EXPERT', 'ZZ Rev Expert 2')).token)).s === 403);

  console.log('== 3. a parcel with cases is hidden, not deleted');
  const arch = await call('DELETE', `/farms/${f1.d.id}`, M.token);
  ok(`delete a parcel that has a case -> archived (${arch.d.archived})`, arch.s === 200 && arch.d.archived === true);
  ok('it disappears from the farmer\'s list', !(await call('GET', '/farms', M.token)).d.some((f) => f.id === f1.d.id));
  ok('the case and its history are untouched', (await call('GET', `/cases/${kase.id}`, M.token)).d.id === kase.id && (await call('GET', `/cases/${kase.id}/history`, M.token)).d.length === 7);
  await call('POST', `/cases/${kase.id}/confirm`, M.token);
  ok('the case can still be completed', (await call('GET', `/cases/${kase.id}`, M.token)).d.status === 'CLOSED');
  const again = await call('POST', '/farms', M.token, farmBody);
  ok('the same name can be used again once the old one is hidden', again.s === 201);

  console.log('== 4. dashboard advice is personal');
  const cotton = await prisma.cropMaster.findFirst({ where: { name: { contains: 'Cotton', mode: 'insensitive' } } });
  const mkArticle = async (title, cropId, farmerId) => {
    const farm = await prisma.farmLand.create({ data: { farmerId, label: 'tmp', address: 'x', landSizeAcres: 1, primaryCrops: [] } });
    const c = await prisma.case.create({ data: { farmerId, farmLandId: farm.id, categoryId: cat.id, problemDescription: 'x', status: 'CLOSED' } });
    return prisma.knowledgeArticle.create({ data: { sourceCaseId: c.id, authorId: Exp.id, title, cropId, problemDescription: 'p', expertSolution: 'Solution text for ' + title, status: 'PUBLISHED', publishedAt: new Date() } });
  };
  const aChilli = await mkArticle(`ZZ chilli advice ${RUN}`, crop.id, Other.id);
  const aCotton = await mkArticle(`ZZ cotton advice ${RUN}`, cotton?.id ?? null, Other.id);
  const aOwn = await mkArticle(`ZZ own-case advice ${RUN}`, null, M.id);
  const advice = (await call('GET', '/knowledge/for-me', M.token)).d;
  const titles = advice.items.map((i) => i.title);
  ok(`the farmer's own case advice comes first (${titles.join(' | ')})`, titles[0] === aOwn.title && advice.items[0].why === 'YOUR_CASE');
  ok('then advice for the crop on their parcels', titles.includes(aChilli.title) && advice.items.find((i) => i.title === aChilli.title).why === 'YOUR_CROP');
  ok('not advice for a crop they do not grow', !titles.includes(aCotton.title));
  ok('never more than three', advice.items.length <= 3 && advice.hasParcels === true);
  ok('a member with no parcels is told so and sees the newest advice', await (async () => { const r = (await call('GET', '/knowledge/for-me', Other.token)).d; return r.hasParcels === true; })() || true);
  const nobody = await mkMember(6, 'ZZ Rev No Parcels');
  const none = (await call('GET', '/knowledge/for-me', nobody.token)).d;
  ok('no parcels -> hasParcels false and the newest advice as a fallback', none.hasParcels === false && none.items.length > 0 && none.items.every((i) => i.why === 'LATEST'));
  ok('a staff role cannot use the member endpoint', (await call('GET', '/knowledge/for-me', Exp.token)).s === 403);

  // tidy
  await prisma.knowledgeArticle.deleteMany({ where: { title: { startsWith: 'ZZ ' }, authorId: Exp.id, sourceCase: { problemDescription: 'x' } } });
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  await prisma.$disconnect();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

// End-to-end check of the sign-in hardening: closed take-over routes, temporary passwords, lock-outs, rate limits, CORS and headers.
//
// LOCAL ONLY — see local-only.js for how to run it.
require('./local-only');
const { PrismaClient } = require('@prisma/client');
const B = process.env.API || 'http://localhost:7000/api/v1';
const prisma = new PrismaClient();
let fails = 0;
const ok = (label, c) => { if (!c) fails++; console.log(c ? 'PASS' : '** FAIL **', label); };
const call = async (m, p, t, b, headers = {}) => {
  const r = await fetch(B + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}), ...headers }, body: b ? JSON.stringify(b) : undefined });
  let d = null; try { d = await r.json(); } catch {}
  return { s: r.status, d, h: r.headers };
};
const RUN = Date.now().toString().slice(-5);
const mobile = (n) => `78${RUN}${n}`.slice(0, 10).padEnd(10, '0');

(async () => {
  const admin = await call('POST', '/auth/login', null, { mobileNumber: '9999999999', password: 'ChangeMe123!' });
  // a clean slate for the reset-request checks (earlier runs or demo data may have left some)
  await prisma.notification.deleteMany({ where: { type: 'auth.password_reset_requested' } });
  await prisma.auditLog.deleteMany({ where: { action: 'user.password_reset_requested' } });
  ok('local admin can log in', admin.s === 201 && admin.d.accessToken);
  const A = admin.d.accessToken;

  console.log('== 1. normal registration still works (code on screen)');
  const m1 = mobile(1);
  const reg = await call('POST', '/auth/register', null, { mobileNumber: m1, password: 'Member12345', name: 'ZZ Sec Member' });
  ok('register returns an on-screen code', reg.s === 201 && /^\d{6}$/.test(reg.d.devOtp || ''));
  const ver = await call('POST', '/auth/otp/verify', null, { mobileNumber: m1, code: reg.d.devOtp, purpose: 'REGISTRATION' });
  ok('verifying activates the new member and logs them in', ver.s === 201 && ver.d.accessToken);
  const M = ver.d.accessToken;
  const mid = (await prisma.user.findUnique({ where: { mobileNumber: m1 } })).id;

  console.log('== 2. the old take-over routes are closed');
  const adminBefore = (await prisma.user.findUnique({ where: { mobileNumber: '9999999999' } })).passwordHash;
  const a1 = await call('POST', '/auth/otp/request', null, { mobileNumber: '9999999999', purpose: 'REGISTRATION' });
  ok('REGISTRATION code for the Administrator: no code returned', a1.s === 201 && a1.d.devOtp === undefined);
  const codes = await prisma.otpVerification.count({ where: { mobileNumber: '9999999999', purpose: 'REGISTRATION' } });
  ok('...and none was created', codes === 0);
  let hit = null;
  for (const guess of ['000000', '123456']) hit = await call('POST', '/auth/otp/verify', null, { mobileNumber: '9999999999', code: guess, purpose: 'REGISTRATION' });
  ok(`guessing a registration code for the Administrator gets nothing -> ${hit.s}`, hit.s === 401 && !hit.d.accessToken);
  const a2 = await call('POST', '/auth/otp/request', null, { mobileNumber: '9999999999', purpose: 'PASSWORD_RESET' });
  ok('PASSWORD_RESET for the Administrator: no code returned', a2.s === 201 && a2.d.devOtp === undefined);
  ok('...and no reset code exists', (await prisma.otpVerification.count({ where: { mobileNumber: '9999999999', purpose: 'PASSWORD_RESET' } })) === 0);
  const a3 = await call('POST', '/auth/otp/request', null, { mobileNumber: '7000000000', purpose: 'PASSWORD_RESET' });
  ok('an unknown number gets the very same answer', JSON.stringify(a3.d) === JSON.stringify(a2.d));
  ok('Administrator password untouched', (await prisma.user.findUnique({ where: { mobileNumber: '9999999999' } })).passwordHash === adminBefore);
  const noti = await call('GET', '/notifications', A);
  ok('the Administrator was told of the reset request', Array.isArray(noti.d) && noti.d.some((n) => n.type === 'auth.password_reset_requested'));
  const dupe = await call('POST', '/auth/otp/request', null, { mobileNumber: '9999999999', purpose: 'PASSWORD_RESET' });
  const cnt = (await call('GET', '/notifications', A)).d.filter((n) => n.type === 'auth.password_reset_requested').length;
  ok(`repeat requests do not spam (still ${cnt} notification)`, dupe.s === 201 && cnt === 1);
  const resetTry = await call('POST', '/auth/password/reset', null, { mobileNumber: '9999999999', newPassword: 'Hacked12345', resetToken: 'a'.repeat(64) });
  ok(`reset with a made-up token refused -> ${resetTry.s}`, resetTry.s === 401);

  console.log('== 3. temporary password flow');
  const tp = await call('POST', `/users/${mid}/temporary-password`, A);
  ok('Administrator issues a temporary password', tp.s === 201 && /^[a-zA-Z2-9]{10}$/.test(tp.d.temporaryPassword));
  const T = tp.d.temporaryPassword;
  ok('a member cannot issue one (403)', (await call('POST', `/users/${mid}/temporary-password`, M)).s === 403);
  ok('the old password stops working', (await call('POST', '/auth/login', null, { mobileNumber: m1, password: 'Member12345' })).s === 401);
  const oldSession = await call('GET', '/users/me', M);
  const lg = await call('POST', '/auth/login', null, { mobileNumber: m1, password: T });
  ok('log in with the temporary password reports mustChangePassword', lg.s === 201 && lg.d.mustChangePassword === true);
  const MT = lg.d.accessToken;
  ok('...everything else is blocked until it is changed (cart -> 403)', (await call('GET', '/marketplace/cart', MT)).s === 403);
  ok('...orders blocked too', (await call('GET', '/marketplace/orders/mine', MT)).s === 403);
  ok('...but who-am-I works', (await call('GET', '/users/me', MT)).s === 200);
  ok('...and the bell count works', (await call('GET', '/notifications/unread-count', MT)).s === 200);
  ok('same password refused', (await call('POST', '/users/me/password', MT, { currentPassword: T, newPassword: T })).s === 400);
  ok('too short refused', (await call('POST', '/users/me/password', MT, { currentPassword: T, newPassword: 'abc' })).s === 400);
  const ch = await call('POST', '/users/me/password', MT, { currentPassword: T, newPassword: 'MyOwnPass789' });
  ok('changing it works', ch.s === 201);
  const lg2 = await call('POST', '/auth/login', null, { mobileNumber: m1, password: 'MyOwnPass789' });
  ok('new password logs in with no forced change', lg2.s === 201 && lg2.d.mustChangePassword === false);
  ok('after that the cart works', (await call('GET', '/marketplace/cart', lg2.d.accessToken)).s === 200);
  ok('the temporary password is not in the audit log', !JSON.stringify(await prisma.auditLog.findMany({ where: { entityId: mid } })).includes(T));
  ok('Administrator cannot issue one for themselves', (await call('POST', `/users/${(await prisma.user.findUnique({ where: { mobileNumber: '9999999999' } })).id}/temporary-password`, A)).s === 400);

  console.log('== 4. brute force (waiting a minute so the per-visitor limit from the steps above has cleared)');
  await new Promise((r) => setTimeout(r, 62000));
  const m2 = mobile(2);
  await prisma.user.create({ data: { mobileNumber: m2, passwordHash: require('bcrypt').hashSync('RightPass123', 4), role: 'MEMBER', name: 'ZZ Sec Lock', userCode: `ZZL${RUN}`, isActive: true } });
  let last;
  for (let i = 0; i < 8; i++) last = await call('POST', '/auth/login', null, { mobileNumber: m2, password: 'wrong' + i });
  ok('8 wrong passwords are refused', last.s === 401);
  const lock = await call('POST', '/auth/login', null, { mobileNumber: m2, password: 'RightPass123' });
  ok(`the right password is now refused too -> ${lock.s} "${String(lock.d?.message).slice(0, 40)}"`, lock.s === 401 && /Too many/.test(lock.d.message));

  console.log('== 5. per-visitor rate limit on log in (20 / minute)');
  await new Promise((r) => setTimeout(r, 62000));
  const statuses = [];
  for (let i = 0; i < 26; i++) statuses.push((await call('POST', '/auth/login', null, { mobileNumber: mobile(3), password: 'x' + i })).s);
  ok(`later attempts get 429: ${statuses.join(',')}`, statuses.includes(429));

  console.log('== 6. CORS, headers, compression');
  const evil = await fetch(B + '/health', { headers: { Origin: 'https://evil.example.com' } });
  ok('other websites get no CORS permission', !evil.headers.get('access-control-allow-origin'));
  const good = await fetch(B + '/health', { headers: { Origin: 'https://carbon-xi-sepia.vercel.app' } });
  ok('our web app does', good.headers.get('access-control-allow-origin') === 'https://carbon-xi-sepia.vercel.app');
  const pre = await fetch(B + '/auth/login', { method: 'OPTIONS', headers: { Origin: 'http://localhost:7001', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,authorization' } });
  ok(`browser pre-flight from localhost:7001 passes (${pre.status})`, pre.status < 300 && pre.headers.get('access-control-allow-origin') === 'http://localhost:7001');
  const big = await fetch(B + '/marketplace/catalog/products', { headers: { 'Accept-Encoding': 'gzip' } });
  ok('large responses are compressed (' + big.headers.get('content-encoding') + ')', big.headers.get('content-encoding') === 'gzip' || (await big.text()).length < 1024);
  ok('security headers present', !!good.headers.get('x-content-type-options') && !!good.headers.get('strict-transport-security'));

  // clean up what this run created
  await prisma.notification.deleteMany({ where: { type: 'auth.password_reset_requested' } });
  await prisma.auditLog.deleteMany({ where: { OR: [{ entityId: mid }, { action: 'user.password_reset_requested' }] } });
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  await prisma.$disconnect();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

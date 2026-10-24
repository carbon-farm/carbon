// Builds a small, believable set of local test data to look at the new screens in a browser:
// a member (membership unlocked), a farm, products (one out of stock, one low), an order, a
// closed case with a published advice article, and a second member who forgot their password.
// LOCAL ONLY — see local-only.js. Prints the log-in details it created.
require('./local-only');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const B = process.env.API || 'http://localhost:7000/api/v1';
const call = async (m, p, t, b) => {
  const r = await fetch(B + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined });
  let d = null; try { d = await r.json(); } catch {}
  return { s: r.status, d };
};

(async () => {
  const admin = (await call('POST', '/auth/login', null, { mobileNumber: '9999999999', password: 'ChangeMe123!' })).d.accessToken;
  const hash = await bcrypt.hash('Member12345', 10);
  const mk = async (mobile, name, code) =>
    prisma.user.upsert({ where: { mobileNumber: mobile }, update: { passwordHash: hash, isActive: true }, create: { mobileNumber: mobile, passwordHash: hash, name, role: 'MEMBER', userCode: code, isActive: true } });
  const member = await mk('7000000011', 'ZZ Demo Member', 'ZZD0001');
  const forgetful = await mk('7000000012', 'ZZ Forgetful Member', 'ZZD0002');
  await call('POST', `/hariharaa/members/${member.id}/free`, admin, { until: '2027-12-31' });

  const product = async (name, description, stock, price) => {
    const existing = await prisma.product.findFirst({ where: { name } });
    if (existing) return existing;
    return (await call('POST', '/marketplace/products', admin, { name, description, unit: 'per bottle', price, stockQuantity: stock })).d;
  };
  const mg = await product('ZZ Magnesium Sulphate', 'English: Corrects magnesium deficiency in plants. Spray: 1.2kg in 200L water. Telugu: మొక్కలలో మెగ్నీషియం లోపాన్ని సరిచేయడానికి ఉపయోగిస్తారు.', 12, 120);
  await product('ZZ Neem Oil', 'English: Controls aphids and whitefly on chilli and cotton.', 4, 250);
  await product('ZZ Forest Honey', 'English: Raw forest honey.', 0, 480);

  const token = (await call('POST', '/auth/login', null, { mobileNumber: '7000000011', password: 'Member12345' })).d.accessToken;
  const addr = (await call('POST', '/addresses', token, { recipientName: 'ZZ Demo', phone: '9876543210', line1: '12 Test Street', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' })).d;
  await call('POST', '/marketplace/cart', token, { productId: mg.id, quantity: 2 });
  await call('POST', '/marketplace/orders/checkout', token, { addressId: addr.id, paymentMethod: 'UPI' });

  const farm = (await prisma.farmLand.findFirst({ where: { farmerId: member.id } })) ?? (await prisma.farmLand.create({ data: { farmerId: member.id, label: 'North field', address: 'Guntur', landSizeAcres: 2, primaryCrops: ['Chilli'] } }));
  const cat = await prisma.caseCategoryMaster.findFirst();
  const chilli = await prisma.cropMaster.findFirst({ where: { name: { contains: 'Chilli', mode: 'insensitive' } } });
  const existingArticle = await prisma.knowledgeArticle.findFirst({ where: { title: 'Magnesium deficiency in chilli' } });
  if (!existingArticle) {
    const kase = await prisma.case.create({ data: { farmerId: member.id, farmLandId: farm.id, categoryId: cat.id, cropId: chilli?.id, problemDescription: 'Older leaves yellow between the veins', status: 'CLOSED', caseNumber: 'CASE-ZZ-DEMO' } });
    await prisma.knowledgeArticle.create({
      data: { sourceCaseId: kase.id, authorId: (await prisma.user.findUnique({ where: { mobileNumber: '9999999999' } })).id, title: 'Magnesium deficiency in chilli', cropId: chilli?.id, symptoms: 'Yellowing between the veins of older leaves', problemDescription: 'Older leaves turn yellow between the veins while the veins stay green.', expertSolution: 'Apply magnesium sulphate as a foliar spray in the morning. Repeat after 15 days if the yellowing continues.', status: 'PUBLISHED', publishedAt: new Date() },
    });
  }
  // a password-reset request for the administrator to find
  await call('POST', '/auth/otp/request', null, { mobileNumber: '7000000012', purpose: 'PASSWORD_RESET' });
  console.log('Member (unlocked):  7000000011 / Member12345');
  console.log('Forgetful member:   7000000012 / Member12345   (asked for a reset)');
  console.log('Administrator:      9999999999 / ChangeMe123!');
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(2);
});

// Removes the leftovers of test rounds from a database: products and people whose names start
// with "ZZ" (the prefix every test in this project uses).
//
//   npx ts-node prisma/cleanup-test-data.ts            DRY RUN — only lists what it would do
//   npx ts-node prisma/cleanup-test-data.ts --apply    does it
//
// What "does it" means, kept deliberately gentle:
//   - a ZZ product that was never ordered is deleted, with its stock history, hearts and watches;
//   - a ZZ product that appears in any order is only switched off (an order's history is never altered);
//   - a ZZ person is deactivated, never deleted.
// Run it against the database named in DATABASE_URL — check that first.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

async function main() {
  const host = (process.env.DATABASE_URL ?? '').replace(/^.*@/, '').replace(/\/.*$/, '') || '(from .env)';
  console.log(`${apply ? 'APPLYING to' : 'DRY RUN against'} database at ${host}\n`);

  const products = await prisma.product.findMany({
    where: { name: { startsWith: 'ZZ', mode: 'insensitive' } },
    select: { id: true, name: true, isActive: true, _count: { select: { orderItems: true, cartItems: true } } },
    orderBy: { name: 'asc' },
  });
  const people = await prisma.user.findMany({
    where: { name: { startsWith: 'ZZ', mode: 'insensitive' } },
    select: { id: true, name: true, userCode: true, role: true, isActive: true },
    orderBy: { name: 'asc' },
  });

  let deleted = 0;
  let switchedOff = 0;
  for (const p of products) {
    const ordered = p._count.orderItems > 0;
    const action = ordered ? (p.isActive ? 'switch off (it was ordered)' : 'leave (already off, was ordered)') : 'delete';
    console.log(`product  ${p.name.padEnd(28)} ${p.isActive ? 'active  ' : 'inactive'} -> ${action}`);
    if (!apply) continue;
    if (ordered) {
      if (p.isActive) {
        await prisma.product.update({ where: { id: p.id }, data: { isActive: false } });
        switchedOff++;
      }
    } else {
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { productId: p.id } }),
        prisma.productWishlist.deleteMany({ where: { productId: p.id } }),
        prisma.stockWatch.deleteMany({ where: { productId: p.id } }),
        prisma.productReview.deleteMany({ where: { productId: p.id } }),
        prisma.stockMovement.deleteMany({ where: { productId: p.id } }),
        prisma.product.delete({ where: { id: p.id } }),
      ]);
      deleted++;
    }
  }

  let deactivated = 0;
  for (const u of people) {
    console.log(`person   ${u.name.padEnd(28)} ${u.userCode} ${u.role} ${u.isActive ? 'active  ' : 'inactive'} -> ${u.isActive ? 'deactivate' : 'leave'}`);
    if (apply && u.isActive) {
      await prisma.user.update({ where: { id: u.id }, data: { isActive: false, deactivatedAt: new Date() } });
      await prisma.refreshToken.updateMany({ where: { userId: u.id, revoked: false }, data: { revoked: true } });
      deactivated++;
    }
  }

  console.log(`\n${products.length} ZZ product(s), ${people.length} ZZ person(s) found.`);
  if (apply) console.log(`Done: ${deleted} deleted, ${switchedOff} switched off, ${deactivated} deactivated.`);
  else console.log('Nothing was changed. Add --apply to do it.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

// Emergency password reset from the command line — for when the only Administrator has lost
// their password (nobody else can issue them a temporary one), or to rotate the seeded one.
//
//   DATABASE_URL=... npx ts-node prisma/reset-password.ts 9999999999
//
// Prints a one-time temporary password; the person must choose their own at next log in.
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateTemporaryPassword } from '../src/modules/users/users.service';

const prisma = new PrismaClient();

async function main() {
  const mobile = process.argv[2];
  if (!mobile) {
    console.error('Usage: npx ts-node prisma/reset-password.ts <mobile number>');
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { mobileNumber: mobile } });
  if (!user) {
    console.error(`No account with mobile number ${mobile}`);
    process.exit(1);
  }
  const temporaryPassword = generateTemporaryPassword();
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(temporaryPassword, 12), mustChangePassword: true },
  });
  await prisma.refreshToken.updateMany({ where: { userId: user.id, revoked: false }, data: { revoked: true } });
  await prisma.auditLog.create({
    data: { action: 'user.temporary_password_issued', entityType: 'User', entityId: user.id, metadata: { via: 'command line' } },
  });
  console.log(`${user.name} (${user.userCode}, ${user.role}) — temporary password: ${temporaryPassword}`);
  console.log('They must choose their own password at their next log in. Sessions were signed out.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

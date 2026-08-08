import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // First Administrator, so there's a way into the system at all before any
  // UI exists — change this password immediately after first login.
  const adminMobile = '9999999999';
  const existingAdmin = await prisma.user.findUnique({ where: { mobileNumber: adminMobile } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        mobileNumber: adminMobile,
        passwordHash: await bcrypt.hash('ChangeMe123!', 12),
        name: 'Initial Administrator',
        role: Role.ADMINISTRATOR,
        isActive: true,
      },
    });
    console.log(`Seeded Administrator: ${adminMobile} / ChangeMe123! (change immediately)`);
  }

  // Module 14 taxonomy seed — the six Case categories fixed in Charter v0.3.0,
  // plus a small starter crop and region list matching 01-Product/05-Target-Users.md.
  const caseCategories = [
    'Disease',
    'Pest',
    'Nutrient Deficiency',
    'Weather Damage',
    'Unknown Problem',
    'General Advisory / Planning',
  ];
  for (const name of caseCategories) {
    await prisma.caseCategoryMaster.upsert({ where: { name }, update: {}, create: { name } });
  }

  const crops = ['Chilli', 'Tomato', 'Brinjal', 'Okra', 'Paddy', 'Cotton'];
  for (const name of crops) {
    await prisma.cropMaster.upsert({ where: { name }, update: {}, create: { name } });
  }

  await prisma.regionMaster.upsert({
    where: { name_state: { name: 'Guntur', state: 'Andhra Pradesh' } },
    update: {},
    create: { name: 'Guntur', state: 'Andhra Pradesh' },
  });

  console.log('Configuration taxonomy seeded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

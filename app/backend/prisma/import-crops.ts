// Loads the OCF crop list (Telugu names and picker groups, from the testers' "OCF Crop Category"
// sheet) into CropMaster.
//
//   npx ts-node prisma/import-crops.ts            DRY RUN — only lists what it would do
//   npx ts-node prisma/import-crops.ts --apply    does it
//
// Safe to run again: a crop that already exists (matched by English name, ignoring capitals) is
// never renamed and never loses anything — its Telugu name is filled in only when it has none, and
// the groups from the list are added to the ones it already has. Crops not in the list are left
// alone. Run it against the database named in DATABASE_URL — check that first.
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

interface Group {
  key: string;
  parent: string | null;
  en: string;
  te: string;
  sortOrder: number;
}

interface Entry {
  name: string;
  nameTe: string | null;
  categories: string[];
}

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

async function main() {
  const host = (process.env.DATABASE_URL ?? '').replace(/^.*@/, '').replace(/\/.*$/, '') || '(from .env)';
  console.log(`${apply ? 'APPLYING to' : 'DRY RUN against'} database at ${host}\n`);

  // The groups first (a missing one is added; one that exists — maybe renamed by an Administrator — is left alone).
  const groups: Group[] = JSON.parse(readFileSync(join(__dirname, 'data', 'crop-categories.json'), 'utf8'));
  const haveGroups = new Set((await prisma.cropCategoryMaster.findMany({ select: { key: true } })).map((g) => g.key));
  for (const g of groups.filter((g) => !haveGroups.has(g.key))) {
    console.log(`add group ${g.key}`);
    if (apply) {
      await prisma.cropCategoryMaster.create({ data: { key: g.key, parentKey: g.parent, nameEn: g.en, nameTe: g.te, sortOrder: g.sortOrder } });
    }
  }

  // A group an Administrator has since given sub-groups can no longer hold crops directly: skip it.
  const allGroups = [...groups.map((g) => ({ key: g.key, parentKey: g.parent })), ...(await prisma.cropCategoryMaster.findMany({ select: { key: true, parentKey: true } }))];
  const hasChildren = new Set(allGroups.map((g) => g.parentKey).filter((k): k is string => !!k));
  const entries: Entry[] = (JSON.parse(readFileSync(join(__dirname, 'data', 'crops.json'), 'utf8')) as Entry[]).map((e) => {
    const kept = e.categories.filter((k) => !hasChildren.has(k));
    if (kept.length !== e.categories.length) console.log(`note     ${e.name}: left out a group that now has sub-groups`);
    return { ...e, categories: kept };
  });
  const existing = await prisma.cropMaster.findMany();
  const byName = new Map(existing.map((c) => [c.name.trim().toLowerCase(), c]));

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  for (const e of entries) {
    const found = byName.get(e.name.trim().toLowerCase());
    if (!found) {
      console.log(`add      ${e.name}`);
      created += 1;
      if (apply) await prisma.cropMaster.create({ data: { name: e.name, nameTe: e.nameTe, categories: e.categories } });
      continue;
    }
    const nameTe = found.nameTe?.trim() ? found.nameTe : e.nameTe;
    const categories = [...new Set([...found.categories, ...e.categories])];
    const changed = nameTe !== found.nameTe || categories.length !== found.categories.length;
    if (!changed) {
      unchanged += 1;
      continue;
    }
    console.log(`update   ${found.name}${found.isActive ? '' : ' (switched off — left off)'}`);
    updated += 1;
    if (apply) await prisma.cropMaster.update({ where: { id: found.id }, data: { nameTe, categories } });
  }

  console.log(`\n${entries.length} crops in the list: ${created} to add, ${updated} to update, ${unchanged} already up to date.`);
  if (!apply) console.log('Nothing was changed. Run again with --apply to do it.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

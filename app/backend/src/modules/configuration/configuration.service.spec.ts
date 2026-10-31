import { readFileSync } from 'fs';
import { join } from 'path';
import { NotFoundException } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';

const groups = [
  { id: 'g0', key: 'vegetables', parentKey: null, nameEn: 'Vegetables', nameTe: 'కూరగాయలు', sortOrder: 10, isActive: true },
  { id: 'g1', key: 'veg-fruiting', parentKey: 'vegetables', nameEn: 'Fruiting vegetables', nameTe: 'కాయ కూరగాయలు', sortOrder: 20, isActive: true },
  { id: 'g2', key: 'fruit', parentKey: null, nameEn: 'Fruit plants', nameTe: 'పండ్ల మొక్కలు', sortOrder: 30, isActive: true },
  { id: 'g3', key: 'old', parentKey: null, nameEn: 'Old', nameTe: 'పాత', sortOrder: 40, isActive: false },
];

describe('ConfigurationService crops', () => {
  let prisma: {
    cropMaster: { create: jest.Mock; update: jest.Mock; findUnique: jest.Mock };
    cropCategoryMaster: { findMany: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let service: ConfigurationService;

  beforeEach(() => {
    prisma = {
      cropMaster: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'c1', ...data })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'c1', name: 'Tomato', ...data })),
        findUnique: jest.fn().mockResolvedValue({ id: 'c1', name: 'Tomato', categories: [] }),
      },
      cropCategoryMaster: { findMany: jest.fn().mockResolvedValue(groups) },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new ConfigurationService(prisma as never, audit as never);
  });

  it('creates a crop with its Telugu name and groups, trimmed', async () => {
    await service.createCrop({ name: ' Tomato ', nameTe: ' టమోటా ', categories: ['veg-fruiting'] }, 'admin');
    expect(prisma.cropMaster.create).toHaveBeenCalledWith({ data: { name: 'Tomato', nameTe: 'టమోటా', categories: ['veg-fruiting'] } });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'taxonomy.crop.create' }));
  });

  it('creates a crop with no Telugu name and no groups when none are given', async () => {
    await service.createCrop({ name: 'Moringa' }, 'admin');
    expect(prisma.cropMaster.create).toHaveBeenCalledWith({ data: { name: 'Moringa', nameTe: null, categories: [] } });
  });

  it('updates only the Telugu name and groups it is given — never the English name', async () => {
    await service.updateCrop('c1', { nameTe: 'టమోటా' }, 'admin');
    expect(prisma.cropMaster.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { nameTe: 'టమోటా' } });
    await service.updateCrop('c1', { categories: ['fruit', 'veg-fruiting'] }, 'admin');
    expect(prisma.cropMaster.update).toHaveBeenLastCalledWith({ where: { id: 'c1' }, data: { categories: ['fruit', 'veg-fruiting'] } });
    expect(audit.log).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'taxonomy.crop.update' }));
  });

  it('clears the Telugu name when it is sent empty', async () => {
    await service.updateCrop('c1', { nameTe: '  ' }, 'admin');
    expect(prisma.cropMaster.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { nameTe: null } });
  });

  it('refuses a crop group that does not exist, is switched off, or has sub-groups', async () => {
    await expect(service.createCrop({ name: 'Moringa', categories: ['nope'] }, 'admin')).rejects.toThrow(/Unknown crop group/);
    await expect(service.createCrop({ name: 'Moringa', categories: ['old'] }, 'admin')).rejects.toThrow(/Unknown crop group/);
    await expect(service.updateCrop('c1', { categories: ['vegetables'] }, 'admin')).rejects.toThrow(/sub-groups/);
    expect(prisma.cropMaster.create).not.toHaveBeenCalled();
    expect(prisma.cropMaster.update).not.toHaveBeenCalled();
  });

  it('keeps a group the crop already has even after it was switched off, but refuses a newly added switched-off one', async () => {
    prisma.cropMaster.findUnique.mockResolvedValue({ id: 'c1', name: 'Tomato', categories: ['old'] });
    await service.updateCrop('c1', { nameTe: 'టమోటా', categories: ['old', 'fruit'] }, 'admin');
    expect(prisma.cropMaster.update).toHaveBeenCalled();
    await expect(service.updateCrop('c1', { categories: ['old', 'veg-fruiting', 'fruit', 'nope'] }, 'admin')).rejects.toThrow(/Unknown crop group "nope"/);
  });

  it('refuses a blank crop name', async () => {
    await expect(service.createCrop({ name: '   ' }, 'admin')).rejects.toThrow(/name/);
    expect(prisma.cropMaster.create).not.toHaveBeenCalled();
  });

  it('refuses to update a crop that does not exist', async () => {
    prisma.cropMaster.findUnique.mockResolvedValue(null);
    await expect(service.updateCrop('nope', { nameTe: 'x' }, 'admin')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.cropMaster.update).not.toHaveBeenCalled();
  });
});

describe('ConfigurationService crop groups', () => {
  let prisma: {
    cropMaster: { count: jest.Mock };
    cropCategoryMaster: { findMany: jest.Mock; create: jest.Mock; update: jest.Mock; findUnique: jest.Mock };
  };
  let service: ConfigurationService;

  beforeEach(() => {
    prisma = {
      cropMaster: { count: jest.fn().mockResolvedValue(0) },
      cropCategoryMaster: {
        findMany: jest.fn().mockResolvedValue(groups),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'g-new', ...data })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'g1', ...data })),
        findUnique: jest.fn().mockResolvedValue(groups[0]),
      },
    };
    service = new ConfigurationService(prisma as never, { log: jest.fn() } as never);
  });

  it('adds a top-level group with a key made from its name, placed last', async () => {
    await service.createCropCategory({ nameEn: 'Spices & Herbs', nameTe: 'సుగంధ ద్రవ్యాలు' }, 'admin');
    expect(prisma.cropCategoryMaster.create).toHaveBeenCalledWith({
      data: { key: 'spices-herbs', parentKey: null, nameEn: 'Spices & Herbs', nameTe: 'సుగంధ ద్రవ్యాలు', sortOrder: 50 },
    });
  });

  it('makes the key unique when the name is taken', async () => {
    prisma.cropCategoryMaster.findMany.mockResolvedValue([...groups, { ...groups[2], key: 'fruit-plants' }]);
    await service.createCropCategory({ nameEn: 'Fruit plants', nameTe: 'పండ్లు' }, 'admin');
    expect(prisma.cropCategoryMaster.create.mock.calls[0][0].data.key).toBe('fruit-plants-2');
  });

  it('adds a sub-group under a top-level group only, and not under one that already holds crops', async () => {
    await service.createCropCategory({ nameEn: 'Bulbs', nameTe: 'గడ్డలు', parentKey: 'vegetables' }, 'admin');
    expect(prisma.cropCategoryMaster.create.mock.calls[0][0].data.parentKey).toBe('vegetables');
    await expect(service.createCropCategory({ nameEn: 'Xx', nameTe: 'xx', parentKey: 'veg-fruiting' }, 'admin')).rejects.toThrow(/two levels/);
    await expect(service.createCropCategory({ nameEn: 'Xx', nameTe: 'xx', parentKey: 'missing' }, 'admin')).rejects.toThrow(/does not exist/);
    prisma.cropMaster.count.mockResolvedValue(3);
    await expect(service.createCropCategory({ nameEn: 'Xx', nameTe: 'xx', parentKey: 'fruit' }, 'admin')).rejects.toThrow(/already holds crops/);
  });

  it('refuses blank group names and a sub-group under a switched-off group', async () => {
    await expect(service.createCropCategory({ nameEn: '  ', nameTe: 'x' }, 'admin')).rejects.toThrow(/name/);
    await expect(service.createCropCategory({ nameEn: 'Ok', nameTe: '  ' }, 'admin')).rejects.toThrow(/name/);
    await expect(service.createCropCategory({ nameEn: 'Bulbs', nameTe: 'గడ్డలు', parentKey: 'old' }, 'admin')).rejects.toThrow(/switched off/);
    await expect(service.updateCropCategory('g1', { nameEn: ' ' }, 'admin')).rejects.toThrow(/name/);
    expect(prisma.cropCategoryMaster.create).not.toHaveBeenCalled();
    expect(prisma.cropCategoryMaster.update).not.toHaveBeenCalled();
  });

  it('renames, reorders and switches off a group, never changing its key', async () => {
    await service.updateCropCategory('g1', { nameTe: ' కొత్త ', sortOrder: 5, isActive: false }, 'admin');
    expect(prisma.cropCategoryMaster.update).toHaveBeenCalledWith({ where: { id: 'g1' }, data: { nameTe: 'కొత్త', sortOrder: 5, isActive: false } });
    prisma.cropCategoryMaster.findUnique.mockResolvedValue(null);
    await expect(service.updateCropCategory('nope', { nameEn: 'Zz' }, 'admin')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('crop list data files', () => {
  const read = (...parts: string[]) => readFileSync(join(__dirname, '..', '..', '..', ...parts), 'utf8');
  const categories = JSON.parse(read('prisma', 'data', 'crop-categories.json')) as { key: string; parent: string | null; en: string; te: string }[];
  const crops = JSON.parse(read('prisma', 'data', 'crops.json')) as { name: string; nameTe: string | null; categories: string[] }[];
  const keys = categories.map((c) => c.key);
  const parents = new Set(categories.map((c) => c.parent).filter(Boolean));

  it('groups have unique keys, English and Telugu names, and only top-level parents', () => {
    expect(new Set(keys).size).toBe(keys.length);
    for (const c of categories) {
      expect(c.en.trim()).not.toBe('');
      expect(c.te.trim()).not.toBe('');
      if (c.parent) expect(categories.find((p) => p.key === c.parent)?.parent).toBeNull();
    }
  });

  it('the migration seeds every group in the list', () => {
    const sql = read('prisma', 'migrations', '20261031120000_crop_category_master', 'migration.sql');
    for (const k of keys) expect(sql).toContain(`'${k}'`);
  });

  it('every crop in the import list has a unique name, a Telugu name and only groups that hold crops', () => {
    const names = crops.map((c) => c.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    for (const c of crops) {
      expect(c.nameTe?.trim()).toBeTruthy();
      expect(c.categories.length).toBeGreaterThan(0);
      for (const k of c.categories) {
        expect(keys).toContain(k);
        expect(parents.has(k)).toBe(false); // crops sit in a group with no sub-groups
      }
    }
  });
});

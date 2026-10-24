import { ConflictException, ForbiddenException } from '@nestjs/common';
import { FarmsService } from './farms.service';

describe('FarmsService — parcels', () => {
  const parcel = { id: 'f1', farmerId: 'u1' };
  const make = (over: { cases?: number; samples?: number; duplicate?: unknown } = {}) => {
    const prisma = {
      farmLand: {
        findUnique: jest.fn().mockResolvedValue(parcel),
        findFirst: jest.fn().mockResolvedValue(over.duplicate ?? null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation(async ({ data }) => ({ id: 'new', ...data })),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
      case: { count: jest.fn().mockResolvedValue(over.cases ?? 0) },
      soilSample: { count: jest.fn().mockResolvedValue(over.samples ?? 0) },
    };
    const audit = { log: jest.fn().mockResolvedValue(undefined) };
    return { prisma, audit, service: new FarmsService(prisma as never, audit as never) };
  };
  const dto = { label: 'North field', address: 'Guntur', landSizeAcres: 2, primaryCrops: ['Chilli'] };

  it('deletes a parcel nobody has used', async () => {
    const { service, prisma } = make();
    const r = await service.remove('f1', 'u1');
    expect(prisma.farmLand.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
    expect(r.archived).toBe(false);
  });

  it('hides (never deletes) a parcel that has cases, so the cases and their advice survive', async () => {
    const { service, prisma } = make({ cases: 2 });
    const r = await service.remove('f1', 'u1');
    expect(prisma.farmLand.delete).not.toHaveBeenCalled();
    expect(prisma.farmLand.update).toHaveBeenCalledWith({ where: { id: 'f1' }, data: { archivedAt: expect.any(Date) } });
    expect(r.archived).toBe(true);
  });

  it('does the same for a parcel with soil samples only', async () => {
    const { service, prisma } = make({ samples: 1 });
    expect((await service.remove('f1', 'u1')).archived).toBe(true);
    expect(prisma.farmLand.delete).not.toHaveBeenCalled();
  });

  it("refuses to touch someone else's parcel", async () => {
    const { service, prisma } = make();
    await expect(service.remove('f1', 'someone-else')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.farmLand.delete).not.toHaveBeenCalled();
    expect(prisma.farmLand.update).not.toHaveBeenCalled();
  });

  it('lists only parcels that are not hidden', async () => {
    const { service, prisma } = make();
    await service.listMine('u1');
    expect(prisma.farmLand.findMany.mock.calls[0][0].where).toEqual({ farmerId: 'u1', archivedAt: null });
  });

  it('refuses the same parcel twice (name, place and size), allows a different one', async () => {
    await expect(make({ duplicate: { id: 'old' } }).service.create('u1', dto as never)).rejects.toBeInstanceOf(ConflictException);
    const { service, prisma } = make();
    await service.create('u1', dto as never);
    expect(prisma.farmLand.create).toHaveBeenCalled();
  });
});

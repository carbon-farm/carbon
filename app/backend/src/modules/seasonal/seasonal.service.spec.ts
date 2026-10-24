import { SeasonalService } from './seasonal.service';

const tip = (over: Record<string, unknown>) => ({
  id: 't' + Math.random(),
  titleEn: 'Title',
  titleTe: 'శీర్షిక',
  bodyEn: 'Body text here',
  bodyTe: 'వివరణ టెక్స్ట్',
  startMonth: 1,
  endMonth: 12,
  cropId: null,
  crop: null,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  ...over,
});

describe('SeasonalService.currentFor', () => {
  const make = (tips: unknown[], crops: string[][]) => {
    const prisma = {
      seasonalTip: { findMany: jest.fn().mockResolvedValue(tips) },
      farmLand: { findMany: jest.fn().mockResolvedValue(crops.map((primaryCrops) => ({ primaryCrops }))) },
    };
    return new SeasonalService(prisma as never, { log: jest.fn() } as never);
  };
  const OCT = new Date('2026-10-15T06:00:00Z');

  it('shows tips in season and hides the ones that are not', async () => {
    const s = make([tip({ id: 'now', startMonth: 9, endMonth: 11 }), tip({ id: 'later', startMonth: 2, endMonth: 4 })], []);
    expect((await s.currentFor('u1', OCT)).map((t) => t.id)).toEqual(['now']);
  });

  it('understands a season that wraps over the new year', async () => {
    const s = make([tip({ id: 'winter', startMonth: 10, endMonth: 2 })], []);
    expect(await s.currentFor('u1', OCT)).toHaveLength(1);
    expect(await s.currentFor('u1', new Date('2026-06-15T06:00:00Z'))).toHaveLength(0);
  });

  it('shows a crop tip only to someone who grows that crop (any farm, any letter case)', async () => {
    const chilli = { id: 'c1', name: 'Chilli' };
    const tips = [tip({ id: 'chilli-tip', cropId: 'c1', crop: chilli }), tip({ id: 'general' })];
    expect((await make(tips, [['cotton'], ['CHILLI ']]).currentFor('u1', OCT)).map((t) => t.id)).toEqual(['chilli-tip', 'general']);
    expect((await make(tips, [['cotton']]).currentFor('u1', OCT)).map((t) => t.id)).toEqual(['general']);
    expect((await make(tips, []).currentFor('u1', OCT)).map((t) => t.id)).toEqual(['general']);
  });

  it('puts crop tips first and shows at most three', async () => {
    const crop = { id: 'c1', name: 'Chilli' };
    const tips = [tip({ id: 'g1' }), tip({ id: 'g2' }), tip({ id: 'g3' }), tip({ id: 'c', cropId: 'c1', crop })];
    const shown = await make(tips, [['Chilli']]).currentFor('u1', OCT);
    expect(shown).toHaveLength(3);
    expect(shown[0].id).toBe('c');
  });

  it('never shows a switched-off tip (the query only asks for active ones)', async () => {
    const prisma = { seasonalTip: { findMany: jest.fn().mockResolvedValue([]) }, farmLand: { findMany: jest.fn().mockResolvedValue([]) } };
    await new SeasonalService(prisma as never, { log: jest.fn() } as never).currentFor('u1', OCT);
    expect(prisma.seasonalTip.findMany.mock.calls[0][0].where).toEqual({ isActive: true });
  });
});

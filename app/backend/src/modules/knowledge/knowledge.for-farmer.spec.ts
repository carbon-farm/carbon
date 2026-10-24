import { KnowledgeService } from './knowledge.service';

const article = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  title: `Article ${id}`,
  status: 'PUBLISHED',
  publishedAt: new Date(2026, 0, Number(id.replace(/\D/g, '')) || 1),
  crop: null,
  sourceCase: { farmerId: 'someone-else' },
  ...over,
});

describe('KnowledgeService.forFarmer (the dashboard "Recent advice")', () => {
  const make = (parcels: string[][], articles: unknown[]) => {
    const prisma = {
      farmLand: { findMany: jest.fn().mockResolvedValue(parcels.map((primaryCrops) => ({ primaryCrops }))) },
      knowledgeArticle: { findMany: jest.fn().mockResolvedValue(articles) },
    };
    return new KnowledgeService(prisma as never, {} as never, {} as never);
  };
  const chilli = { id: 'c1', name: 'Chilli' };
  const cotton = { id: 'c2', name: 'Cotton' };

  it('shows advice for the crops this farmer grows, not everybody’s advice', async () => {
    const s = make([['chilli']], [article('a1', { crop: chilli }), article('a2', { crop: cotton }), article('a3')]);
    const r = await s.forFarmer('u1');
    expect(r.items.map((i) => i.id)).toEqual(['a1']);
    expect(r.items[0].why).toBe('YOUR_CROP');
    expect(r.hasParcels).toBe(true);
  });

  it('puts advice made from their own cases first', async () => {
    const s = make([['Chilli']], [article('a1', { crop: chilli }), article('a2', { sourceCase: { farmerId: 'u1' } })]);
    const r = await s.forFarmer('u1');
    expect(r.items.map((i) => [i.id, i.why])).toEqual([['a2', 'YOUR_CASE'], ['a1', 'YOUR_CROP']]);
  });

  it('matches crop names in any letter case and across all parcels', async () => {
    const s = make([['COTTON '], ['rice']], [article('a1', { crop: cotton })]);
    expect((await s.forFarmer('u1')).items).toHaveLength(1);
  });

  it('shows nothing misleading to someone whose crops have no advice yet', async () => {
    const s = make([['rice']], [article('a1', { crop: chilli })]);
    const r = await s.forFarmer('u1');
    expect(r.items).toEqual([]);
    expect(r.hasParcels).toBe(true);
  });

  it('with no parcels at all, falls back to the newest advice and says there are no parcels', async () => {
    const s = make([], [article('a1'), article('a2'), article('a3'), article('a4')]);
    const r = await s.forFarmer('u1');
    expect(r.hasParcels).toBe(false);
    expect(r.items).toHaveLength(3);
    expect(r.items.every((i) => i.why === 'LATEST')).toBe(true);
  });

  it('caps the list and does not leak the source case', async () => {
    const s = make([['chilli']], Array.from({ length: 8 }, (_, i) => article(`a${i + 1}`, { crop: chilli })));
    const r = await s.forFarmer('u1');
    expect(r.items).toHaveLength(3);
    expect('sourceCase' in r.items[0]).toBe(false);
  });
});

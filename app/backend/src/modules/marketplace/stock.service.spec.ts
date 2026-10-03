import { BadRequestException } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { roundMoney } from './stock-ledger';

// Stock rules of MarketplaceService.adjustStock (the atomic SQL itself is proven against the real
// database by the live inventory script; here the rules around it).
describe('roundMoney', () => {
  it('keeps money to whole paise', () => {
    expect(roundMoney(3 * 19.99)).toBe(59.97);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(59.970000000000006)).toBe(59.97);
    expect(roundMoney(1234.5)).toBe(1234.5);
    expect(roundMoney(0)).toBe(0);
  });
});

describe('MarketplaceService.adjustStock', () => {
  let tx: any;
  let prisma: any;
  let audit: { log: jest.Mock };
  let service: MarketplaceService;
  const admin = { userId: 'admin', role: 'ADMINISTRATOR' as any };

  beforeEach(() => {
    tx = {
      $queryRaw: jest.fn(),
      product: { findUniqueOrThrow: jest.fn().mockResolvedValue({ stockQuantity: 10 }), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      stockMovement: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma = {
      product: { findUnique: jest.fn().mockResolvedValue({ id: 'p1', vendorId: null, stockQuantity: 10, isActive: true, price: 50 }) },
      $transaction: jest.fn((cb: (t: unknown) => unknown) => cb(tx)),
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new MarketplaceService(prisma, audit as any, {} as any, {} as any, {} as any, {} as any);
  });

  it('ADD gives stock back atomically and writes a ledger line with the balance', async () => {
    tx.$queryRaw.mockResolvedValue([{ stockQuantity: 15 }]);
    expect(await service.adjustStock('p1', admin, { mode: 'ADD', quantity: 5, reason: 'Supplier delivery' })).toEqual({ stockQuantity: 15, change: 5 });
    expect(tx.stockMovement.create.mock.calls[0][0].data).toMatchObject({ type: 'ADD', quantityChange: 5, balanceAfter: 15, reason: 'Supplier delivery', actorId: 'admin' });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'product.stock.adjust' }));
  });

  it('REDUCE needs a reason, a quantity of at least 1, and can never go below zero', async () => {
    await expect(service.adjustStock('p1', admin, { mode: 'REDUCE', quantity: 2 })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.adjustStock('p1', admin, { mode: 'REDUCE', quantity: 0, reason: 'damaged' })).rejects.toBeInstanceOf(BadRequestException);
    tx.$queryRaw.mockResolvedValue([]); // the atomic statement found not enough stock
    await expect(service.adjustStock('p1', admin, { mode: 'REDUCE', quantity: 99, reason: 'damaged' })).rejects.toThrow(/Only 10 in stock/);
    expect(tx.stockMovement.create).not.toHaveBeenCalled();
  });

  it('REDUCE records a negative change', async () => {
    tx.$queryRaw.mockResolvedValue([{ stockQuantity: 7 }]);
    await service.adjustStock('p1', admin, { mode: 'REDUCE', quantity: 3, reason: 'Spoiled' });
    expect(tx.stockMovement.create.mock.calls[0][0].data).toMatchObject({ type: 'REDUCE', quantityChange: -3, balanceAfter: 7 });
  });

  it('SET records the exact difference from what was there, and does nothing when it already matches', async () => {
    const r = await service.adjustStock('p1', admin, { mode: 'SET', quantity: 4, reason: 'Stock-take' });
    expect(r).toEqual({ stockQuantity: 4, change: -6 });
    expect(tx.stockMovement.create.mock.calls[0][0].data).toMatchObject({ type: 'SET', quantityChange: -6, balanceAfter: 4 });
    tx.stockMovement.create.mockClear();
    audit.log.mockClear();
    tx.product.findUniqueOrThrow.mockResolvedValue({ stockQuantity: 4 });
    expect(await service.adjustStock('p1', admin, { mode: 'SET', quantity: 4, reason: 'Stock-take' })).toEqual({ stockQuantity: 4, change: 0 });
    expect(tx.stockMovement.create).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('SET looks again if an order moved the count during the stock-take', async () => {
    tx.product.findUniqueOrThrow.mockResolvedValueOnce({ stockQuantity: 10 }).mockResolvedValueOnce({ stockQuantity: 8 });
    tx.product.updateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 1 });
    const r = await service.adjustStock('p1', admin, { mode: 'SET', quantity: 20, reason: 'Stock-take' });
    expect(r).toEqual({ stockQuantity: 20, change: 12 }); // measured against the 8 that was really there
  });

  it("another vendor cannot touch someone else's stock", async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'p1', vendorId: 'v1', stockQuantity: 10 });
    (prisma as any).vendorProfile = { findUnique: jest.fn().mockResolvedValue({ userId: 'someone-else' }) };
    await expect(service.adjustStock('p1', { userId: 'vendor2', role: 'VENDOR' as any }, { mode: 'ADD', quantity: 1 })).rejects.toThrow();
    expect(tx.stockMovement.create).not.toHaveBeenCalled();
  });
});

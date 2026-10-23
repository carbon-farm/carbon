import { LOW_STOCK_THRESHOLD, StockAlertsService, stockAlertKind } from './stock-alerts.service';

describe('stockAlertKind', () => {
  it('alerts once, when stock first drops to the low line or to zero', () => {
    expect(stockAlertKind(LOW_STOCK_THRESHOLD + 1, LOW_STOCK_THRESHOLD)).toBe('LOW');
    expect(stockAlertKind(20, 3)).toBe('LOW');
    expect(stockAlertKind(3, 0)).toBe('OUT');
    expect(stockAlertKind(1, 0)).toBe('OUT');
  });
  it('does not repeat while already below the line, or when nothing crosses it', () => {
    expect(stockAlertKind(4, 3)).toBeNull();
    expect(stockAlertKind(50, 45)).toBeNull();
    expect(stockAlertKind(0, 0)).toBeNull();
    expect(stockAlertKind(LOW_STOCK_THRESHOLD, LOW_STOCK_THRESHOLD - 1)).toBeNull();
  });
});

describe('StockAlertsService', () => {
  const make = () => {
    const prisma = {
      product: { findUnique: jest.fn().mockResolvedValue({ id: 'p1', name: 'Neem Oil', isActive: true, vendor: { userId: 'v1' } }) },
      stockWatch: {
        findMany: jest.fn().mockResolvedValue([{ userId: 'u1' }, { userId: 'u2' }]),
        deleteMany: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    const notifications = { notifyRole: jest.fn().mockResolvedValue(undefined), create: jest.fn().mockResolvedValue(undefined), createForUsers: jest.fn().mockResolvedValue(undefined) };
    return { prisma, notifications, service: new StockAlertsService(prisma as never, notifications as never) };
  };

  it('tells administrators and the selling vendor when a product runs out', async () => {
    const { service, notifications } = make();
    await service.afterStockTaken('p1', 2, 0);
    expect(notifications.notifyRole).toHaveBeenCalledWith('ADMINISTRATOR', 'stock.out', expect.stringContaining('Out of stock'), expect.stringContaining('Neem Oil'), expect.any(String));
    expect(notifications.create).toHaveBeenCalledWith('v1', 'stock.out', expect.anything(), expect.anything(), expect.any(String));
  });

  it('says nothing for an ordinary sale', async () => {
    const { service, notifications } = make();
    await service.afterStockTaken('p1', 40, 38);
    expect(notifications.notifyRole).not.toHaveBeenCalled();
  });

  it('tells every watcher once when stock returns, then forgets them', async () => {
    const { service, prisma, notifications } = make();
    await service.afterStockGiven('p1', 0, 10);
    expect(notifications.createForUsers.mock.calls[0][0]).toEqual(['u1', 'u2']);
    expect(prisma.stockWatch.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1' } });
  });

  it('does nothing when stock was already available', async () => {
    const { service, prisma } = make();
    await service.afterStockGiven('p1', 5, 10);
    expect(prisma.stockWatch.findMany).not.toHaveBeenCalled();
  });

  it('never throws, even if the database does', async () => {
    const { service, prisma } = make();
    prisma.product.findUnique.mockRejectedValue(new Error('db down'));
    await expect(service.afterStockTaken('p1', 9, 1)).resolves.toBeUndefined();
  });

  it('toggles a watch on and off', async () => {
    const { service, prisma } = make();
    prisma.stockWatch.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'w1' });
    expect(await service.toggleWatch('u1', 'p1')).toEqual({ watching: true });
    expect(await service.toggleWatch('u1', 'p1')).toEqual({ watching: false });
  });
});

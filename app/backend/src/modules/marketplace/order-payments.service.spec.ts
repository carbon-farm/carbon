import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { OrderPaymentsService } from './order-payments.service';

describe('OrderPaymentsService', () => {
  let prisma: any;
  let audit: { log: jest.Mock };
  let notifications: { create: jest.Mock; notifyRole: jest.Mock };
  let hariharaa: { buildPaymentLink: jest.Mock };
  let service: OrderPaymentsService;

  const order = (over: Record<string, unknown> = {}) => ({
    id: 'o1', orderNumber: 'ORD-2026-AB12', farmerId: 'u1', totalAmount: 250, status: 'PLACED', paymentMethod: 'UPI', paymentStatus: 'PENDING', paymentUtr: null, ...over,
  });

  beforeEach(() => {
    prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue(order()),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...order(), ...data })),
      },
      hariharaaPayment: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    notifications = { create: jest.fn().mockResolvedValue(undefined), notifyRole: jest.fn().mockResolvedValue(undefined) };
    hariharaa = { buildPaymentLink: jest.fn().mockResolvedValue({ payeeName: 'HH', upiLink: 'upi://pay?x' }) };
    service = new OrderPaymentsService(prisma, audit as any, notifications as any, hariharaa as any);
  });

  it('start builds a link for exactly the order total, with the order number in the note', async () => {
    const r = await service.start('u1', 'o1');
    expect(hariharaa.buildPaymentLink).toHaveBeenCalledWith(250, 'Order ORD-2026-AB12');
    expect(r).toMatchObject({ orderId: 'o1', amountInr: 250, upiLink: 'upi://pay?x' });
  });

  it('only the owner can pay; COD, cancelled and already-paid orders are refused', async () => {
    prisma.order.findUnique.mockResolvedValue(order({ farmerId: 'other' }));
    await expect(service.start('u1', 'o1')).rejects.toBeInstanceOf(NotFoundException);
    prisma.order.findUnique.mockResolvedValue(order({ paymentMethod: 'COD' }));
    await expect(service.start('u1', 'o1')).rejects.toBeInstanceOf(BadRequestException);
    prisma.order.findUnique.mockResolvedValue(order({ status: 'CANCELLED' }));
    await expect(service.start('u1', 'o1')).rejects.toBeInstanceOf(BadRequestException);
    prisma.order.findUnique.mockResolvedValue(order({ paymentStatus: 'PAID' }));
    await expect(service.start('u1', 'o1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('claim normalises the UTR, marks CLAIMED and tells the administrators', async () => {
    await service.claim('u1', 'o1', { utr: ' abc123456 ' });
    expect(prisma.order.update.mock.calls[0][0].data).toMatchObject({ paymentStatus: 'CLAIMED', paymentUtr: 'ABC123456' });
    // the order screen renders the returned order directly, so it must include its lines
    expect(prisma.order.update.mock.calls[0][0].include).toEqual({ items: true });
    expect(notifications.notifyRole).toHaveBeenCalledWith('ADMINISTRATOR', 'order.payment.claimed', expect.any(String), expect.any(String), expect.any(String));
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'order.payment.claim' }));
  });

  it('claim refuses a reference already used for a membership payment', async () => {
    prisma.hariharaaPayment.findFirst.mockResolvedValue({ id: 'p9' });
    await expect(service.claim('u1', 'o1', { utr: 'ABC123456' })).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it('claim maps the unique-index race to "already used"', async () => {
    const { Prisma } = jest.requireActual('@prisma/client');
    prisma.order.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'x' }));
    await expect(service.claim('u1', 'o1', { utr: 'ABC123456' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('cannot claim twice while waiting', async () => {
    prisma.order.findUnique.mockResolvedValue(order({ paymentStatus: 'CLAIMED' }));
    await expect(service.claim('u1', 'o1', { utr: 'ABC123456' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('review: approve marks PAID; reject needs a reason and marks REJECTED; only CLAIMED can be reviewed', async () => {
    prisma.order.findUnique.mockResolvedValue(order({ paymentStatus: 'CLAIMED', paymentUtr: 'ABC123456' }));
    await service.review('o1', { approve: true }, 'admin');
    expect(prisma.order.update.mock.calls[0][0].data).toMatchObject({ paymentStatus: 'PAID', paymentVerifiedBy: 'admin' });
    expect(prisma.order.update.mock.calls[0][0].include).toEqual({ items: true });
    await expect(service.review('o1', { approve: false }, 'admin')).rejects.toBeInstanceOf(BadRequestException);
    await service.review('o1', { approve: false, reason: 'No such credit' }, 'admin');
    expect(prisma.order.update.mock.calls[1][0].data).toMatchObject({ paymentStatus: 'REJECTED', paymentRejectionReason: 'No such credit' });
    prisma.order.findUnique.mockResolvedValue(order({ paymentStatus: 'PENDING' }));
    await expect(service.review('o1', { approve: true }, 'admin')).rejects.toBeInstanceOf(BadRequestException);
  });
});

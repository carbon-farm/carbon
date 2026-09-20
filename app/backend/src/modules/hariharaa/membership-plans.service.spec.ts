import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MembershipPlansService } from './membership-plans.service';

describe('MembershipPlansService', () => {
  let prisma: any;
  let audit: { log: jest.Mock };
  let service: MembershipPlansService;

  const plan = (over: Record<string, unknown> = {}) => ({ id: 'p1', name: 'Monthly', priceInr: 499, periodDays: 30, isActive: true, ...over });

  beforeEach(() => {
    prisma = {
      subscriptionPlan: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(plan()),
        findFirst: jest.fn().mockResolvedValue(plan()),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'new', ...data })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...plan(), ...data })),
      },
      hariharaaSettings: {
        findUnique: jest.fn().mockResolvedValue({ membershipRequired: true }),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({}),
      },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new MembershipPlansService(prisma, audit as any);
  });

  describe('the master switch', () => {
    it('is on unless it was switched off (and on when nothing is configured yet)', async () => {
      await expect(service.isMembershipRequired()).resolves.toBe(true);
      prisma.hariharaaSettings.findUnique.mockResolvedValue(null);
      service = new MembershipPlansService(prisma, audit as any);
      await expect(service.isMembershipRequired()).resolves.toBe(true);
    });
    it('switching off takes effect at once (the remembered answer is dropped) and is audited', async () => {
      await service.isMembershipRequired(); // remembers "true"
      prisma.hariharaaSettings.findUnique.mockResolvedValue({ membershipRequired: false });
      await service.setMembershipRequired(false, 'admin');
      await expect(service.isMembershipRequired()).resolves.toBe(false);
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'membership.required.off' }));
    });
    it('cannot be required while no plan is on', async () => {
      prisma.subscriptionPlan.count.mockResolvedValue(0);
      await expect(service.setMembershipRequired(true, 'admin')).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.hariharaaSettings.update).not.toHaveBeenCalled();
    });
    it('needs the payment settings to exist first', async () => {
      prisma.hariharaaSettings.findUnique.mockResolvedValue(null);
      await expect(service.setMembershipRequired(false, 'admin')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('plans', () => {
    it('creates a plan, audits it and keeps the legacy single price in step', async () => {
      const created = await service.createPlan({ name: ' Yearly ', priceInr: 4999, periodDays: 365 }, 'admin');
      expect(created).toMatchObject({ name: 'Yearly', priceInr: 4999, periodDays: 365, isActive: true });
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'membership.plan.create' }));
      expect(prisma.hariharaaSettings.updateMany).toHaveBeenCalledWith({ where: { id: 'singleton' }, data: { subscriptionPriceInr: 499 } });
    });
    it('cannot switch off the only plan while membership is required', async () => {
      prisma.subscriptionPlan.count.mockResolvedValue(0); // no OTHER active plan
      await expect(service.updatePlan('p1', { isActive: false }, 'admin')).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.subscriptionPlan.update).not.toHaveBeenCalled();
    });
    it('can switch off a plan when another is on, or when membership is not required', async () => {
      prisma.subscriptionPlan.count.mockResolvedValue(1);
      await service.updatePlan('p1', { isActive: false }, 'admin');
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'membership.plan.disable' }));
      prisma.subscriptionPlan.count.mockResolvedValue(0);
      prisma.hariharaaSettings.findUnique.mockResolvedValue({ membershipRequired: false });
      service = new MembershipPlansService(prisma, audit as any);
      await expect(service.updatePlan('p1', { isActive: false }, 'admin')).resolves.toBeDefined();
    });
    it('a price change is audited with before and after', async () => {
      await service.updatePlan('p1', { priceInr: 599 }, 'admin');
      const call = audit.log.mock.calls.at(-1)[0];
      expect(call.action).toBe('membership.plan.update');
      expect(call.metadata.before.priceInr).toBe(499);
      expect(call.metadata.after.priceInr).toBe(599);
    });
    it('an unknown plan is not found', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      await expect(service.updatePlan('nope', { name: 'X1' }, 'admin')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('choosing a plan to buy', () => {
    it('gives the first plan that is on when none is named', async () => {
      await expect(service.getPlanForPurchase()).resolves.toMatchObject({ id: 'p1' });
    });
    it('refuses a plan that is switched off or unknown, so nobody pays an old price', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(plan({ isActive: false }));
      await expect(service.getPlanForPurchase('p1')).rejects.toBeInstanceOf(BadRequestException);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      await expect(service.getPlanForPurchase('zzz')).rejects.toBeInstanceOf(BadRequestException);
    });
    it('says so when there is nothing to buy', async () => {
      prisma.subscriptionPlan.findFirst.mockResolvedValue(null);
      await expect(service.getPlanForPurchase()).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

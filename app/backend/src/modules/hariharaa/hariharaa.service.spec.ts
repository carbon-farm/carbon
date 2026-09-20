import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { HariharaaPaymentStatus as S, Prisma } from '@prisma/client';
import { HariharaaService } from './hariharaa.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MembershipPlansService } from './membership-plans.service';
import { MembershipRemindersService } from './membership-reminders.service';

const DAY = 24 * 60 * 60 * 1000;
const days = (n: number) => new Date(Date.now() + n * DAY);

describe('HariharaaService', () => {
  let prisma: any;
  let audit: { log: jest.Mock };
  let notifications: { create: jest.Mock; notifyRole: jest.Mock };
  let plans: { isMembershipRequired: jest.Mock; getPlanForPurchase: jest.Mock; listPublicPlans: jest.Mock };
  let service: HariharaaService;

  const settings = { subscriptionPriceInr: 499, payeeName: 'HARIHARAA Natural Food Stores', primaryUpiId: 'hh@okaxis', upiAid: 'AID123' };
  const payment = (over: Record<string, unknown> = {}) => ({
    id: 'p1', userId: 'u1', amountInr: 499, status: S.CREATED, utr: null, periodDays: 30, method: 'UPI_MANUAL', createdAt: new Date(), ...over,
  });

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ userCode: 'HHC-0042', name: 'Ravi', role: 'MEMBER' }), findMany: jest.fn().mockResolvedValue([]) },
      hariharaaSettings: {
        findUnique: jest.fn().mockResolvedValue(settings),
        upsert: jest.fn().mockImplementation(({ update }) => Promise.resolve({ id: 'singleton', ...settings, ...update })),
      },
      hariharaaSubscription: { findUnique: jest.fn().mockResolvedValue(null), upsert: jest.fn().mockResolvedValue({ id: 's1' }), update: jest.fn().mockResolvedValue({ id: 's1' }) },
      hariharaaPayment: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      order: { findFirst: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    notifications = { create: jest.fn().mockResolvedValue(undefined), notifyRole: jest.fn().mockResolvedValue(undefined) };
    plans = {
      isMembershipRequired: jest.fn().mockResolvedValue(true),
      getPlanForPurchase: jest.fn().mockResolvedValue({ id: 'pl1', name: 'Monthly', priceInr: 499, periodDays: 30 }),
      listPublicPlans: jest.fn().mockResolvedValue([{ id: 'pl1', name: 'Monthly', nameTe: null, description: null, priceInr: 499, periodDays: 30 }]),
    };
    service = new HariharaaService(
      prisma as PrismaService,
      audit as unknown as AuditService,
      notifications as unknown as NotificationsService,
      plans as unknown as MembershipPlansService,
      { remindIfDue: jest.fn().mockResolvedValue(null) } as unknown as MembershipRemindersService,
    );
  });

  describe('public settings', () => {
    it('never exposes the UPI ID, merchant id or a payment link without login', async () => {
      const pub = await service.getPublicSettings();
      expect(Object.keys(pub).sort()).toEqual(['membershipRequired', 'payeeName', 'plans', 'subscriptionPriceInr']);
      expect(pub).toMatchObject({ subscriptionPriceInr: 499, payeeName: 'HARIHARAA Natural Food Stores', membershipRequired: true });
    });
  });

  describe('isActiveSubscriber — access is paid-through date only', () => {
    const sub = (activeUntil: Date | null) => prisma.hariharaaSubscription.findUnique.mockResolvedValue(activeUntil === null ? null : { activeUntil });
    it('true while paid through a future date', async () => { sub(days(10)); await expect(service.isActiveSubscriber('u')).resolves.toBe(true); });
    it('false once the date has passed', async () => { sub(days(-1)); await expect(service.isActiveSubscriber('u')).resolves.toBe(false); });
    it('false when never paid', async () => { sub(null); await expect(service.isActiveSubscriber('u')).resolves.toBe(false); });
  });

  describe('getMyStatus', () => {
    const setup = (activeUntil: Date | null, latest: Record<string, unknown> | null) => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue(activeUntil ? { activeUntil } : null);
      prisma.hariharaaPayment.findFirst.mockResolvedValue(latest ? payment(latest) : null);
    };
    it('NOT_PAID for a brand-new customer, and shows their ID', async () => {
      setup(null, null);
      expect(await service.getMyStatus('u1')).toMatchObject({ state: 'NOT_PAID', hasAccess: false, userCode: 'HHC-0042', latestPayment: null });
    });
    it('NOT_PAID after an abandoned (CREATED) payment — failed/abandoned payment leaves them unpaid', async () => {
      setup(null, { status: S.CREATED });
      expect(await service.getMyStatus('u1')).toMatchObject({ state: 'NOT_PAID', hasAccess: false });
    });
    it('AWAITING_VERIFICATION once a UTR is submitted', async () => {
      setup(null, { status: S.CLAIMED });
      expect(await service.getMyStatus('u1')).toMatchObject({ state: 'AWAITING_VERIFICATION', hasAccess: false });
    });
    it('ACTIVE while paid through', async () => {
      setup(days(5), { status: S.VERIFIED });
      expect(await service.getMyStatus('u1')).toMatchObject({ state: 'ACTIVE', hasAccess: true });
    });
    it('keeps access while an early renewal is awaiting verification', async () => {
      setup(days(5), { status: S.CLAIMED });
      expect(await service.getMyStatus('u1')).toMatchObject({ state: 'AWAITING_VERIFICATION', hasAccess: true });
    });
    it('EXPIRED after the paid month lapses', async () => {
      setup(days(-3), { status: S.VERIFIED });
      expect(await service.getMyStatus('u1')).toMatchObject({ state: 'EXPIRED', hasAccess: false });
    });
    it('reports whole days of access left (rounded up), or null when there is none', async () => {
      setup(days(2.5), { status: S.VERIFIED });
      expect((await service.getMyStatus('u1')).daysLeft).toBe(3);
      setup(null, null);
      expect((await service.getMyStatus('u1')).daysLeft).toBeNull();
    });
    it('REJECTED when the last payment was rejected', async () => {
      setup(null, { status: S.REJECTED, rejectionReason: 'Amount mismatch' });
      expect(await service.getMyStatus('u1')).toMatchObject({ state: 'REJECTED', latestPayment: { rejectionReason: 'Amount mismatch' } });
    });
  });

  describe('startPayment', () => {
    it('creates a payment at the current price and puts the customer ID in the UPI note', async () => {
      prisma.hariharaaPayment.create.mockResolvedValue(payment());
      const r = await service.startPayment('u1');
      expect(prisma.hariharaaPayment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 'u1', amountInr: 499, periodDays: 30, planId: 'pl1', planName: 'Monthly' }),
      });
      expect(r.upiLink).toContain('tn=HARIHARAA%20HHC-0042');
      expect(r.upiLink).toContain('aid=AID123');
      expect(r.upiLink).toContain('am=499.00');
      expect(r.userCode).toBe('HHC-0042');
    });
    it('reuses the open payment instead of piling up records', async () => {
      prisma.hariharaaPayment.findFirst
        .mockResolvedValueOnce(payment({ status: S.REJECTED })) // latest overall
        .mockResolvedValueOnce(payment({ planId: 'pl1' })); // open CREATED one
      await service.startPayment('u1');
      expect(prisma.hariharaaPayment.create).not.toHaveBeenCalled();
    });
    it('refreshes an open payment to the new price if the price changed', async () => {
      prisma.hariharaaPayment.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(payment({ amountInr: 399 }));
      prisma.hariharaaPayment.update.mockResolvedValue(payment({ amountInr: 499 }));
      await service.startPayment('u1');
      expect(prisma.hariharaaPayment.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { amountInr: 499, periodDays: 30, planId: 'pl1', planName: 'Monthly' },
      });
    });
    it('refuses to start another while one is already awaiting verification', async () => {
      prisma.hariharaaPayment.findFirst.mockResolvedValueOnce(payment({ status: S.CLAIMED }));
      await expect(service.startPayment('u1')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('changing the UPI ID', () => {
    it('records exactly what changed, under its own audit action', async () => {
      await service.upsertSettings({ primaryUpiId: ' new@okaxis ', upiAid: '' }, 'admin');
      const call = audit.log.mock.calls.at(-1)[0];
      expect(call.action).toBe('hariharaa.settings.upi.change');
      expect(call.metadata.changed).toEqual(
        expect.arrayContaining([
          { field: 'primaryUpiId', from: 'hh@okaxis', to: 'new@okaxis' },
          { field: 'upiAid', from: 'AID123', to: null },
        ]),
      );
    });
    it('an empty box removes the spare UPI ID, merchant id and vendor link instead of storing ""', async () => {
      await service.upsertSettings({ primaryUpiId: 'hh@okaxis', secondaryUpiId: '', upiAid: ' ', vendorProfileId: '' }, 'admin');
      expect(prisma.hariharaaSettings.upsert.mock.calls[0][0].update).toMatchObject({ secondaryUpiId: null, upiAid: null, vendorProfileId: null });
    });
    it('an unrelated change (name only) is not audited as a UPI change', async () => {
      await service.upsertSettings({ primaryUpiId: 'hh@okaxis', payeeName: 'Another Name' }, 'admin');
      expect(audit.log.mock.calls.at(-1)[0].action).toBe('hariharaa.settings.update');
    });
  });

  describe('plans and the membership switch', () => {
    it('buys the plan that was chosen: its price, its length, its name', async () => {
      plans.getPlanForPurchase.mockResolvedValue({ id: 'pl9', name: 'Yearly', priceInr: 4999, periodDays: 365 });
      prisma.hariharaaPayment.create.mockResolvedValue(payment({ amountInr: 4999, periodDays: 365 }));
      const r = await service.startPayment('u1', 'pl9');
      expect(plans.getPlanForPurchase).toHaveBeenCalledWith('pl9');
      expect(prisma.hariharaaPayment.create.mock.calls[0][0].data).toMatchObject({ amountInr: 4999, periodDays: 365, planId: 'pl9', planName: 'Yearly' });
      expect(r.upiLink).toContain('am=4999.00');
    });
    it('re-prices an open payment when a different plan is chosen', async () => {
      plans.getPlanForPurchase.mockResolvedValue({ id: 'pl9', name: 'Yearly', priceInr: 4999, periodDays: 365 });
      prisma.hariharaaPayment.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(payment({ planId: 'pl1' }));
      prisma.hariharaaPayment.update.mockResolvedValue(payment({ amountInr: 4999, periodDays: 365 }));
      await service.startPayment('u1', 'pl9');
      expect(prisma.hariharaaPayment.update.mock.calls[0][0].data).toMatchObject({ planId: 'pl9', periodDays: 365, amountInr: 4999 });
    });
    it('public settings list the plans that are on, with the cheapest price for older screens', async () => {
      plans.listPublicPlans.mockResolvedValue([
        { id: 'a', name: 'Yearly', priceInr: 4999, periodDays: 365 },
        { id: 'b', name: 'Monthly', priceInr: 499, periodDays: 30 },
      ]);
      const pub = await service.getPublicSettings();
      expect(pub).toMatchObject({ subscriptionPriceInr: 499, membershipRequired: true });
      expect(pub.plans).toHaveLength(2);
    });
    it('with membership switched off everyone has access and nothing is locked', async () => {
      plans.isMembershipRequired.mockResolvedValue(false);
      prisma.hariharaaSubscription.findUnique.mockResolvedValue(null);
      await expect(service.isActiveSubscriber('u1')).resolves.toBe(true);
      expect(await service.getMyStatus('u1')).toMatchObject({ hasAccess: true, state: 'OPEN', accessKind: 'OPEN', membershipRequired: false });
    });
    it('switching it back on locks a member with no access again', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue(null);
      await expect(service.isActiveSubscriber('u1')).resolves.toBe(false);
      expect(await service.getMyStatus('u1')).toMatchObject({ hasAccess: false, state: 'NOT_PAID', membershipRequired: true });
    });
  });

  describe('claimPayment', () => {
    it('normalises the UTR, marks CLAIMED and tells the admins who paid', async () => {
      prisma.hariharaaPayment.findUnique.mockResolvedValue(payment());
      prisma.hariharaaPayment.update.mockResolvedValue({ ...payment({ status: S.CLAIMED }), user: { userCode: 'HHC-0042', name: 'Ravi' } });
      await service.claimPayment('u1', 'p1', { utr: '  utr123abc ' });
      expect(prisma.hariharaaPayment.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: S.CLAIMED, utr: 'UTR123ABC' }) }));
      expect(notifications.notifyRole.mock.calls[0][3]).toContain('HHC-0042');
    });
    it("won't let a customer claim someone else's payment", async () => {
      prisma.hariharaaPayment.findUnique.mockResolvedValue(payment({ userId: 'other' }));
      await expect(service.claimPayment('u1', 'p1', { utr: 'UTR123ABC' })).rejects.toBeInstanceOf(NotFoundException);
    });
    it('cannot claim a payment twice', async () => {
      prisma.hariharaaPayment.findUnique.mockResolvedValue(payment({ status: S.CLAIMED }));
      await expect(service.claimPayment('u1', 'p1', { utr: 'UTR123ABC' })).rejects.toBeInstanceOf(BadRequestException);
    });
    it('rejects a UTR another account had rejected', async () => {
      prisma.hariharaaPayment.findUnique.mockResolvedValue(payment());
      prisma.hariharaaPayment.findFirst.mockResolvedValue({ id: 'old' });
      await expect(service.claimPayment('u1', 'p1', { utr: 'UTR123ABC' })).rejects.toBeInstanceOf(ConflictException);
    });
    it('rejects a UTR already on another payment (database unique index, even under a race)', async () => {
      prisma.hariharaaPayment.findUnique.mockResolvedValue(payment());
      prisma.hariharaaPayment.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'x' }));
      await expect(service.claimPayment('u1', 'p1', { utr: 'UTR123ABC' })).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('review / markVerified', () => {
    const grantedDays = () => Math.round((prisma.hariharaaSubscription.upsert.mock.calls[0][0].update.activeUntil.getTime() - Date.now()) / DAY);
    const claimed = () => prisma.hariharaaPayment.findUnique.mockResolvedValue(payment({ status: S.CLAIMED, utr: 'UTR123ABC' }));

    it('approval grants 30 days from today for a first payment', async () => {
      claimed();
      prisma.hariharaaPayment.update.mockResolvedValue(payment({ status: S.VERIFIED }));
      await service.review('p1', { approve: true }, 'admin');
      expect(grantedDays()).toBe(30);
    });
    it('renewing early adds 30 days ON TOP of the days remaining', async () => {
      claimed();
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ activeUntil: days(10) });
      prisma.hariharaaPayment.update.mockResolvedValue(payment({ status: S.VERIFIED }));
      await service.review('p1', { approve: true }, 'admin');
      expect(grantedDays()).toBe(40);
    });
    it('renewing after a lapse starts from today, not from the past', async () => {
      claimed();
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ activeUntil: days(-20) });
      prisma.hariharaaPayment.update.mockResolvedValue(payment({ status: S.VERIFIED }));
      await service.review('p1', { approve: true }, 'admin');
      expect(grantedDays()).toBe(30);
    });
    it('a gateway can verify with no admin — same step, audited as viaGateway', async () => {
      prisma.hariharaaPayment.findUnique.mockResolvedValue(payment({ status: S.CLAIMED, method: 'GATEWAY' }));
      prisma.hariharaaPayment.update.mockResolvedValue(payment({ status: S.VERIFIED }));
      await service.markVerified('p1', null);
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'hariharaa.payment.verify', metadata: { method: 'GATEWAY', viaGateway: true } }));
      expect(notifications.create).toHaveBeenCalled();
    });
    it('rejecting needs a reason', async () => {
      claimed();
      await expect(service.review('p1', { approve: false }, 'admin')).rejects.toBeInstanceOf(BadRequestException);
    });
    it('rejecting frees the UTR for a retry but remembers it against other accounts', async () => {
      claimed();
      prisma.hariharaaPayment.update.mockResolvedValue(payment({ status: S.REJECTED }));
      await service.review('p1', { approve: false, reason: 'Not found in bank' }, 'admin');
      expect(prisma.hariharaaPayment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: S.REJECTED, utr: null, rejectedUtr: 'UTR123ABC', rejectionReason: 'Not found in bank' }) }),
      );
      expect(prisma.hariharaaSubscription.upsert).not.toHaveBeenCalled();
    });
    it('only a submitted payment can be reviewed', async () => {
      prisma.hariharaaPayment.findUnique.mockResolvedValue(payment({ status: S.VERIFIED }));
      await expect(service.review('p1', { approve: true }, 'admin')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('free access', () => {
    const future = () => new Date(Date.now() + 60 * DAY).toISOString();
    it('grants free access to a member, audits it and tells them', async () => {
      await service.grantFreeAccess('u1', { until: future(), note: 'tester' }, 'admin');
      expect(prisma.hariharaaSubscription.upsert).toHaveBeenCalledTimes(1);
      const arg = prisma.hariharaaSubscription.upsert.mock.calls[0][0];
      expect(arg.update).toMatchObject({ complimentaryNote: 'tester', complimentaryGrantedBy: 'admin' });
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'membership.free.grant' }));
      expect(notifications.create).toHaveBeenCalledWith('u1', 'membership.free.granted', expect.any(String), expect.any(String), expect.any(String));
    });
    it('rejects a past date, junk, an over-long grant, and staff accounts', async () => {
      await expect(service.grantFreeAccess('u1', { until: new Date(Date.now() - DAY).toISOString() }, 'a')).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.grantFreeAccess('u1', { until: 'nonsense' }, 'a')).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.grantFreeAccess('u1', { until: new Date(Date.now() + 900 * DAY).toISOString() }, 'a')).rejects.toBeInstanceOf(BadRequestException);
      prisma.user.findUnique.mockResolvedValue({ role: 'ADMINISTRATOR' });
      await expect(service.grantFreeAccess('u1', { until: future() }, 'a')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.hariharaaSubscription.upsert).not.toHaveBeenCalled();
    });
    it('revoke clears only the free grant, and errors when there is none', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ complimentaryUntil: days(20), activeUntil: days(5) });
      await service.revokeFreeAccess('u1', 'admin');
      expect(prisma.hariharaaSubscription.update.mock.calls[0][0].data).not.toHaveProperty('activeUntil');
      expect(prisma.hariharaaSubscription.update.mock.calls[0][0].data.complimentaryUntil).toBeNull();
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ complimentaryUntil: null, activeUntil: days(5) });
      await expect(service.revokeFreeAccess('u1', 'admin')).rejects.toBeInstanceOf(NotFoundException);
    });
    it('a free member counts as an active subscriber and shows state FREE', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ activeUntil: null, complimentaryUntil: days(30), complimentaryNote: 'till Dec' });
      await expect(service.isActiveSubscriber('u1')).resolves.toBe(true);
      await expect(service.getMyStatus('u1')).resolves.toMatchObject({ state: 'FREE', hasAccess: true, accessKind: 'FREE', freeNote: 'till Dec' });
    });
  });

  describe('claim vs shop orders', () => {
    it('refuses a UTR that already backs a shop order', async () => {
      prisma.hariharaaPayment.findUnique.mockResolvedValue(payment());
      prisma.hariharaaPayment.findFirst.mockResolvedValue(null);
      prisma.order.findFirst.mockResolvedValue({ id: 'o1' });
      await expect(service.claimPayment('u1', 'p1', { utr: 'ABC123456' })).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.hariharaaPayment.update).not.toHaveBeenCalled();
    });
  });

  describe('listMembers', () => {
    it('labels each member Paid / Free / Awaiting / Expired / Unpaid', async () => {
      const u = (id: string, sub: unknown) => ({ id, userCode: id, name: id, mobileNumber: '1', isActive: true, createdAt: new Date(), hariharaaSubscription: sub });
      prisma.user.findMany.mockResolvedValue([
        u('a', { activeUntil: days(5), complimentaryUntil: null }),
        u('b', { activeUntil: null, complimentaryUntil: days(5) }),
        u('c', null),
        u('d', { activeUntil: days(-3), complimentaryUntil: null }),
        u('e', null),
      ]);
      prisma.hariharaaPayment.findMany.mockResolvedValue([{ userId: 'e' }]);
      const labels = (await service.listMembers()).map((m: any) => m.label);
      expect(labels).toEqual(['PAID', 'FREE', 'UNPAID', 'EXPIRED', 'AWAITING']);
    });
  });
});

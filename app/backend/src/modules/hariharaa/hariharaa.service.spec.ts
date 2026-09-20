import { ConflictException } from '@nestjs/common';
import { HariharaaSubscriptionStatus } from '@prisma/client';
import { HariharaaService } from './hariharaa.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

const DAY = 24 * 60 * 60 * 1000;

describe('HariharaaService', () => {
  let prisma: {
    hariharaaSubscription: { findUnique: jest.Mock; findFirst: jest.Mock; upsert: jest.Mock; update: jest.Mock };
    hariharaaSettings: { findUnique: jest.Mock };
    auditLog: { findFirst: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let notifications: { create: jest.Mock; notifyRole: jest.Mock };
  let service: HariharaaService;

  beforeEach(() => {
    prisma = {
      hariharaaSubscription: { findUnique: jest.fn(), findFirst: jest.fn().mockResolvedValue(null), upsert: jest.fn(), update: jest.fn() },
      hariharaaSettings: { findUnique: jest.fn().mockResolvedValue({ subscriptionPriceInr: 499 }) },
      auditLog: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    notifications = { create: jest.fn().mockResolvedValue(undefined), notifyRole: jest.fn().mockResolvedValue(undefined) };
    service = new HariharaaService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditService,
      notifications as unknown as NotificationsService,
    );
  });

  describe('isActiveSubscriber — access is paid-through date only', () => {
    const sub = (status: HariharaaSubscriptionStatus, activeUntil: Date | null) =>
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ status, activeUntil });

    it('true while activeUntil is in the future', async () => {
      sub(HariharaaSubscriptionStatus.ACTIVE, new Date(Date.now() + 10 * DAY));
      await expect(service.isActiveSubscriber('u')).resolves.toBe(true);
    });
    it('false once activeUntil has passed, even though status is still ACTIVE', async () => {
      sub(HariharaaSubscriptionStatus.ACTIVE, new Date(Date.now() - DAY));
      await expect(service.isActiveSubscriber('u')).resolves.toBe(false);
    });
    it('false with no subscription row', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue(null);
      await expect(service.isActiveSubscriber('u')).resolves.toBe(false);
    });
    it('false for a first-time claim still PENDING_REVIEW (never paid-through)', async () => {
      sub(HariharaaSubscriptionStatus.PENDING_REVIEW, null);
      await expect(service.isActiveSubscriber('u')).resolves.toBe(false);
    });
    it('KEEPS access while an early renewal is pending review', async () => {
      sub(HariharaaSubscriptionStatus.PENDING_REVIEW, new Date(Date.now() + 5 * DAY));
      await expect(service.isActiveSubscriber('u')).resolves.toBe(true);
    });
    it('KEEPS the days already paid for when a renewal is rejected', async () => {
      sub(HariharaaSubscriptionStatus.REJECTED, new Date(Date.now() + 5 * DAY));
      await expect(service.isActiveSubscriber('u')).resolves.toBe(true);
    });
  });

  describe('getMyStatus', () => {
    it('reports EXPIRED (not ACTIVE) once the paid-through date has passed', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({
        status: HariharaaSubscriptionStatus.ACTIVE,
        activeUntil: new Date(Date.now() - 3 * DAY),
      });
      const s = await service.getMyStatus('u');
      expect(s).toMatchObject({ hasAccess: false, effectiveStatus: HariharaaSubscriptionStatus.EXPIRED });
    });
    it('reports ACTIVE with access while still paid through', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({
        status: HariharaaSubscriptionStatus.ACTIVE,
        activeUntil: new Date(Date.now() + 3 * DAY),
      });
      expect(await service.getMyStatus('u')).toMatchObject({ hasAccess: true, effectiveStatus: HariharaaSubscriptionStatus.ACTIVE });
    });
  });

  describe('submitClaim', () => {
    it('stores a normalised reference and the price expected at submit time, and notifies admins', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue(null);
      prisma.hariharaaSubscription.upsert.mockResolvedValue({ id: 's1' });
      await service.submitClaim('u1', { paymentReference: '  utr123abc ' });
      expect(prisma.hariharaaSubscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ paymentReference: 'UTR123ABC', expectedAmountInr: 499, status: HariharaaSubscriptionStatus.PENDING_REVIEW }),
        }),
      );
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ metadata: { paymentReference: 'UTR123ABC', expectedAmountInr: 499 } }));
      expect(notifications.notifyRole).toHaveBeenCalled();
    });

    it('rejects a reference another customer currently holds', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue(null);
      prisma.hariharaaSubscription.findFirst.mockResolvedValue({ id: 'other' });
      await expect(service.submitClaim('u1', { paymentReference: 'UTR1' })).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.hariharaaSubscription.upsert).not.toHaveBeenCalled();
    });

    it('rejects a reference another customer used earlier (found in audit history)', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue(null);
      prisma.auditLog.findFirst.mockResolvedValue({ id: 'old' });
      await expect(service.submitClaim('u1', { paymentReference: 'UTR1' })).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects renewing with the same reference the customer already used', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ paymentReference: 'UTR1', status: HariharaaSubscriptionStatus.ACTIVE });
      await expect(service.submitClaim('u1', { paymentReference: 'utr1' })).rejects.toBeInstanceOf(ConflictException);
    });

    it('lets a customer resubmit the same reference after their claim was rejected (typo in the note etc.)', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ paymentReference: 'UTR1', status: HariharaaSubscriptionStatus.REJECTED });
      prisma.hariharaaSubscription.upsert.mockResolvedValue({ id: 's1' });
      await expect(service.submitClaim('u1', { paymentReference: 'UTR1' })).resolves.toBeDefined();
    });
  });

  describe('review', () => {
    const pending = (activeUntil: Date | null) =>
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({ id: 's1', userId: 'u1', status: HariharaaSubscriptionStatus.PENDING_REVIEW, activeUntil });
    const approvedUntil = () => (prisma.hariharaaSubscription.update.mock.calls[0][0].data.activeUntil as Date).getTime();

    it('gives 30 days from today for a first approval', async () => {
      pending(null);
      prisma.hariharaaSubscription.update.mockResolvedValue({ id: 's1', userId: 'u1' });
      await service.review('s1', { approve: true }, 'admin');
      expect(Math.round((approvedUntil() - Date.now()) / DAY)).toBe(30);
    });

    it('adds 30 days ON TOP of the days still remaining when renewing early', async () => {
      pending(new Date(Date.now() + 10 * DAY));
      prisma.hariharaaSubscription.update.mockResolvedValue({ id: 's1', userId: 'u1' });
      await service.review('s1', { approve: true }, 'admin');
      expect(Math.round((approvedUntil() - Date.now()) / DAY)).toBe(40);
    });

    it('starts from today (not from the past) when renewing after a lapse', async () => {
      pending(new Date(Date.now() - 20 * DAY));
      prisma.hariharaaSubscription.update.mockResolvedValue({ id: 's1', userId: 'u1' });
      await service.review('s1', { approve: true }, 'admin');
      expect(Math.round((approvedUntil() - Date.now()) / DAY)).toBe(30);
    });
  });
});

import { HariharaaSubscriptionStatus } from '@prisma/client';
import { HariharaaService } from './hariharaa.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('HariharaaService', () => {
  let prisma: {
    hariharaaSubscription: { findUnique: jest.Mock; upsert: jest.Mock; update: jest.Mock };
    hariharaaSettings: { findUnique: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let notifications: { create: jest.Mock; notifyRole: jest.Mock };
  let service: HariharaaService;

  beforeEach(() => {
    prisma = {
      hariharaaSubscription: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
      hariharaaSettings: { findUnique: jest.fn() },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    notifications = { create: jest.fn().mockResolvedValue(undefined), notifyRole: jest.fn().mockResolvedValue(undefined) };
    service = new HariharaaService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditService,
      notifications as unknown as NotificationsService,
    );
  });

  describe('isActiveSubscriber', () => {
    it('is true for ACTIVE status with an activeUntil still in the future', async () => {
      const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({
        status: HariharaaSubscriptionStatus.ACTIVE,
        activeUntil: future,
      });
      await expect(service.isActiveSubscriber('user-1')).resolves.toBe(true);
    });

    it('is false once activeUntil has lapsed, even though status is still ACTIVE', async () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({
        status: HariharaaSubscriptionStatus.ACTIVE,
        activeUntil: past,
      });
      await expect(service.isActiveSubscriber('user-1')).resolves.toBe(false);
    });

    it('is false when no subscription row exists at all', async () => {
      prisma.hariharaaSubscription.findUnique.mockResolvedValue(null);
      await expect(service.isActiveSubscriber('user-1')).resolves.toBe(false);
    });

    it('is false for a PENDING_REVIEW claim, regardless of activeUntil', async () => {
      const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      prisma.hariharaaSubscription.findUnique.mockResolvedValue({
        status: HariharaaSubscriptionStatus.PENDING_REVIEW,
        activeUntil: future,
      });
      await expect(service.isActiveSubscriber('user-1')).resolves.toBe(false);
    });
  });

  describe('submitClaim', () => {
    it('resets status to PENDING_REVIEW on resubmission without touching activeUntil', async () => {
      prisma.hariharaaSubscription.upsert.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        status: HariharaaSubscriptionStatus.PENDING_REVIEW,
      });

      await service.submitClaim('user-1', { paymentReference: 'UTR123' });

      expect(prisma.hariharaaSubscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          update: expect.objectContaining({ status: HariharaaSubscriptionStatus.PENDING_REVIEW, paymentReference: 'UTR123' }),
        }),
      );
      expect(notifications.notifyRole).toHaveBeenCalled();
    });
  });
});

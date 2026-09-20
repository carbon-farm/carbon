import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { HariharaaPaymentStatus, PaymentMethod, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { bi } from '../../common/i18n';
import { ClaimPaymentDto } from './dto/claim-payment.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { buildUpiLink } from './upi-link';

const SETTINGS_ID = 'singleton';
const PERIOD_DAYS = 30;

export type SubscriptionState = 'NOT_PAID' | 'AWAITING_VERIFICATION' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';

// HARIHARAA Natural Food Stores — a second storefront sharing this codebase's
// Product/Order/VendorProfile tables, gated by a monthly subscription.
//
// Payments are recorded one row per attempt (HariharaaPayment), separate from *access*
// (HariharaaSubscription.activeUntil). Today the method is manual UPI: the customer
// starts a payment, pays, types the UTR (CLAIMED), an Administrator verifies it. A
// payment gateway plugs into the same lifecycle: it would create the payment via
// startPayment(), and its webhook would call markVerified(paymentId, null) — the one
// place that grants access, notifies and audits. Nothing downstream changes.
@Injectable()
export class HariharaaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------- Settings ----------

  // Public on purpose (no login): only what the landing page may show. The UPI ID and
  // payment QR are never exposed here — only a registered customer can start a payment.
  async getPublicSettings() {
    const settings = await this.getSettingsOrThrow();
    return { subscriptionPriceInr: settings.subscriptionPriceInr, payeeName: settings.payeeName };
  }

  async getSettingsForAdmin() {
    return this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
  }

  async upsertSettings(dto: UpdateSettingsDto, adminId: string) {
    const updated = await this.prisma.hariharaaSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...dto, updatedByUserId: adminId },
      update: { ...dto, updatedByUserId: adminId },
    });
    await this.audit.log({ actorId: adminId, action: 'hariharaa.settings.update', entityType: 'HariharaaSettings', entityId: updated.id });
    return updated;
  }

  async getHariharaaVendorId(): Promise<string | null> {
    const settings = await this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
    return settings?.vendorProfileId ?? null;
  }

  private async getSettingsOrThrow() {
    const settings = await this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!settings) {
      throw new NotFoundException(
        bi('Subscription details are not configured yet — check back soon', 'సభ్యత్వ వివరాలు ఇంకా కాన్ఫిగర్ చేయలేదు — త్వరలో మళ్ళీ చూడండి'),
      );
    }
    return settings;
  }

  // ---------- Customer: status ----------

  // What the Pay page needs, derived on the server so the UI never guesses: access
  // (paid-through date has not passed) and one clear state.
  async getMyStatus(userId: string) {
    const [user, subscription, latest] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { userCode: true, name: true } }),
      this.prisma.hariharaaSubscription.findUnique({ where: { userId } }),
      this.prisma.hariharaaPayment.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);
    const activeUntil = subscription?.activeUntil ?? null;
    const hasAccess = activeUntil !== null && activeUntil > new Date();

    let state: SubscriptionState = 'NOT_PAID';
    if (latest?.status === HariharaaPaymentStatus.CLAIMED) state = 'AWAITING_VERIFICATION';
    else if (hasAccess) state = 'ACTIVE';
    else if (latest?.status === HariharaaPaymentStatus.REJECTED) state = 'REJECTED';
    else if (activeUntil !== null) state = 'EXPIRED';

    return {
      userCode: user?.userCode ?? null,
      hasAccess,
      activeUntil,
      state,
      latestPayment: latest
        ? {
            id: latest.id,
            status: latest.status,
            amountInr: latest.amountInr,
            utr: latest.utr,
            rejectionReason: latest.rejectionReason,
            createdAt: latest.createdAt,
            claimedAt: latest.claimedAt,
          }
        : null,
    };
  }

  // The one method every catalog/cart/checkout gate calls. Access is exactly "paid
  // through a date that hasn't passed": activeUntil is only ever set by a verified
  // payment, so it — not the state of the latest payment — is the source of truth. A
  // customer renewing early, or whose renewal is rejected, keeps the days already paid
  // for, and a lapsed month reads as not-subscribed with no sweep job.
  async isActiveSubscriber(userId: string): Promise<boolean> {
    const subscription = await this.prisma.hariharaaSubscription.findUnique({ where: { userId } });
    return subscription?.activeUntil != null && subscription.activeUntil > new Date();
  }

  // ---------- Customer: pay ----------

  // Step 1 — "Pay". Creates (or reuses) the open payment and returns what the customer
  // needs to pay it. Reusing an open payment means tapping Pay twice, or coming back
  // after abandoning, never piles up records. The note carries the customer's own ID
  // (HHC-0042) so the bank credit can be matched to them.
  async startPayment(userId: string) {
    const [user, settings, latest] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { userCode: true } }),
      this.getSettingsOrThrow(),
      this.prisma.hariharaaPayment.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);
    if (latest?.status === HariharaaPaymentStatus.CLAIMED) {
      throw new BadRequestException(
        bi('Your payment is already waiting for verification', 'మీ చెల్లింపు ఇప్పటికే ధృవీకరణ కోసం వేచి ఉంది'),
      );
    }

    let payment = await this.prisma.hariharaaPayment.findFirst({
      where: { userId, status: HariharaaPaymentStatus.CREATED },
      orderBy: { createdAt: 'desc' },
    });
    if (payment) {
      if (payment.amountInr !== settings.subscriptionPriceInr) {
        payment = await this.prisma.hariharaaPayment.update({ where: { id: payment.id }, data: { amountInr: settings.subscriptionPriceInr } });
      }
    } else {
      payment = await this.prisma.hariharaaPayment.create({
        data: { userId, amountInr: settings.subscriptionPriceInr, method: PaymentMethod.UPI_MANUAL, periodDays: PERIOD_DAYS },
      });
      await this.audit.log({
        actorId: userId,
        action: 'hariharaa.payment.start',
        entityType: 'HariharaaPayment',
        entityId: payment.id,
        metadata: { amountInr: payment.amountInr },
      });
    }

    return {
      paymentId: payment.id,
      amountInr: payment.amountInr,
      userCode: user?.userCode ?? null,
      payeeName: settings.payeeName,
      upiLink: buildUpiLink({
        vpa: settings.primaryUpiId,
        payeeName: settings.payeeName,
        amountInr: payment.amountInr,
        merchantAid: settings.upiAid,
        note: user?.userCode ? `HARIHARAA ${user.userCode}` : 'HARIHARAA subscription',
      }),
    };
  }

  // Step 2 — "I've paid": the customer types the UTR from their UPI app.
  async claimPayment(userId: string, paymentId: string, dto: ClaimPaymentDto) {
    const payment = await this.prisma.hariharaaPayment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.userId !== userId) {
      throw new NotFoundException(bi('Payment not found', 'చెల్లింపు కనుగొనబడలేదు'));
    }
    if (payment.status !== HariharaaPaymentStatus.CREATED) {
      throw new BadRequestException(bi('This payment was already submitted', 'ఈ చెల్లింపు ఇప్పటికే సమర్పించబడింది'));
    }

    // UTRs are case-insensitive; normalise so "abc123" and "ABC123 " can't dodge the checks.
    const utr = dto.utr.trim().toUpperCase();
    // A rejected reference can be retried by the same customer, but not claimed by anyone else.
    const rejectedElsewhere = await this.prisma.hariharaaPayment.findFirst({ where: { rejectedUtr: utr, NOT: { userId } } });
    if (rejectedElsewhere) throw this.utrTaken();

    let updated;
    try {
      updated = await this.prisma.hariharaaPayment.update({
        where: { id: paymentId },
        data: { status: HariharaaPaymentStatus.CLAIMED, utr, note: dto.note, claimedAt: new Date() },
        include: { user: { select: { userCode: true, name: true } } },
      });
    } catch (err) {
      // The unique index on utr is what makes "one payment, one account" hold even if two
      // claims race each other.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') throw this.utrTaken();
      throw err;
    }

    await this.audit.log({
      actorId: userId,
      action: 'hariharaa.payment.claim',
      entityType: 'HariharaaPayment',
      entityId: updated.id,
      metadata: { utr, amountInr: updated.amountInr },
    });
    await this.notifications.notifyRole(
      Role.ADMINISTRATOR,
      'hariharaa.payment.claimed',
      bi('HARIHARAA payment to verify', 'ధృవీకరించడానికి HARIHARAA చెల్లింపు'),
      bi(`${updated.user.userCode ?? updated.user.name} — ₹${updated.amountInr.toFixed(2)}, UTR ${utr}`, `${updated.user.userCode ?? updated.user.name} — ₹${updated.amountInr.toFixed(2)}, UTR ${utr}`),
      '/admin/hariharaa-subscriptions',
    );
    return updated;
  }

  private utrTaken() {
    return new ConflictException(
      bi('This payment reference was already used on another payment', 'ఈ చెల్లింపు రిఫరెన్స్ ఇప్పటికే మరొక చెల్లింపుపై ఉపయోగించబడింది'),
    );
  }

  // ---------- Administrator: verify ----------

  async listPendingReview() {
    return this.prisma.hariharaaPayment.findMany({
      where: { status: HariharaaPaymentStatus.CLAIMED },
      include: { user: { select: { id: true, name: true, mobileNumber: true, userCode: true } } },
      orderBy: { claimedAt: 'asc' },
    });
  }

  async review(paymentId: string, dto: ReviewClaimDto, adminId: string) {
    const payment = await this.prisma.hariharaaPayment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException(bi('Payment not found', 'చెల్లింపు కనుగొనబడలేదు'));
    if (payment.status !== HariharaaPaymentStatus.CLAIMED) {
      throw new BadRequestException(bi('Only submitted payments can be reviewed', 'సమర్పించిన చెల్లింపులను మాత్రమే సమీక్షించవచ్చు'));
    }
    if (dto.approve) return this.markVerified(paymentId, adminId);

    if (!dto.reason) {
      throw new BadRequestException(bi('A reason is required when rejecting a payment', 'చెల్లింపును తిరస్కరించేటప్పుడు కారణం అవసరం'));
    }
    const rejected = await this.prisma.hariharaaPayment.update({
      where: { id: paymentId },
      // Free the unique utr slot so the customer can retry; remember it so a *different*
      // account still can't claim it.
      data: {
        status: HariharaaPaymentStatus.REJECTED,
        utr: null,
        rejectedUtr: payment.utr,
        rejectionReason: dto.reason,
        verifiedAt: new Date(),
        verifiedByUserId: adminId,
      },
    });
    await this.audit.log({
      actorId: adminId,
      action: 'hariharaa.payment.reject',
      entityType: 'HariharaaPayment',
      entityId: paymentId,
      metadata: { reason: dto.reason },
    });
    await this.notifications.create(
      rejected.userId,
      'hariharaa.payment.rejected',
      bi('Your HARIHARAA payment needs attention', 'మీ HARIHARAA చెల్లింపుకు శ్రద్ధ అవసరం'),
      bi(dto.reason, dto.reason),
      '/hariharaa/subscription',
    );
    return rejected;
  }

  // THE verify step — the only place that grants access. An Administrator calls it after
  // checking the bank credit; a payment gateway's webhook would call it with
  // verifiedByUserId = null. Renewing early adds to the days already paid for.
  async markVerified(paymentId: string, verifiedByUserId: string | null) {
    const payment = await this.prisma.hariharaaPayment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException(bi('Payment not found', 'చెల్లింపు కనుగొనబడలేదు'));
    if (payment.status === HariharaaPaymentStatus.VERIFIED || payment.status === HariharaaPaymentStatus.REJECTED) {
      throw new ForbiddenException(bi('This payment is already decided', 'ఈ చెల్లింపు ఇప్పటికే నిర్ణయించబడింది'));
    }

    const verified = await this.prisma.$transaction(async (tx) => {
      const current = await tx.hariharaaSubscription.findUnique({ where: { userId: payment.userId } });
      const activeUntil = new Date(Math.max(Date.now(), current?.activeUntil?.getTime() ?? 0));
      activeUntil.setDate(activeUntil.getDate() + payment.periodDays);

      await tx.hariharaaSubscription.upsert({
        where: { userId: payment.userId },
        create: { userId: payment.userId, activeUntil },
        update: { activeUntil },
      });
      return tx.hariharaaPayment.update({
        where: { id: paymentId },
        data: { status: HariharaaPaymentStatus.VERIFIED, verifiedAt: new Date(), verifiedByUserId },
      });
    });

    await this.audit.log({
      actorId: verifiedByUserId ?? undefined,
      action: 'hariharaa.payment.verify',
      entityType: 'HariharaaPayment',
      entityId: paymentId,
      metadata: { method: payment.method, viaGateway: verifiedByUserId === null },
    });
    await this.notifications.create(
      verified.userId,
      'hariharaa.payment.verified',
      bi('Your HARIHARAA subscription is active', 'మీ HARIHARAA సభ్యత్వం యాక్టివ్‌గా ఉంది'),
      bi('You can now shop the full catalog', 'ఇప్పుడు మీరు పూర్తి కేటలాగ్‌ను షాపింగ్ చేయవచ్చు'),
      '/hariharaa/shop',
    );
    return verified;
  }
}

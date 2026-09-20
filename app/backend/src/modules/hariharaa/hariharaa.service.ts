import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { HariharaaSubscriptionStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { bi } from '../../common/i18n';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { buildUpiLink } from './upi-link';

const SETTINGS_ID = 'singleton';
const SUBSCRIPTION_DAYS = 30;

// HARIHARAA Natural Food Stores — a second, unrelated storefront sharing this
// codebase's Product/Order/VendorProfile tables but gated by its own
// CUSTOMER-role subscription. Payment is manual for now: a customer submits a
// UPI payment reference, an Administrator reviews it — same submit/verify
// shape as ExpertsService, deliberately, so a later swap to automated
// payment-gateway verification only changes how submitClaim() gets called
// (a webhook instead of this controller endpoint); review()/notifications/
// audit stay untouched.
@Injectable()
export class HariharaaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async getPublicSettings() {
    const settings = await this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!settings) {
      throw new NotFoundException(
        bi('Subscription details are not configured yet — check back soon', 'సభ్యత్వ వివరాలు ఇంకా కాన్ఫిగర్ చేయలేదు — త్వరలో మళ్ళీ చూడండి'),
      );
    }
    return {
      subscriptionPriceInr: settings.subscriptionPriceInr,
      payeeName: settings.payeeName,
      primaryUpiId: settings.primaryUpiId,
      secondaryUpiId: settings.secondaryUpiId,
      // Built here, once, so the landing page and the subscription page can't
      // drift apart and the format is covered by unit tests.
      upiLink: buildUpiLink({
        vpa: settings.primaryUpiId,
        payeeName: settings.payeeName,
        amountInr: settings.subscriptionPriceInr,
        merchantAid: settings.upiAid,
        note: 'HARIHARAA subscription',
      }),
    };
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
    await this.audit.log({
      actorId: adminId,
      action: 'hariharaa.settings.update',
      entityType: 'HariharaaSettings',
      entityId: updated.id,
    });
    return updated;
  }

  async getHariharaaVendorId(): Promise<string | null> {
    const settings = await this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
    return settings?.vendorProfileId ?? null;
  }

  // Resubmitting (after a REJECTED claim, or an ACTIVE customer renewing
  // ahead of their activeUntil) resets status to PENDING_REVIEW without
  // touching activeUntil — an active subscriber keeps working access while
  // their renewal is under review, same "resubmit resets the gate, doesn't
  // punish the customer" spirit as MarketplaceService.submitVendorProfile.
  async submitClaim(userId: string, dto: SubmitClaimDto) {
    // UTRs are case-insensitive digits/letters; normalise so "abc123" and
    // "ABC123 " can't be used to dodge the duplicate check below.
    const reference = dto.paymentReference.trim().toUpperCase();

    const existing = await this.prisma.hariharaaSubscription.findUnique({ where: { userId } });
    if (existing?.paymentReference === reference && existing.status !== HariharaaSubscriptionStatus.REJECTED) {
      throw new ConflictException(
        bi('You already used this payment reference — enter the one for your new payment', 'మీరు ఈ చెల్లింపు రిఫరెన్స్‌ను ఇప్పటికే ఉపయోగించారు — మీ కొత్త చెల్లింపు రిఫరెన్స్‌ను నమోదు చేయండి'),
      );
    }
    // One real payment must not unlock several accounts. Checked against every
    // other customer's current claim AND the audit history of past submissions
    // (each customer has a single claim row that later renewals overwrite).
    const usedByOther = await this.prisma.hariharaaSubscription.findFirst({
      where: {
        paymentReference: reference,
        NOT: { userId },
        status: { not: HariharaaSubscriptionStatus.REJECTED },
      },
    });
    const usedInHistory = await this.prisma.auditLog.findFirst({
      where: {
        action: 'hariharaa.subscription.submit',
        NOT: { actorId: userId },
        metadata: { path: ['paymentReference'], equals: reference },
      },
    });
    if (usedByOther || usedInHistory) {
      throw new ConflictException(
        bi('This payment reference was already submitted by another account', 'ఈ చెల్లింపు రిఫరెన్స్‌ను మరొక ఖాతా ఇప్పటికే సమర్పించింది'),
      );
    }

    const settings = await this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
    const expectedAmountInr = settings?.subscriptionPriceInr ?? null;

    const updated = await this.prisma.hariharaaSubscription.upsert({
      where: { userId },
      create: {
        userId,
        status: HariharaaSubscriptionStatus.PENDING_REVIEW,
        paymentReference: reference,
        expectedAmountInr,
        note: dto.note,
        submittedAt: new Date(),
      },
      update: {
        status: HariharaaSubscriptionStatus.PENDING_REVIEW,
        paymentReference: reference,
        expectedAmountInr,
        note: dto.note,
        submittedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'hariharaa.subscription.submit',
      entityType: 'HariharaaSubscription',
      entityId: updated.id,
      metadata: { paymentReference: reference, expectedAmountInr },
    });
    await this.notifications.notifyRole(
      Role.ADMINISTRATOR,
      'hariharaa.subscription.claim.submit',
      bi('New HARIHARAA subscription claim', 'కొత్త HARIHARAA సభ్యత్వ దావా'),
      bi('A customer submitted a payment reference for review', 'ఒక కస్టమర్ సమీక్ష కోసం చెల్లింపు రిఫరెన్స్‌ను సమర్పించారు'),
      '/admin/hariharaa-subscriptions',
    );
    return updated;
  }

  // Adds the derived facts the UI must not re-derive (or get wrong): whether the
  // customer has access *right now*, and an "effective" status that reads
  // EXPIRED once the paid-through date has passed — the stored status stays
  // ACTIVE until the next claim, so showing it raw told lapsed customers
  // "Active" and hid the renewal form.
  async getMyStatus(userId: string) {
    const sub = await this.prisma.hariharaaSubscription.findUnique({ where: { userId } });
    if (!sub) return null;
    const hasAccess = sub.activeUntil !== null && sub.activeUntil > new Date();
    const lapsed = sub.status === HariharaaSubscriptionStatus.ACTIVE && !hasAccess;
    return {
      ...sub,
      hasAccess,
      effectiveStatus: lapsed ? HariharaaSubscriptionStatus.EXPIRED : sub.status,
    };
  }

  async listPendingReview() {
    return this.prisma.hariharaaSubscription.findMany({
      where: { status: HariharaaSubscriptionStatus.PENDING_REVIEW },
      include: { user: { select: { id: true, name: true, mobileNumber: true } } },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async review(subscriptionId: string, dto: ReviewClaimDto, adminId: string) {
    const subscription = await this.prisma.hariharaaSubscription.findUnique({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new NotFoundException(bi('Subscription claim not found', 'సభ్యత్వ దావా కనుగొనబడలేదు'));
    }
    if (subscription.status !== HariharaaSubscriptionStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        bi('Only claims pending review can be reviewed', 'సమీక్ష కోసం పెండింగ్‌లో ఉన్న దావాలు మాత్రమే సమీక్షించవచ్చు'),
      );
    }
    if (!dto.approve && !dto.reason) {
      throw new BadRequestException(bi('A reason is required when rejecting a claim', 'దావాను తిరస్కరించేటప్పుడు కారణం అవసరం'));
    }

    // Renewing early adds to the days already paid for instead of discarding them.
    const activeUntil = new Date(
      Math.max(Date.now(), subscription.activeUntil?.getTime() ?? 0),
    );
    activeUntil.setDate(activeUntil.getDate() + SUBSCRIPTION_DAYS);

    const updated = await this.prisma.hariharaaSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: dto.approve ? HariharaaSubscriptionStatus.ACTIVE : HariharaaSubscriptionStatus.REJECTED,
        reviewedByUserId: adminId,
        reviewedAt: new Date(),
        ...(dto.approve ? { activeUntil } : {}),
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: dto.approve ? 'hariharaa.subscription.approve' : 'hariharaa.subscription.reject',
      entityType: 'HariharaaSubscription',
      entityId: updated.id,
      metadata: dto.reason ? { reason: dto.reason } : undefined,
    });
    await this.notifications.create(
      updated.userId,
      dto.approve ? 'hariharaa.subscription.approved' : 'hariharaa.subscription.rejected',
      dto.approve
        ? bi('Your HARIHARAA subscription is active', 'మీ HARIHARAA సభ్యత్వం యాక్టివ్‌గా ఉంది')
        : bi('Your HARIHARAA subscription claim needs attention', 'మీ HARIHARAA సభ్యత్వ దావాకు శ్రద్ధ అవసరం'),
      dto.approve
        ? bi('You can now shop the full catalog', 'ఇప్పుడు మీరు పూర్తి కేటలాగ్‌ను షాపింగ్ చేయవచ్చు')
        : bi(dto.reason ?? '', dto.reason ?? ''),
      '/hariharaa/subscription',
    );
    return updated;
  }

  // The one method every catalog/cart/checkout gate calls. Access is exactly
  // "paid through a date that hasn't passed": activeUntil is only ever set by an
  // Administrator approval, so it is the source of truth — not the status of the
  // *latest claim*. That way a customer renewing early (status back to
  // PENDING_REVIEW) or whose renewal is rejected keeps the days they already
  // paid for, and a lapsed month reads as not-subscribed with no sweep job.
  async isActiveSubscriber(userId: string): Promise<boolean> {
    const subscription = await this.prisma.hariharaaSubscription.findUnique({ where: { userId } });
    return subscription?.activeUntil != null && subscription.activeUntil > new Date();
  }
}

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
import { computeAccess, daysLeft, memberLabel, parseGrantUntil, renewalStart } from './membership-access';
import { GrantFreeAccessDto } from './dto/grant-free-access.dto';
import { MembershipPlansService } from './membership-plans.service';
import { MembershipRemindersService } from './membership-reminders.service';

const SETTINGS_ID = 'singleton';
const MAX_FREE_ACCESS_DAYS = 731; // ~2 years

// OPEN = an Administrator has switched membership off, so nothing is locked.
export type SubscriptionState = 'NOT_PAID' | 'AWAITING_VERIFICATION' | 'ACTIVE' | 'FREE' | 'EXPIRED' | 'REJECTED' | 'OPEN';

// Accounts that can hold a membership: every self-signup. FARMER/CUSTOMER are the legacy
// values from before the merge into MEMBER (see common/role-compat.ts).
const MEMBER_ROLES: Role[] = [Role.MEMBER, Role.FARMER, Role.CUSTOMER];

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
    private readonly plans: MembershipPlansService,
    private readonly reminders: MembershipRemindersService,
  ) {}

  // ---------- Settings ----------

  // Public on purpose (no login): only what the landing page may show. The UPI ID and
  // payment QR are never exposed here — only a registered customer can start a payment.
  async getPublicSettings() {
    const [settings, plans, membershipRequired] = await Promise.all([
      this.getSettingsOrThrow(),
      this.plans.listPublicPlans(),
      this.plans.isMembershipRequired(),
    ]);
    // subscriptionPriceInr stays for screens cached from before there were plans: the cheapest one.
    return {
      subscriptionPriceInr: plans[0] ? Math.min(...plans.map((p) => p.priceInr)) : settings.subscriptionPriceInr,
      payeeName: settings.payeeName,
      membershipRequired,
      plans,
    };
  }

  async getSettingsForAdmin() {
    return this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
  }

  async upsertSettings(dto: UpdateSettingsDto, adminId: string) {
    const before = await this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
    // An empty box means "remove it", not "store an empty string" (which for the vendor link
    // would not even be a valid reference).
    const blankToNull = (v: string | undefined) => (v === undefined ? undefined : v.trim() === '' ? null : v.trim());
    const clean = {
      ...dto,
      primaryUpiId: dto.primaryUpiId.trim(),
      payeeName: dto.payeeName?.trim() || undefined,
      secondaryUpiId: blankToNull(dto.secondaryUpiId),
      upiAid: blankToNull(dto.upiAid),
      vendorProfileId: blankToNull(dto.vendorProfileId),
    };
    const updated = await this.prisma.hariharaaSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...clean, subscriptionPriceInr: dto.subscriptionPriceInr ?? 499, updatedByUserId: adminId },
      update: { ...clean, updatedByUserId: adminId },
    });
    // Where the money goes is the most sensitive setting: record exactly what changed.
    const changed = (['primaryUpiId', 'secondaryUpiId', 'upiAid', 'payeeName'] as const)
      .filter((k) => (before?.[k] ?? null) !== (updated[k] ?? null))
      .map((k) => ({ field: k, from: before?.[k] ?? null, to: updated[k] ?? null }));
    await this.audit.log({
      actorId: adminId,
      action: changed.some((c) => c.field === 'primaryUpiId') ? 'hariharaa.settings.upi.change' : 'hariharaa.settings.update',
      entityType: 'HariharaaSettings',
      entityId: updated.id,
      metadata: { changed },
    });
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
    const [membershipRequired, plans] = await Promise.all([this.plans.isMembershipRequired(), this.plans.listPublicPlans()]);
    const access = computeAccess(subscription);

    // Opening the membership status is the moment a member most needs to hear that access is
    // about to end — send the notice now rather than wait for the hourly sweep (which a sleeping
    // server would miss). Idempotent, and never allowed to break the status itself.
    await this.reminders.remindIfDue(userId).catch(() => null);

    let state: SubscriptionState = 'NOT_PAID';
    if (latest?.status === HariharaaPaymentStatus.CLAIMED) state = 'AWAITING_VERIFICATION';
    else if (access.hasAccess) state = access.kind === 'FREE' ? 'FREE' : 'ACTIVE';
    else if (!membershipRequired) state = 'OPEN';
    else if (latest?.status === HariharaaPaymentStatus.REJECTED) state = 'REJECTED';
    else if (access.until !== null) state = 'EXPIRED';

    return {
      userCode: user?.userCode ?? null,
      // With membership switched off everyone has access — nothing to pay for.
      hasAccess: access.hasAccess || !membershipRequired,
      accessKind: access.hasAccess ? access.kind : membershipRequired ? access.kind : ('OPEN' as const),
      membershipRequired,
      // Whole days of access left, so the screens can say "ends in 2 days" (null when none).
      daysLeft: membershipRequired ? daysLeft(subscription) : null,
      plans,
      activeUntil: access.until, // when current access ends (or when the last one ended)
      freeNote: access.kind === 'FREE' ? subscription?.complimentaryNote ?? null : null,
      state,
      latestPayment: latest
        ? {
            id: latest.id,
            status: latest.status,
            amountInr: latest.amountInr,
            planName: latest.planName,
            periodDays: latest.periodDays,
            utr: latest.utr,
            rejectionReason: latest.rejectionReason,
            createdAt: latest.createdAt,
            claimedAt: latest.claimedAt,
          }
        : null,
    };
  }

  // The one method every gate calls (checkout, and the farm-advice endpoints via
  // MembershipGuard). Membership is exactly "paid through a future date, OR free access
  // that hasn't ended" — see membership-access.ts. Both dates only ever move through a
  // verified payment or an Administrator's grant, so a customer renewing early, or whose
  // renewal is rejected, keeps what they already had, and nothing needs a sweep job.
  async isActiveSubscriber(userId: string): Promise<boolean> {
    if (!(await this.plans.isMembershipRequired())) return true; // membership switched off: open to all
    const subscription = await this.prisma.hariharaaSubscription.findUnique({ where: { userId } });
    return computeAccess(subscription).hasAccess;
  }

  // ---------- Customer: pay ----------

  // Step 1 — "Pay". Creates (or reuses) the open payment and returns what the customer
  // needs to pay it. Reusing an open payment means tapping Pay twice, or coming back
  // after abandoning, never piles up records. The note carries the customer's own ID
  // (HHC-0042) so the bank credit can be matched to them.
  async startPayment(userId: string, planId?: string) {
    const plan = await this.plans.getPlanForPurchase(planId);
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
      // An abandoned open payment is re-priced to the plan chosen now (the price may have
      // changed, or they picked a different plan).
      if (payment.amountInr !== plan.priceInr || payment.planId !== plan.id || payment.periodDays !== plan.periodDays) {
        payment = await this.prisma.hariharaaPayment.update({
          where: { id: payment.id },
          data: { amountInr: plan.priceInr, periodDays: plan.periodDays, planId: plan.id, planName: plan.name },
        });
      }
    } else {
      payment = await this.prisma.hariharaaPayment.create({
        data: {
          userId,
          amountInr: plan.priceInr,
          method: PaymentMethod.UPI_MANUAL,
          periodDays: plan.periodDays,
          planId: plan.id,
          planName: plan.name,
        },
      });
      await this.audit.log({
        actorId: userId,
        action: 'hariharaa.payment.start',
        entityType: 'HariharaaPayment',
        entityId: payment.id,
        metadata: { amountInr: payment.amountInr, plan: plan.name, periodDays: plan.periodDays },
      });
    }

    return {
      paymentId: payment.id,
      amountInr: payment.amountInr,
      planName: payment.planName,
      periodDays: payment.periodDays,
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

  // A UPI link/QR for any amount (used by shop orders too) — built here so the payee, UPI ID
  // and merchant id live in one place, and so the gateway swap touches one service.
  async buildPaymentLink(amountInr: number, note: string) {
    const settings = await this.getSettingsOrThrow();
    return {
      payeeName: settings.payeeName,
      upiLink: buildUpiLink({ vpa: settings.primaryUpiId, payeeName: settings.payeeName, amountInr, merchantAid: settings.upiAid, note }),
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
    // ...and the same bank reference cannot also be backing a shop order.
    if (await this.prisma.order.findFirst({ where: { paymentUtr: utr } })) throw this.utrTaken();

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
      const activeUntil = renewalStart(current);
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
  // ---------- Administrator: members & free access ----------

  // Everyone who can hold a membership, each with one plain label (Paid / Free / Awaiting
  // verification / Expired / Unpaid) so the Members screen reads at a glance.
  async listMembers() {
    const [users, claimed] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: { in: MEMBER_ROLES } },
        select: { id: true, userCode: true, name: true, mobileNumber: true, isActive: true, createdAt: true, hariharaaSubscription: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hariharaaPayment.findMany({ where: { status: HariharaaPaymentStatus.CLAIMED }, select: { userId: true } }),
    ]);
    const waiting = new Set(claimed.map((p) => p.userId));
    return users.map(({ hariharaaSubscription, ...u }) => {
      const access = computeAccess(hariharaaSubscription);
      return {
        ...u,
        label: memberLabel(access, waiting.has(u.id)),
        paidUntil: access.paidUntil,
        freeUntil: access.freeUntil,
        freeNote: hariharaaSubscription?.complimentaryNote ?? null,
      };
    });
  }

  // The manual exception to paying: an Administrator gives a member free access until a
  // date (e.g. for testing, or the existing farmers). Kept apart from paid days, capped
  // so it can't be set by accident to something like the year 2099, and always audited.
  async grantFreeAccess(userId: string, dto: GrantFreeAccessDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || !MEMBER_ROLES.includes(user.role)) {
      throw new NotFoundException(bi('Member not found', 'సభ్యుడు కనుగొనబడలేదు'));
    }
    const until = parseGrantUntil(dto.until);
    if (!until) throw new BadRequestException(bi('Enter a valid date', 'చెల్లుబాటు అయ్యే తేదీని నమోదు చేయండి'));
    if (until <= new Date()) throw new BadRequestException(bi('The date must be in the future', 'తేదీ భవిష్యత్తులో ఉండాలి'));
    if (until.getTime() - Date.now() > MAX_FREE_ACCESS_DAYS * 864e5) {
      throw new BadRequestException(bi('Free access can be granted for at most 2 years at a time', 'ఉచిత ప్రాప్యతను ఒకసారి గరిష్టంగా 2 సంవత్సరాలకు మాత్రమే ఇవ్వవచ్చు'));
    }
    const note = dto.note?.trim() || null;
    const data = { complimentaryUntil: until, complimentaryNote: note, complimentaryGrantedBy: adminId, complimentaryGrantedAt: new Date() };
    const updated = await this.prisma.hariharaaSubscription.upsert({ where: { userId }, create: { userId, ...data }, update: data });

    await this.audit.log({
      actorId: adminId,
      action: 'membership.free.grant',
      entityType: 'HariharaaSubscription',
      entityId: updated.id,
      metadata: { userId, until: until.toISOString(), note },
    });
    const shown = until.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    await this.notifications.create(
      userId,
      'membership.free.granted',
      bi('You have free access', 'మీకు ఉచిత ప్రాప్యత ఉంది'),
      bi(`Free access until ${shown}`, `${shown} వరకు ఉచిత ప్రాప్యత`),
      '/hariharaa/subscription',
    );
    return updated;
  }

  // Removes only the free grant — paid days are untouched.
  async revokeFreeAccess(userId: string, adminId: string) {
    const current = await this.prisma.hariharaaSubscription.findUnique({ where: { userId } });
    if (!current?.complimentaryUntil) {
      throw new NotFoundException(bi('This member has no free access to remove', 'ఈ సభ్యునికి తొలగించడానికి ఉచిత ప్రాప్యత లేదు'));
    }
    const updated = await this.prisma.hariharaaSubscription.update({
      where: { userId },
      data: { complimentaryUntil: null, complimentaryNote: null, complimentaryGrantedBy: null, complimentaryGrantedAt: null },
    });
    await this.audit.log({
      actorId: adminId,
      action: 'membership.free.revoke',
      entityType: 'HariharaaSubscription',
      entityId: updated.id,
      metadata: { userId, previousUntil: current.complimentaryUntil.toISOString() },
    });
    await this.notifications.create(
      userId,
      'membership.free.revoked',
      bi('Your free access has ended', 'మీ ఉచిత ప్రాప్యత ముగిసింది'),
      bi('Pay to continue using everything', 'అన్నింటినీ ఉపయోగించడం కొనసాగించడానికి చెల్లించండి'),
      '/hariharaa/subscription',
    );
    return updated;
  }
}

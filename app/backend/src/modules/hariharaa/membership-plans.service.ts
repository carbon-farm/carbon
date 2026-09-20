import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

const SETTINGS_ID = 'singleton';
const REQUIRED_CACHE_MS = 5000;

// What can be bought (plans), and whether buying is needed at all (the master switch).
// Kept apart from HariharaaService, which handles the payments themselves.
@Injectable()
export class MembershipPlansService {
  private requiredCache: { value: boolean; at: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------- The master switch ----------

  // True unless an Administrator has switched membership off. Asked on every guarded request,
  // so it is remembered for a few seconds; changing the switch clears that at once.
  async isMembershipRequired(): Promise<boolean> {
    if (this.requiredCache && Date.now() - this.requiredCache.at < REQUIRED_CACHE_MS) return this.requiredCache.value;
    const settings = await this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID }, select: { membershipRequired: true } });
    const value = settings?.membershipRequired ?? true;
    this.requiredCache = { value, at: Date.now() };
    return value;
  }

  async setMembershipRequired(required: boolean, adminId: string) {
    const settings = await this.prisma.hariharaaSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!settings) {
      throw new NotFoundException(bi('Save the payment details in Settings first', 'ముందుగా సెట్టింగ్‌లలో చెల్లింపు వివరాలను సేవ్ చేయండి'));
    }
    if (required && (await this.prisma.subscriptionPlan.count({ where: { isActive: true } })) === 0) {
      throw new BadRequestException(
        bi('Switch on at least one plan before requiring membership', 'సభ్యత్వాన్ని తప్పనిసరి చేసే ముందు కనీసం ఒక ప్లాన్‌ను ఆన్ చేయండి'),
      );
    }
    await this.prisma.hariharaaSettings.update({ where: { id: SETTINGS_ID }, data: { membershipRequired: required, updatedByUserId: adminId } });
    this.requiredCache = null;
    await this.audit.log({
      actorId: adminId,
      action: required ? 'membership.required.on' : 'membership.required.off',
      entityType: 'HariharaaSettings',
      entityId: SETTINGS_ID,
    });
    return { membershipRequired: required };
  }

  // ---------- Plans ----------

  listPublicPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { priceInr: 'asc' }],
      select: { id: true, name: true, nameTe: true, description: true, priceInr: true, periodDays: true },
    });
  }

  async listPlansForAdmin() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: [{ sortOrder: 'asc' }, { priceInr: 'asc' }],
      include: { _count: { select: { payments: true } } },
    });
    return plans.map(({ _count, ...p }) => ({ ...p, paymentCount: _count.payments }));
  }

  async createPlan(dto: CreatePlanDto, adminId: string) {
    const created = await this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name.trim(),
        nameTe: dto.nameTe?.trim() || null,
        description: dto.description?.trim() || null,
        priceInr: dto.priceInr,
        periodDays: dto.periodDays,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
    await this.audit.log({
      actorId: adminId,
      action: 'membership.plan.create',
      entityType: 'SubscriptionPlan',
      entityId: created.id,
      metadata: { name: created.name, priceInr: created.priceInr, periodDays: created.periodDays },
    });
    await this.syncLegacyPrice();
    return created;
  }

  async updatePlan(id: string, dto: UpdatePlanDto, adminId: string) {
    const existing = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(bi('Plan not found', 'ప్లాన్ కనుగొనబడలేదు'));

    // Members must always have something to buy while membership is required.
    if (dto.isActive === false && existing.isActive && (await this.isMembershipRequired())) {
      const otherActive = await this.prisma.subscriptionPlan.count({ where: { isActive: true, NOT: { id } } });
      if (otherActive === 0) {
        throw new BadRequestException(
          bi(
            'This is the only plan that is on. Switch on another plan first, or turn membership off',
            'ఇది ఆన్‌లో ఉన్న ఏకైక ప్లాన్. ముందుగా మరొక ప్లాన్‌ను ఆన్ చేయండి, లేదా సభ్యత్వాన్ని ఆఫ్ చేయండి',
          ),
        );
      }
    }

    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.nameTe !== undefined ? { nameTe: dto.nameTe.trim() || null } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
        ...(dto.priceInr !== undefined ? { priceInr: dto.priceInr } : {}),
        ...(dto.periodDays !== undefined ? { periodDays: dto.periodDays } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    await this.audit.log({
      actorId: adminId,
      action: dto.isActive === undefined ? 'membership.plan.update' : dto.isActive ? 'membership.plan.enable' : 'membership.plan.disable',
      entityType: 'SubscriptionPlan',
      entityId: id,
      metadata: { before: { priceInr: existing.priceInr, periodDays: existing.periodDays, isActive: existing.isActive }, after: { ...dto } },
    });
    await this.syncLegacyPrice();
    return updated;
  }

  // The plan a member is about to pay for: the one they chose, or the first that is on. An
  // unknown or switched-off plan is refused, so nobody can pay an old price.
  async getPlanForPurchase(planId?: string): Promise<SubscriptionPlan> {
    if (planId) {
      const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan || !plan.isActive) {
        throw new BadRequestException(bi('This plan is not available', 'ఈ ప్లాన్ అందుబాటులో లేదు'));
      }
      return plan;
    }
    const first = await this.prisma.subscriptionPlan.findFirst({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { priceInr: 'asc' }] });
    if (!first) {
      throw new NotFoundException(bi('No membership plan is available right now — check back soon', 'ప్రస్తుతం సభ్యత్వ ప్లాన్ అందుబాటులో లేదు — త్వరలో మళ్ళీ చూడండి'));
    }
    return first;
  }

  // The settings row still carries a single "price" column that older screens read; keep it
  // equal to the cheapest plan that is on so they never show a stale number.
  private async syncLegacyPrice() {
    const cheapest = await this.prisma.subscriptionPlan.findFirst({ where: { isActive: true }, orderBy: { priceInr: 'asc' } });
    if (cheapest) {
      await this.prisma.hariharaaSettings.updateMany({ where: { id: SETTINGS_ID }, data: { subscriptionPriceInr: cheapest.priceInr } });
    }
  }
}

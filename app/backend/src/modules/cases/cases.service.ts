import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Case, CaseStatus, ClosureReason, Role } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ExpertsService } from '../experts/experts.service';
import { bi } from '../../common/i18n';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { AssignCaseDto } from './dto/assign-case.dto';
import { RequestFollowUpDto, RespondFollowUpDto } from './dto/follow-up.dto';
import { AnswerCaseDto } from './dto/answer-case.dto';
import { ConfirmPriorityDto } from './dto/confirm-priority.dto';

// The Case Lifecycle state machine — 000-Project-Charter.md's Case Lifecycle
// (v0.3.0), ten states, every transition guarded here rather than trusted to
// callers. This is the one file where getting the Charter's own diagram
// wrong would be a real, farmer-facing bug, not just a modeling nicety.
@Injectable()
export class CasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly experts: ExpertsService,
  ) {}

  async createDraft(farmerId: string, dto: CreateCaseDto): Promise<Case> {
    await this.assertFarmLandOwnership(dto.farmLandId, farmerId);
    const created = await this.prisma.case.create({
      data: {
        farmerId,
        farmLandId: dto.farmLandId,
        categoryId: dto.categoryId,
        problemDescription: dto.problemDescription,
        evidenceNotes: dto.evidenceNotes,
        priorityRequested: dto.requestPriority ?? false,
        status: CaseStatus.DRAFT,
      },
    });
    await this.audit.log({
      actorId: farmerId,
      action: 'case.draft.create',
      entityType: 'Case',
      entityId: created.id,
    });
    return created;
  }

  async updateDraft(caseId: string, farmerId: string, dto: UpdateCaseDto): Promise<Case> {
    const existing = await this.getOwnedByFarmer(caseId, farmerId);
    this.assertStatus(existing, [CaseStatus.DRAFT], 'edit');
    if (dto.farmLandId) {
      await this.assertFarmLandOwnership(dto.farmLandId, farmerId);
    }
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: dto,
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: farmerId,
      action: 'case.draft.update',
      entityType: 'Case',
      entityId: caseId,
    });
    return updated;
  }

  async submit(caseId: string, farmerId: string): Promise<Case> {
    const existing = await this.getOwnedByFarmer(caseId, farmerId);
    this.assertStatus(existing, [CaseStatus.DRAFT], 'submit');

    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: {
        status: CaseStatus.SUBMITTED,
        caseNumber: this.generateCaseNumber(),
        submittedAt: new Date(),
      },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: farmerId,
      action: 'case.submit',
      entityType: 'Case',
      entityId: caseId,
      metadata: { caseNumber: updated.caseNumber },
    });
    return updated;
  }

  // Moderator: SUBMITTED -> UNDER_REVIEW. The Charter's own triage/completeness
  // check (Section 9.1) — separate from Assigned, which is a distinct action.
  async startReview(caseId: string, moderatorId: string): Promise<Case> {
    const existing = await this.getOrThrow(caseId);
    this.assertStatus(existing, [CaseStatus.SUBMITTED], 'move to review');
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: CaseStatus.UNDER_REVIEW },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: moderatorId,
      action: 'case.review.start',
      entityType: 'Case',
      entityId: caseId,
    });
    return updated;
  }

  // Moderator: UNDER_REVIEW -> ASSIGNED. Requires the expert's credentials to
  // actually be VERIFIED (Charter v0.4.0 / Risk R9) — this is the real
  // enforcement point, not just a UI affordance.
  async assign(caseId: string, moderatorId: string, dto: AssignCaseDto): Promise<Case> {
    const existing = await this.getOrThrow(caseId);
    this.assertStatus(existing, [CaseStatus.UNDER_REVIEW], 'assign');

    const expertVerified = await this.experts.isVerified(dto.expertId);
    if (!expertVerified) {
      throw new BadRequestException(
        bi('Cannot assign a case to an expert whose credentials are not verified', 'ధృవీకరించని నిపుణుడికి కేసును కేటాయించలేరు'),
      );
    }

    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: CaseStatus.ASSIGNED, assignedExpertId: dto.expertId },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: moderatorId,
      action: 'case.assign',
      entityType: 'Case',
      entityId: caseId,
      metadata: { expertId: dto.expertId },
    });
    return updated;
  }

  // Expert: ASSIGNED -> EXPERT_WORKING.
  async startWork(caseId: string, expertId: string): Promise<Case> {
    const existing = await this.getOwnedByExpert(caseId, expertId);
    this.assertStatus(existing, [CaseStatus.ASSIGNED], 'start work on');
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: CaseStatus.EXPERT_WORKING },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: expertId,
      action: 'case.work.start',
      entityType: 'Case',
      entityId: caseId,
    });
    return updated;
  }

  // Expert: EXPERT_WORKING -> WAITING_FARMER.
  async requestFollowUp(caseId: string, expertId: string, dto: RequestFollowUpDto): Promise<Case> {
    const existing = await this.getOwnedByExpert(caseId, expertId);
    this.assertStatus(existing, [CaseStatus.EXPERT_WORKING], 'request follow-up on');
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: CaseStatus.WAITING_FARMER, followUpQuestion: dto.question, followUpResponse: null },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: expertId,
      action: 'case.followup.request',
      entityType: 'Case',
      entityId: caseId,
    });
    return updated;
  }

  // Farmer: WAITING_FARMER -> EXPERT_WORKING (loops back per the Charter's
  // Case Lifecycle diagram — this is not a new state, it's a return trip).
  async respondFollowUp(caseId: string, farmerId: string, dto: RespondFollowUpDto): Promise<Case> {
    const existing = await this.getOwnedByFarmer(caseId, farmerId);
    this.assertStatus(existing, [CaseStatus.WAITING_FARMER], 'respond to');
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: CaseStatus.EXPERT_WORKING, followUpResponse: dto.answer },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: farmerId,
      action: 'case.followup.respond',
      entityType: 'Case',
      entityId: caseId,
    });
    return updated;
  }

  // Expert: EXPERT_WORKING -> ANSWERED.
  async answer(caseId: string, expertId: string, dto: AnswerCaseDto): Promise<Case> {
    const existing = await this.getOwnedByExpert(caseId, expertId);
    this.assertStatus(existing, [CaseStatus.EXPERT_WORKING], 'answer');
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: CaseStatus.ANSWERED, resolutionNotes: dto.resolutionNotes },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: expertId,
      action: 'case.answer',
      entityType: 'Case',
      entityId: caseId,
    });
    return updated;
  }

  // Farmer: ANSWERED -> FARMER_CONFIRMED -> CLOSED (Resolved). Charter models
  // Farmer Confirmed as a real state, but nothing else happens there — it
  // closes in the same transaction rather than waiting on a second action
  // nobody would ever take separately.
  async confirm(caseId: string, farmerId: string): Promise<Case> {
    const existing = await this.getOwnedByFarmer(caseId, farmerId);
    this.assertStatus(existing, [CaseStatus.ANSWERED], 'confirm');
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: {
        status: CaseStatus.CLOSED,
        closureReason: ClosureReason.RESOLVED,
        closedAt: new Date(),
      },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: farmerId,
      action: 'case.confirm',
      entityType: 'Case',
      entityId: caseId,
    });
    // Farmer Confirmed is real but transient — CLOSED is what the record
    // shows, exactly matching the Charter's own diagram (Answered -> Farmer
    // Confirmed -> Closed happen as one farmer action).
    return updated;
  }

  // Farmer: ANSWERED -> REOPENED -> EXPERT_WORKING (a dispute, not a new
  // Case — per Charter's Case glossary entry, a post-closure recurrence
  // becomes a *new*, linked Case; this path is only for disputing an answer
  // before ever confirming it).
  async dispute(caseId: string, farmerId: string): Promise<Case> {
    const existing = await this.getOwnedByFarmer(caseId, farmerId);
    this.assertStatus(existing, [CaseStatus.ANSWERED], 'dispute');
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: CaseStatus.EXPERT_WORKING },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId: farmerId,
      action: 'case.dispute',
      entityType: 'Case',
      entityId: caseId,
      metadata: { transientState: 'REOPENED' },
    });
    return updated;
  }

  // Administrator: WAITING_FARMER -> CLOSED (Abandoned), after the SLA
  // window. Manual for now — there's no scheduler wired up yet (Charter's
  // BullMQ recommendation isn't built), so this is triggered on demand
  // rather than automatically. That gap is real; see cases.module.ts note.
  async abandon(caseId: string, actorId: string): Promise<Case> {
    const existing = await this.getOrThrow(caseId);
    this.assertStatus(existing, [CaseStatus.WAITING_FARMER], 'abandon');
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status: CaseStatus.CLOSED, closureReason: ClosureReason.ABANDONED, closedAt: new Date() },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId,
      action: 'case.abandon',
      entityType: 'Case',
      entityId: caseId,
    });
    return updated;
  }

  // Moderator/Administrator: confirms or rejects a farmer's priority
  // request — the actual anti-abuse gate (Charter v0.3.0), separate from the
  // farmer's ask itself.
  async confirmPriority(caseId: string, actorId: string, dto: ConfirmPriorityDto): Promise<Case> {
    const existing = await this.getOrThrow(caseId);
    if (!existing.priorityRequested) {
      throw new BadRequestException(bi('This case did not request priority handling', 'ఈ కేసు ప్రాధాన్యతను అభ్యర్థించలేదు'));
    }
    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: {
        isPriority: dto.approve,
        priorityConfirmedBy: actorId,
      },
      include: { category: true, farmLand: true },
    });
    await this.audit.log({
      actorId,
      action: dto.approve ? 'case.priority.approve' : 'case.priority.reject',
      entityType: 'Case',
      entityId: caseId,
    });
    return updated;
  }

  async listMine(farmerId: string) {
    return this.prisma.case.findMany({
      where: { farmerId },
      orderBy: [{ isPriority: 'desc' }, { updatedAt: 'desc' }],
      include: { category: true, farmLand: true },
    });
  }

  async listAssigned(expertId: string) {
    return this.prisma.case.findMany({
      where: { assignedExpertId: expertId, status: { notIn: [CaseStatus.CLOSED] } },
      orderBy: [{ isPriority: 'desc' }, { submittedAt: 'asc' }],
      include: { category: true, farmLand: true },
    });
  }

  // Moderator triage queue: everything awaiting review or assignment.
  async listQueue() {
    return this.prisma.case.findMany({
      where: { status: { in: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW] } },
      orderBy: [{ isPriority: 'desc' }, { submittedAt: 'asc' }],
      include: { category: true, farmLand: true },
    });
  }

  async getById(caseId: string, requester: { userId: string; role: Role }) {
    const found = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: { category: true, farmLand: true },
    });
    if (!found) throw new NotFoundException(bi('Case not found', 'కేసు కనుగొనబడలేదు'));

    const isOwnerFarmer = found.farmerId === requester.userId;
    const isAssignedExpert = found.assignedExpertId === requester.userId;
    const isStaff = requester.role === Role.MODERATOR || requester.role === Role.ADMINISTRATOR;
    if (!isOwnerFarmer && !isAssignedExpert && !isStaff) {
      throw new ForbiddenException(bi('You do not have access to this case', 'మీకు ఈ కేసుకు ప్రాప్యత లేదు'));
    }
    return found;
  }

  private async getOrThrow(caseId: string): Promise<Case> {
    const found = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!found) throw new NotFoundException(bi('Case not found', 'కేసు కనుగొనబడలేదు'));
    return found;
  }

  private async getOwnedByFarmer(caseId: string, farmerId: string): Promise<Case> {
    const found = await this.getOrThrow(caseId);
    if (found.farmerId !== farmerId) {
      throw new ForbiddenException(bi('This case does not belong to you', 'ఈ కేసు మీది కాదు'));
    }
    return found;
  }

  private async getOwnedByExpert(caseId: string, expertId: string): Promise<Case> {
    const found = await this.getOrThrow(caseId);
    if (found.assignedExpertId !== expertId) {
      throw new ForbiddenException(bi('This case is not assigned to you', 'ఈ కేసు మీకు కేటాయించబడలేదు'));
    }
    return found;
  }

  private async assertFarmLandOwnership(farmLandId: string, farmerId: string): Promise<void> {
    const farmLand = await this.prisma.farmLand.findUnique({ where: { id: farmLandId } });
    if (!farmLand || farmLand.farmerId !== farmerId) {
      throw new ForbiddenException(bi('This Farm/Land parcel does not belong to you', 'ఈ పొలం స్థలం మీది కాదు'));
    }
  }

  private assertStatus(existing: Case, allowed: CaseStatus[], actionEn: string): void {
    if (!allowed.includes(existing.status)) {
      throw new BadRequestException(
        bi(
          `Cannot ${actionEn} a case in ${existing.status} status`,
          `${existing.status} స్థితిలో ఉన్న కేసును ${actionEn} చేయలేరు`,
        ),
      );
    }
  }

  private generateCaseNumber(): string {
    // Short, farmer-readable, collision-safe without a DB sequence. A real
    // sequential number (CASE-2026-000042) is a nicer UX but needs a proper
    // counter/sequence to stay race-free under concurrent submissions — left
    // as a follow-up, not attempted with a fake "count + 1" that would race.
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CASE-${year}-${random}`;
  }
}

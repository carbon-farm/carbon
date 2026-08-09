import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Case, CaseStatus, ClosureReason, Role } from '@prisma/client';
import { CasesService } from './cases.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ExpertsService } from '../experts/experts.service';

// The guarded state machine behind 000-Project-Charter.md's ten-state Case
// Lifecycle — only ever exercised manually via curl until now. This suite
// covers every guard (status transitions, ownership checks, the
// expert-verification gate on assign, the priority-confirmation gate) so a
// future change to this file can't silently break the lifecycle.

function buildCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'case-1',
    caseNumber: null,
    farmerId: 'farmer-1',
    farmLandId: 'farmland-1',
    categoryId: 'category-1',
    problemDescription: 'Leaves have yellow spots.',
    evidenceNotes: null,
    status: CaseStatus.DRAFT,
    closureReason: null,
    assignedExpertId: null,
    priorityRequested: false,
    isPriority: false,
    priorityConfirmedBy: null,
    followUpQuestion: null,
    followUpResponse: null,
    resolutionNotes: null,
    submittedAt: null,
    closedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('CasesService', () => {
  let prisma: {
    case: { create: jest.Mock; update: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock };
    farmLand: { findUnique: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let experts: { isVerified: jest.Mock };
  let service: CasesService;

  beforeEach(() => {
    prisma = {
      case: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
      farmLand: { findUnique: jest.fn() },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    experts = { isVerified: jest.fn() };
    service = new CasesService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditService,
      experts as unknown as ExpertsService,
    );
  });

  describe('createDraft', () => {
    it('creates a DRAFT case when the farmer owns the Farm/Land parcel', async () => {
      prisma.farmLand.findUnique.mockResolvedValue({ id: 'farmland-1', farmerId: 'farmer-1' });
      prisma.case.create.mockResolvedValue(buildCase());

      await service.createDraft('farmer-1', {
        farmLandId: 'farmland-1',
        categoryId: 'category-1',
        problemDescription: 'Leaves have yellow spots.',
      });

      expect(prisma.case.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: CaseStatus.DRAFT, farmerId: 'farmer-1' }) }),
      );
    });

    it('rejects a Farm/Land parcel the farmer does not own', async () => {
      prisma.farmLand.findUnique.mockResolvedValue({ id: 'farmland-1', farmerId: 'someone-else' });

      await expect(
        service.createDraft('farmer-1', {
          farmLandId: 'farmland-1',
          categoryId: 'category-1',
          problemDescription: 'Leaves have yellow spots.',
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.case.create).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('moves a DRAFT case to SUBMITTED and assigns a case number', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.DRAFT }));
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.submit('case-1', 'farmer-1');

      expect(result.status).toBe(CaseStatus.SUBMITTED);
      expect(result.caseNumber).toMatch(/^CASE-\d{4}-[0-9A-F]+$/);
    });

    it('refuses to submit a case that is not DRAFT', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.SUBMITTED }));

      await expect(service.submit('case-1', 'farmer-1')).rejects.toThrow(BadRequestException);
    });

    it('refuses to submit a case belonging to a different farmer', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.DRAFT, farmerId: 'someone-else' }));

      await expect(service.submit('case-1', 'farmer-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assign', () => {
    it('refuses to assign a case to an unverified expert', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.UNDER_REVIEW }));
      experts.isVerified.mockResolvedValue(false);

      await expect(service.assign('case-1', 'mod-1', { expertId: 'expert-1' })).rejects.toThrow(BadRequestException);
      expect(prisma.case.update).not.toHaveBeenCalled();
    });

    it('assigns a case to a verified expert', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.UNDER_REVIEW }));
      experts.isVerified.mockResolvedValue(true);
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.assign('case-1', 'mod-1', { expertId: 'expert-1' });

      expect(result.status).toBe(CaseStatus.ASSIGNED);
      expect(result.assignedExpertId).toBe('expert-1');
    });

    it('refuses to assign a case that is not UNDER_REVIEW', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.SUBMITTED }));
      experts.isVerified.mockResolvedValue(true);

      await expect(service.assign('case-1', 'mod-1', { expertId: 'expert-1' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('startWork', () => {
    it('lets the assigned expert start work', async () => {
      prisma.case.findUnique.mockResolvedValue(
        buildCase({ status: CaseStatus.ASSIGNED, assignedExpertId: 'expert-1' }),
      );
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.startWork('case-1', 'expert-1');
      expect(result.status).toBe(CaseStatus.EXPERT_WORKING);
    });

    it('refuses a different expert', async () => {
      prisma.case.findUnique.mockResolvedValue(
        buildCase({ status: CaseStatus.ASSIGNED, assignedExpertId: 'expert-1' }),
      );

      await expect(service.startWork('case-1', 'expert-2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('follow-up round trip', () => {
    it('requestFollowUp moves EXPERT_WORKING -> WAITING_FARMER and records the question', async () => {
      prisma.case.findUnique.mockResolvedValue(
        buildCase({ status: CaseStatus.EXPERT_WORKING, assignedExpertId: 'expert-1' }),
      );
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.requestFollowUp('case-1', 'expert-1', { question: 'Any pests visible?' });
      expect(result.status).toBe(CaseStatus.WAITING_FARMER);
      expect(result.followUpQuestion).toBe('Any pests visible?');
    });

    it('respondFollowUp moves WAITING_FARMER -> EXPERT_WORKING and records the answer', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.WAITING_FARMER, farmerId: 'farmer-1' }));
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.respondFollowUp('case-1', 'farmer-1', { answer: 'Yes, tiny white bugs.' });
      expect(result.status).toBe(CaseStatus.EXPERT_WORKING);
      expect(result.followUpResponse).toBe('Yes, tiny white bugs.');
    });

    it('respondFollowUp refuses a farmer who does not own the case', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.WAITING_FARMER, farmerId: 'farmer-1' }));

      await expect(service.respondFollowUp('case-1', 'someone-else', { answer: 'x' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('answer / confirm / dispute', () => {
    it('answer moves EXPERT_WORKING -> ANSWERED and records resolutionNotes', async () => {
      prisma.case.findUnique.mockResolvedValue(
        buildCase({ status: CaseStatus.EXPERT_WORKING, assignedExpertId: 'expert-1' }),
      );
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.answer('case-1', 'expert-1', { resolutionNotes: 'Spray neem oil.' });
      expect(result.status).toBe(CaseStatus.ANSWERED);
      expect(result.resolutionNotes).toBe('Spray neem oil.');
    });

    it('confirm closes the case as RESOLVED', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.ANSWERED, farmerId: 'farmer-1' }));
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.confirm('case-1', 'farmer-1');
      expect(result.status).toBe(CaseStatus.CLOSED);
      expect(result.closureReason).toBe(ClosureReason.RESOLVED);
    });

    it('dispute sends an answered case back to EXPERT_WORKING', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.ANSWERED, farmerId: 'farmer-1' }));
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.dispute('case-1', 'farmer-1');
      expect(result.status).toBe(CaseStatus.EXPERT_WORKING);
    });

    it('refuses to confirm a case that is not ANSWERED', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.EXPERT_WORKING, farmerId: 'farmer-1' }));

      await expect(service.confirm('case-1', 'farmer-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('abandon', () => {
    it('closes a WAITING_FARMER case as ABANDONED', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.WAITING_FARMER }));
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.abandon('case-1', 'admin-1');
      expect(result.status).toBe(CaseStatus.CLOSED);
      expect(result.closureReason).toBe(ClosureReason.ABANDONED);
    });

    it('refuses to abandon a case that is not WAITING_FARMER', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.EXPERT_WORKING }));

      await expect(service.abandon('case-1', 'admin-1')).rejects.toThrow(BadRequestException);
    });

    it('allows a system-triggered abandon with no actor (the scheduler sweep)', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ status: CaseStatus.WAITING_FARMER }));
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.abandon('case-1');
      expect(result.status).toBe(CaseStatus.CLOSED);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ actorId: undefined, metadata: { trigger: 'scheduler' } }),
      );
    });
  });

  describe('confirmPriority', () => {
    it('refuses when the case never requested priority', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ priorityRequested: false }));

      await expect(service.confirmPriority('case-1', 'mod-1', { approve: true })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.case.update).not.toHaveBeenCalled();
    });

    it('sets isPriority and priorityConfirmedBy on approval', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ priorityRequested: true }));
      prisma.case.update.mockImplementation(({ data }) => Promise.resolve(buildCase({ ...data })));

      const result = await service.confirmPriority('case-1', 'mod-1', { approve: true });
      expect(result.isPriority).toBe(true);
      expect(result.priorityConfirmedBy).toBe('mod-1');
    });
  });

  describe('findStaleWaitingFarmer', () => {
    it('queries only WAITING_FARMER cases updated before the cutoff', async () => {
      prisma.case.findMany.mockResolvedValue([{ id: 'case-1' }]);
      const cutoff = new Date('2026-01-01');

      const result = await service.findStaleWaitingFarmer(cutoff);

      expect(prisma.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: CaseStatus.WAITING_FARMER, updatedAt: { lt: cutoff } },
        }),
      );
      expect(result).toEqual([{ id: 'case-1' }]);
    });
  });

  describe('getById access control', () => {
    it('returns the case to its owning farmer', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ farmerId: 'farmer-1' }));
      const result = await service.getById('case-1', { userId: 'farmer-1', role: Role.FARMER });
      expect(result.id).toBe('case-1');
    });

    it('returns the case to its assigned expert', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ assignedExpertId: 'expert-1' }));
      const result = await service.getById('case-1', { userId: 'expert-1', role: Role.EXPERT });
      expect(result.id).toBe('case-1');
    });

    it('returns the case to Moderator/Administrator staff regardless of ownership', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ farmerId: 'farmer-1', assignedExpertId: 'expert-1' }));
      const result = await service.getById('case-1', { userId: 'mod-1', role: Role.MODERATOR });
      expect(result.id).toBe('case-1');
    });

    it('refuses an unrelated farmer', async () => {
      prisma.case.findUnique.mockResolvedValue(buildCase({ farmerId: 'farmer-1' }));
      await expect(service.getById('case-1', { userId: 'someone-else', role: Role.FARMER })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException for a case that does not exist', async () => {
      prisma.case.findUnique.mockResolvedValue(null);
      await expect(service.getById('missing', { userId: 'farmer-1', role: Role.FARMER })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

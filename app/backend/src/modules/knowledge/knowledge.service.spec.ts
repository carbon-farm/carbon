import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Case, CaseStatus, ClosureReason, KnowledgeArticle, KnowledgeArticleStatus, Role } from '@prisma/client';
import { KnowledgeService } from './knowledge.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

function buildArticle(overrides: Partial<KnowledgeArticle> = {}): KnowledgeArticle {
  return {
    id: 'article-1',
    sourceCaseId: 'case-1',
    authorId: 'expert-1',
    title: 'Chilli — Pest',
    cropId: null,
    categoryId: 'category-1',
    symptoms: null,
    problemDescription: 'Leaves have yellow spots.',
    expertSolution: 'Spray neem oil solution every 5 days for 3 rounds.',
    evidenceMediaUrls: [],
    status: KnowledgeArticleStatus.DRAFT,
    rejectionReason: null,
    reviewedByUserId: null,
    version: 1,
    publishedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildClosedCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'case-1',
    caseNumber: 'CASE-2026-ABC123',
    farmerId: 'farmer-1',
    farmLandId: 'farmland-1',
    categoryId: 'category-1',
    cropId: 'crop-1',
    problemDescription: 'Leaves have yellow spots.',
    evidenceNotes: null,
    evidenceMediaUrls: ['https://example.supabase.co/leaf.jpg'],
    status: CaseStatus.CLOSED,
    closureReason: ClosureReason.RESOLVED,
    assignedExpertId: 'expert-1',
    priorityRequested: false,
    isPriority: false,
    priorityConfirmedBy: null,
    followUpQuestion: null,
    followUpResponse: null,
    resolutionNotes: 'Spray neem oil solution every 5 days for 3 rounds.',
    submittedAt: new Date('2026-01-01'),
    closedAt: new Date('2026-01-02'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
    ...overrides,
  };
}

describe('KnowledgeService', () => {
  let prisma: {
    knowledgeArticle: { create: jest.Mock; update: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock };
    caseCategoryMaster: { findUnique: jest.Mock };
    cropMaster: { findUnique: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let notifications: { create: jest.Mock; notifyRole: jest.Mock };
  let service: KnowledgeService;

  beforeEach(() => {
    prisma = {
      knowledgeArticle: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
      caseCategoryMaster: { findUnique: jest.fn() },
      cropMaster: { findUnique: jest.fn() },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    notifications = { create: jest.fn().mockResolvedValue(undefined), notifyRole: jest.fn().mockResolvedValue(undefined) };
    service = new KnowledgeService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditService,
      notifications as unknown as NotificationsService,
    );
  });

  describe('createDraftFromCase', () => {
    it('auto-generates a DRAFT article carrying the case\'s problem/solution/media', async () => {
      prisma.caseCategoryMaster.findUnique.mockResolvedValue({ id: 'category-1', name: 'Pest' });
      prisma.cropMaster.findUnique.mockResolvedValue({ id: 'crop-1', name: 'Chilli' });
      prisma.knowledgeArticle.create.mockResolvedValue(buildArticle());

      await service.createDraftFromCase(buildClosedCase());

      expect(prisma.knowledgeArticle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sourceCaseId: 'case-1',
            authorId: 'expert-1',
            title: 'Chilli — Pest',
            problemDescription: 'Leaves have yellow spots.',
            expertSolution: 'Spray neem oil solution every 5 days for 3 rounds.',
            evidenceMediaUrls: ['https://example.supabase.co/leaf.jpg'],
            status: KnowledgeArticleStatus.DRAFT,
          }),
        }),
      );
    });

    it('does nothing for a case with no assigned expert (no one to attribute authorship to)', async () => {
      const result = await service.createDraftFromCase(buildClosedCase({ assignedExpertId: null }));
      expect(result).toBeNull();
      expect(prisma.knowledgeArticle.create).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('moves DRAFT -> PENDING_REVIEW and bumps the version counter', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.DRAFT }));
      prisma.knowledgeArticle.update.mockImplementation(({ data }) =>
        Promise.resolve(buildArticle({ status: data.status, version: 2 })),
      );

      const result = await service.submit('article-1', 'expert-1');
      expect(result.status).toBe(KnowledgeArticleStatus.PENDING_REVIEW);
      expect(prisma.knowledgeArticle.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ version: { increment: 1 } }) }),
      );
    });

    it('also allows submitting a REJECTED article (resubmission after feedback)', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(
        buildArticle({ status: KnowledgeArticleStatus.REJECTED, rejectionReason: 'Too vague' }),
      );
      prisma.knowledgeArticle.update.mockImplementation(({ data }) => Promise.resolve(buildArticle({ ...data })));

      const result = await service.submit('article-1', 'expert-1');
      expect(result.status).toBe(KnowledgeArticleStatus.PENDING_REVIEW);
    });

    it('refuses to submit someone else\'s article', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ authorId: 'expert-1' }));
      await expect(service.submit('article-1', 'expert-2')).rejects.toThrow(ForbiddenException);
    });

    it('refuses to submit a PUBLISHED article', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.PUBLISHED }));
      await expect(service.submit('article-1', 'expert-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve / reject', () => {
    it('approve publishes a PENDING_REVIEW article', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.PENDING_REVIEW }));
      prisma.knowledgeArticle.update.mockImplementation(({ data }) => Promise.resolve(buildArticle({ ...data })));

      const result = await service.approve('article-1', 'mod-1');
      expect(result.status).toBe(KnowledgeArticleStatus.PUBLISHED);
    });

    it('reject sends it back with a reason, not silently', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.PENDING_REVIEW }));
      prisma.knowledgeArticle.update.mockImplementation(({ data }) => Promise.resolve(buildArticle({ ...data })));

      const result = await service.reject('article-1', 'mod-1', { reason: 'Missing dosage details' });
      expect(result.status).toBe(KnowledgeArticleStatus.REJECTED);
      expect(result.rejectionReason).toBe('Missing dosage details');
    });

    it('refuses to approve an article that is not PENDING_REVIEW', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.DRAFT }));
      await expect(service.approve('article-1', 'mod-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateDraft', () => {
    it('editing a REJECTED article clears the rejection and returns it to DRAFT', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(
        buildArticle({ status: KnowledgeArticleStatus.REJECTED, rejectionReason: 'Too vague' }),
      );
      prisma.knowledgeArticle.update.mockImplementation(({ data }) => Promise.resolve(buildArticle({ ...data })));

      const result = await service.updateDraft('article-1', 'expert-1', { expertSolution: 'A more detailed rewrite.' });
      expect(result.status).toBe(KnowledgeArticleStatus.DRAFT);
      expect(result.rejectionReason).toBeNull();
    });

    it('sets tags via the relation connect syntax when tagIds is provided', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.DRAFT }));
      prisma.knowledgeArticle.update.mockResolvedValue(buildArticle());

      await service.updateDraft('article-1', 'expert-1', { tagIds: ['tag-1', 'tag-2'] });
      expect(prisma.knowledgeArticle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tags: { set: [{ id: 'tag-1' }, { id: 'tag-2' }] } }),
        }),
      );
    });

    it('refuses to edit a PUBLISHED article', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.PUBLISHED }));
      await expect(service.updateDraft('article-1', 'expert-1', { title: 'New title' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getById access control', () => {
    it('returns a PUBLISHED article to anyone', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.PUBLISHED }));
      const result = await service.getById('article-1', { userId: 'farmer-1', role: Role.FARMER });
      expect(result.id).toBe('article-1');
    });

    it('returns a DRAFT article to its own author', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ authorId: 'expert-1' }));
      const result = await service.getById('article-1', { userId: 'expert-1', role: Role.EXPERT });
      expect(result.id).toBe('article-1');
    });

    it('returns a DRAFT article to Moderator/Administrator staff', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ authorId: 'expert-1' }));
      const result = await service.getById('article-1', { userId: 'mod-1', role: Role.MODERATOR });
      expect(result.id).toBe('article-1');
    });

    it('refuses a farmer trying to read a DRAFT article', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ authorId: 'expert-1' }));
      await expect(service.getById('article-1', { userId: 'farmer-1', role: Role.FARMER })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException for a missing article', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(null);
      await expect(service.getById('missing', { userId: 'farmer-1', role: Role.FARMER })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

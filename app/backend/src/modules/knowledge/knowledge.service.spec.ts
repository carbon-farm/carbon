import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { KnowledgeArticle, KnowledgeArticleStatus, Role } from '@prisma/client';
import { KnowledgeService } from './knowledge.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

function buildArticle(overrides: Partial<KnowledgeArticle> = {}): KnowledgeArticle {
  return {
    id: 'article-1',
    authorId: 'expert-1',
    title: 'Managing whiteflies in chilli',
    content: 'Spray neem oil solution every 5 days for 3 rounds, focusing on the underside of leaves.',
    categoryId: null,
    status: KnowledgeArticleStatus.DRAFT,
    rejectionReason: null,
    reviewedByUserId: null,
    publishedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('KnowledgeService', () => {
  let prisma: { knowledgeArticle: { create: jest.Mock; update: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock } };
  let audit: { log: jest.Mock };
  let service: KnowledgeService;

  beforeEach(() => {
    prisma = {
      knowledgeArticle: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new KnowledgeService(prisma as unknown as PrismaService, audit as unknown as AuditService);
  });

  describe('createDraft', () => {
    it('creates a DRAFT article', async () => {
      prisma.knowledgeArticle.create.mockResolvedValue(buildArticle());
      await service.createDraft('expert-1', { title: 'Managing whiteflies in chilli', content: 'Spray neem oil...' });
      expect(prisma.knowledgeArticle.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ authorId: 'expert-1' }) }),
      );
    });
  });

  describe('submit', () => {
    it('moves DRAFT -> PENDING_REVIEW', async () => {
      prisma.knowledgeArticle.findUnique.mockResolvedValue(buildArticle({ status: KnowledgeArticleStatus.DRAFT }));
      prisma.knowledgeArticle.update.mockImplementation(({ data }) => Promise.resolve(buildArticle({ ...data })));

      const result = await service.submit('article-1', 'expert-1');
      expect(result.status).toBe(KnowledgeArticleStatus.PENDING_REVIEW);
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

      const result = await service.updateDraft('article-1', 'expert-1', { content: 'A more detailed rewrite.' });
      expect(result.status).toBe(KnowledgeArticleStatus.DRAFT);
      expect(result.rejectionReason).toBeNull();
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

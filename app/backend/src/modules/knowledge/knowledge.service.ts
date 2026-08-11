import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Case, KnowledgeArticle, KnowledgeArticleStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RejectArticleDto } from './dto/reject-article.dto';

const ARTICLE_INCLUDE = {
  category: true,
  crop: true,
  tags: true,
  author: { select: { id: true, name: true } },
} as const;

// Module 3 — Knowledge Repository publication workflow: Draft (auto-generated) ->
// Pending Review -> Published, gated by a Moderator. Deliberately simpler
// than the Case Lifecycle's ten states: an article either needs work, is
// waiting on a Moderator, is live, or was sent back — there's no
// multi-party back-and-forth like a Case's follow-up loop.
@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Called by CasesService.confirm() when a case closes as Resolved — never
  // invoked directly from a controller, per Charter Section 9.1: "Closed
  // case -> Draft Article (auto-generated) -> Moderator Approval ->
  // Published." No case without an assigned expert can generate one (no
  // author to attribute "Created By" to).
  async createDraftFromCase(closedCase: Case): Promise<KnowledgeArticle | null> {
    if (!closedCase.assignedExpertId) return null;

    const category = closedCase.categoryId
      ? await this.prisma.caseCategoryMaster.findUnique({ where: { id: closedCase.categoryId } })
      : null;
    const crop = closedCase.cropId
      ? await this.prisma.cropMaster.findUnique({ where: { id: closedCase.cropId } })
      : null;
    const title = [crop?.name, category?.name].filter(Boolean).join(' — ') || `Case ${closedCase.caseNumber ?? closedCase.id}`;

    const created = await this.prisma.knowledgeArticle.create({
      data: {
        sourceCaseId: closedCase.id,
        authorId: closedCase.assignedExpertId,
        title,
        cropId: closedCase.cropId,
        categoryId: closedCase.categoryId,
        problemDescription: closedCase.problemDescription,
        expertSolution: closedCase.resolutionNotes ?? '',
        evidenceMediaUrls: closedCase.evidenceMediaUrls,
        status: KnowledgeArticleStatus.DRAFT,
      },
      include: ARTICLE_INCLUDE,
    });
    await this.audit.log({
      action: 'knowledge.draft.autogenerate',
      entityType: 'KnowledgeArticle',
      entityId: created.id,
      metadata: { sourceCaseId: closedCase.id },
    });
    return created;
  }

  // Editable from DRAFT or REJECTED — a rejection isn't a dead end, it's
  // feedback the author can act on and resubmit.
  async updateDraft(articleId: string, authorId: string, dto: UpdateArticleDto): Promise<KnowledgeArticle> {
    const existing = await this.getOwnedByAuthor(articleId, authorId);
    this.assertStatus(existing, [KnowledgeArticleStatus.DRAFT, KnowledgeArticleStatus.REJECTED], 'edit');
    const { tagIds, ...rest } = dto;
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        ...rest,
        status: KnowledgeArticleStatus.DRAFT,
        rejectionReason: null,
        ...(tagIds ? { tags: { set: tagIds.map((id) => ({ id })) } } : {}),
      },
      include: ARTICLE_INCLUDE,
    });
    await this.audit.log({
      actorId: authorId,
      action: 'knowledge.draft.update',
      entityType: 'KnowledgeArticle',
      entityId: articleId,
    });
    return updated;
  }

  // Each submission bumps `version` — a simple counter tracking "this is
  // attempt N," not the immutable version history the Charter's "never
  // overwritten" language implies (see schema.prisma's note on that gap).
  async submit(articleId: string, authorId: string): Promise<KnowledgeArticle> {
    const existing = await this.getOwnedByAuthor(articleId, authorId);
    this.assertStatus(existing, [KnowledgeArticleStatus.DRAFT, KnowledgeArticleStatus.REJECTED], 'submit');
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: { status: KnowledgeArticleStatus.PENDING_REVIEW, rejectionReason: null, version: { increment: 1 } },
      include: ARTICLE_INCLUDE,
    });
    await this.audit.log({
      actorId: authorId,
      action: 'knowledge.submit',
      entityType: 'KnowledgeArticle',
      entityId: articleId,
    });
    return updated;
  }

  async approve(articleId: string, moderatorId: string): Promise<KnowledgeArticle> {
    const existing = await this.getOrThrow(articleId);
    this.assertStatus(existing, [KnowledgeArticleStatus.PENDING_REVIEW], 'approve');
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: { status: KnowledgeArticleStatus.PUBLISHED, reviewedByUserId: moderatorId, publishedAt: new Date() },
      include: ARTICLE_INCLUDE,
    });
    await this.audit.log({
      actorId: moderatorId,
      action: 'knowledge.approve',
      entityType: 'KnowledgeArticle',
      entityId: articleId,
    });
    return updated;
  }

  async reject(articleId: string, moderatorId: string, dto: RejectArticleDto): Promise<KnowledgeArticle> {
    const existing = await this.getOrThrow(articleId);
    this.assertStatus(existing, [KnowledgeArticleStatus.PENDING_REVIEW], 'reject');
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: { status: KnowledgeArticleStatus.REJECTED, reviewedByUserId: moderatorId, rejectionReason: dto.reason },
      include: ARTICLE_INCLUDE,
    });
    await this.audit.log({
      actorId: moderatorId,
      action: 'knowledge.reject',
      entityType: 'KnowledgeArticle',
      entityId: articleId,
      metadata: { reason: dto.reason },
    });
    return updated;
  }

  async listMine(authorId: string) {
    return this.prisma.knowledgeArticle.findMany({
      where: { authorId },
      orderBy: { updatedAt: 'desc' },
      include: ARTICLE_INCLUDE,
    });
  }

  async listPendingReview() {
    return this.prisma.knowledgeArticle.findMany({
      where: { status: KnowledgeArticleStatus.PENDING_REVIEW },
      orderBy: { updatedAt: 'asc' },
      include: ARTICLE_INCLUDE,
    });
  }

  // Farmer-facing browse: only ever PUBLISHED, optionally narrowed by topic.
  async listPublished(categoryId?: string) {
    return this.prisma.knowledgeArticle.findMany({
      where: { status: KnowledgeArticleStatus.PUBLISHED, ...(categoryId ? { categoryId } : {}) },
      orderBy: { publishedAt: 'desc' },
      include: ARTICLE_INCLUDE,
    });
  }

  async getById(articleId: string, requester: { userId: string; role: Role }) {
    const found = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId },
      include: ARTICLE_INCLUDE,
    });
    if (!found) throw new NotFoundException(bi('Article not found', 'వ్యాసం కనుగొనబడలేదు'));

    const isAuthor = found.authorId === requester.userId;
    const isStaff = requester.role === Role.MODERATOR || requester.role === Role.ADMINISTRATOR;
    const isPublished = found.status === KnowledgeArticleStatus.PUBLISHED;
    if (!isAuthor && !isStaff && !isPublished) {
      throw new ForbiddenException(bi('You do not have access to this article', 'మీకు ఈ వ్యాసానికి ప్రాప్యత లేదు'));
    }
    return found;
  }

  private async getOrThrow(articleId: string): Promise<KnowledgeArticle> {
    const found = await this.prisma.knowledgeArticle.findUnique({ where: { id: articleId } });
    if (!found) throw new NotFoundException(bi('Article not found', 'వ్యాసం కనుగొనబడలేదు'));
    return found;
  }

  private async getOwnedByAuthor(articleId: string, authorId: string): Promise<KnowledgeArticle> {
    const found = await this.getOrThrow(articleId);
    if (found.authorId !== authorId) {
      throw new ForbiddenException(bi('This article does not belong to you', 'ఈ వ్యాసం మీది కాదు'));
    }
    return found;
  }

  private assertStatus(existing: KnowledgeArticle, allowed: KnowledgeArticleStatus[], actionEn: string): void {
    if (!allowed.includes(existing.status)) {
      throw new BadRequestException(
        bi(
          `Cannot ${actionEn} an article in ${existing.status} status`,
          `${existing.status} స్థితిలో ఉన్న వ్యాసాన్ని ${actionEn} చేయలేరు`,
        ),
      );
    }
  }
}

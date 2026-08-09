import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { KnowledgeArticle, KnowledgeArticleStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RejectArticleDto } from './dto/reject-article.dto';

// Knowledge Repository publication workflow — Draft -> Pending Review ->
// Published, gated by a Moderator. Deliberately simpler than the Case
// Lifecycle's ten states: an article either needs work, is waiting on a
// Moderator, is live, or was sent back — there's no multi-party
// back-and-forth like a Case's follow-up loop.
@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createDraft(authorId: string, dto: CreateArticleDto): Promise<KnowledgeArticle> {
    const created = await this.prisma.knowledgeArticle.create({
      data: { authorId, title: dto.title, content: dto.content, categoryId: dto.categoryId },
      include: { category: true },
    });
    await this.audit.log({
      actorId: authorId,
      action: 'knowledge.draft.create',
      entityType: 'KnowledgeArticle',
      entityId: created.id,
    });
    return created;
  }

  // Editable from DRAFT or REJECTED — a rejection isn't a dead end, it's
  // feedback the author can act on and resubmit.
  async updateDraft(articleId: string, authorId: string, dto: UpdateArticleDto): Promise<KnowledgeArticle> {
    const existing = await this.getOwnedByAuthor(articleId, authorId);
    this.assertStatus(existing, [KnowledgeArticleStatus.DRAFT, KnowledgeArticleStatus.REJECTED], 'edit');
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: { ...dto, status: KnowledgeArticleStatus.DRAFT, rejectionReason: null },
      include: { category: true },
    });
    await this.audit.log({
      actorId: authorId,
      action: 'knowledge.draft.update',
      entityType: 'KnowledgeArticle',
      entityId: articleId,
    });
    return updated;
  }

  async submit(articleId: string, authorId: string): Promise<KnowledgeArticle> {
    const existing = await this.getOwnedByAuthor(articleId, authorId);
    this.assertStatus(existing, [KnowledgeArticleStatus.DRAFT, KnowledgeArticleStatus.REJECTED], 'submit');
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: { status: KnowledgeArticleStatus.PENDING_REVIEW, rejectionReason: null },
      include: { category: true },
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
      include: { category: true },
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
      include: { category: true },
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
      include: { category: true },
    });
  }

  async listPendingReview() {
    return this.prisma.knowledgeArticle.findMany({
      where: { status: KnowledgeArticleStatus.PENDING_REVIEW },
      orderBy: { updatedAt: 'asc' },
      include: { category: true, author: { select: { id: true, name: true } } },
    });
  }

  // Farmer-facing browse: only ever PUBLISHED, optionally narrowed by topic.
  async listPublished(categoryId?: string) {
    return this.prisma.knowledgeArticle.findMany({
      where: { status: KnowledgeArticleStatus.PUBLISHED, ...(categoryId ? { categoryId } : {}) },
      orderBy: { publishedAt: 'desc' },
      include: { category: true, author: { select: { id: true, name: true } } },
    });
  }

  async getById(articleId: string, requester: { userId: string; role: Role }) {
    const found = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId },
      include: { category: true, author: { select: { id: true, name: true } } },
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

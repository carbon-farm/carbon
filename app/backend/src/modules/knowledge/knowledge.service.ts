import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Case, KnowledgeArticle, KnowledgeArticleStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { bi } from '../../common/i18n';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RejectArticleDto } from './dto/reject-article.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { SendBackArticleDto } from './dto/send-back-article.dto';

// Below this, feedback with a rating <= this is treated as a quality signal
// worth a Moderator's attention (Charter Section 10.1: "low-rated content
// automatically routed to the Moderator review queue"), not just noise.
const LOW_RATING_THRESHOLD = 2;

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
    private readonly notifications: NotificationsService,
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
    await this.notifications.notifyRole(
      Role.MODERATOR,
      'article.submitted',
      bi('New article awaiting review', 'కొత్త వ్యాసం సమీక్ష కోసం వేచి ఉంది'),
      bi(`"${updated.title}" is ready for review`, `"${updated.title}" సమీక్ష కోసం సిద్ధంగా ఉంది`),
      '/moderator/articles',
    );
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
    await this.notifications.create(
      updated.authorId,
      'article.approved',
      bi('Your article was published', 'మీ వ్యాసం ప్రచురించబడింది'),
      bi(`"${updated.title}" is now live in Knowledge`, `"${updated.title}" ఇప్పుడు జ్ఞానంలో ప్రత్యక్షంగా ఉంది`),
      `/expert/articles/${articleId}`,
    );
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
    await this.notifications.create(
      updated.authorId,
      'article.rejected',
      bi('Your article needs changes', 'మీ వ్యాసానికి మార్పులు అవసరం'),
      bi(`"${updated.title}": ${dto.reason}`, `"${updated.title}": ${dto.reason}`),
      `/expert/articles/${articleId}`,
    );
    return updated;
  }

  // Charter's cross-cutting Bookmarks utility (Section 10.1). Toggles rather
  // than separate add/remove endpoints — the client always wants "flip
  // whatever it currently is," never has to track state to pick the right
  // call.
  async toggleBookmark(articleId: string, userId: string): Promise<{ bookmarked: boolean }> {
    const existing = await this.prisma.articleBookmark.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });
    if (existing) {
      await this.prisma.articleBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    const article = await this.getOrThrow(articleId);
    if (article.status !== KnowledgeArticleStatus.PUBLISHED) {
      throw new BadRequestException(
        bi('Only published articles can be bookmarked', 'ప్రచురించిన వ్యాసాలను మాత్రమే బుక్‌మార్క్ చేయవచ్చు'),
      );
    }
    await this.prisma.articleBookmark.create({ data: { articleId, userId } });
    return { bookmarked: true };
  }

  async isBookmarked(articleId: string, userId: string): Promise<{ bookmarked: boolean }> {
    const existing = await this.prisma.articleBookmark.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });
    return { bookmarked: !!existing };
  }

  async listBookmarked(userId: string) {
    const bookmarks = await this.prisma.articleBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { article: { include: ARTICLE_INCLUDE } },
    });
    return bookmarks.map((b) => b.article);
  }

  // Charter's cross-cutting Recently Viewed utility (Section 10.1) — last
  // handful of articles this reader actually opened, newest first.
  async listRecentlyViewed(userId: string) {
    const views = await this.prisma.articleView.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 8,
      include: { article: { include: ARTICLE_INCLUDE } },
    });
    return views.map((v) => v.article);
  }

  // Farmer/any authenticated reader: Helpful/Not Helpful + 1-5 rating +
  // optional comment on a published article. One row per (article, user) —
  // a second submission updates rather than duplicates.
  async submitFeedback(articleId: string, userId: string, dto: SubmitFeedbackDto) {
    const article = await this.getOrThrow(articleId);
    if (article.status !== KnowledgeArticleStatus.PUBLISHED) {
      throw new BadRequestException(
        bi('Feedback can only be given on published articles', 'ప్రచురించిన వ్యాసాలపై మాత్రమే అభిప్రాయం ఇవ్వవచ్చు'),
      );
    }

    const feedback = await this.prisma.articleFeedback.upsert({
      where: { articleId_userId: { articleId, userId } },
      create: { articleId, userId, helpful: dto.helpful, rating: dto.rating, comment: dto.comment },
      update: { helpful: dto.helpful, rating: dto.rating, comment: dto.comment },
    });

    await this.audit.log({
      actorId: userId,
      action: 'knowledge.feedback.submit',
      entityType: 'KnowledgeArticle',
      entityId: articleId,
      metadata: { rating: dto.rating, helpful: dto.helpful },
    });

    // Only flag (and only notify) on the transition into flagged — a second
    // low rating on an already-flagged article shouldn't re-alert Moderators
    // who've already seen it in their queue.
    if (dto.rating <= LOW_RATING_THRESHOLD && !article.flaggedForReview) {
      const reasonEn = `Rated ${dto.rating}/5${dto.comment ? `: "${dto.comment}"` : ''}`;
      const reasonTe = `${dto.rating}/5 రేటింగ్${dto.comment ? `: "${dto.comment}"` : ''}`;
      await this.prisma.knowledgeArticle.update({
        where: { id: articleId },
        data: { flaggedForReview: true, flagReason: bi(reasonEn, reasonTe) },
      });
      await this.audit.log({
        actorId: userId,
        action: 'knowledge.feedback.flagged',
        entityType: 'KnowledgeArticle',
        entityId: articleId,
        metadata: { rating: dto.rating },
      });
      await this.notifications.notifyRole(
        Role.MODERATOR,
        'article.flagged',
        bi('An article was flagged for a low rating', 'తక్కువ రేటింగ్ కారణంగా వ్యాసం ఫ్లాగ్ చేయబడింది'),
        bi(`"${article.title}" received a ${dto.rating}/5 rating`, `"${article.title}"కు ${dto.rating}/5 రేటింగ్ వచ్చింది`),
        '/moderator/articles',
      );
    }

    return feedback;
  }

  async getFeedbackSummary(articleId: string, userId: string) {
    const [aggregate, helpfulCount, mine] = await Promise.all([
      this.prisma.articleFeedback.aggregate({ where: { articleId }, _avg: { rating: true }, _count: { _all: true } }),
      this.prisma.articleFeedback.count({ where: { articleId, helpful: true } }),
      this.prisma.articleFeedback.findUnique({ where: { articleId_userId: { articleId, userId } } }),
    ]);
    return {
      averageRating: aggregate._avg.rating,
      totalCount: aggregate._count._all,
      helpfulCount,
      notHelpfulCount: aggregate._count._all - helpfulCount,
      myFeedback: mine ? { helpful: mine.helpful, rating: mine.rating, comment: mine.comment } : null,
    };
  }

  // Moderator queue for Charter's "low-rated content automatically routed to
  // the Moderator review queue" — separate from listPendingReview() since a
  // flagged article is still PUBLISHED and live, not a draft awaiting its
  // first approval.
  async listFlagged() {
    return this.prisma.knowledgeArticle.findMany({
      where: { flaggedForReview: true },
      orderBy: { updatedAt: 'desc' },
      include: ARTICLE_INCLUDE,
    });
  }

  // Moderator judged the flag a false alarm — dismiss without touching the
  // published article itself.
  async clearFlag(articleId: string, moderatorId: string): Promise<KnowledgeArticle> {
    const existing = await this.getOrThrow(articleId);
    if (!existing.flaggedForReview) {
      throw new BadRequestException(bi('This article is not flagged', 'ఈ వ్యాసం ఫ్లాగ్ చేయబడలేదు'));
    }
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: { flaggedForReview: false, flagReason: null },
      include: ARTICLE_INCLUDE,
    });
    await this.audit.log({ actorId: moderatorId, action: 'knowledge.flag.clear', entityType: 'KnowledgeArticle', entityId: articleId });
    return updated;
  }

  // Moderator judged the flag real — reuses the exact same PUBLISHED ->
  // REJECTED -> author edits -> resubmit -> re-approved loop an ordinary
  // rejection uses, rather than inventing a parallel status just for
  // feedback-triggered revisions.
  async sendBackForRevision(articleId: string, moderatorId: string, dto: SendBackArticleDto): Promise<KnowledgeArticle> {
    const existing = await this.getOrThrow(articleId);
    this.assertStatus(existing, [KnowledgeArticleStatus.PUBLISHED], 'send back for revision');
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        status: KnowledgeArticleStatus.REJECTED,
        rejectionReason: dto.reason,
        reviewedByUserId: moderatorId,
        flaggedForReview: false,
        flagReason: null,
      },
      include: ARTICLE_INCLUDE,
    });
    await this.audit.log({
      actorId: moderatorId,
      action: 'knowledge.unpublish_for_revision',
      entityType: 'KnowledgeArticle',
      entityId: articleId,
      metadata: { reason: dto.reason },
    });
    await this.notifications.create(
      updated.authorId,
      'article.sent_back',
      bi('Your published article was sent back for revision', 'మీ ప్రచురించిన వ్యాసం సవరణ కోసం తిరిగి పంపబడింది'),
      bi(`"${updated.title}": ${dto.reason}`, `"${updated.title}": ${dto.reason}`),
      `/expert/articles/${articleId}`,
    );
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

    // "Recently Viewed" only means published advisory content someone
    // actually read — not an author checking their own draft or a
    // moderator working the review queue.
    if (isPublished) {
      await this.prisma.articleView.upsert({
        where: { articleId_userId: { articleId, userId: requester.userId } },
        create: { articleId, userId: requester.userId },
        update: { viewedAt: new Date() },
      });
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

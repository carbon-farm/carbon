import { randomBytes, timingSafeEqual } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TesterFeedbackStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { CreateTesterCommentDto, CreateTesterFeedbackDto, UpdateTesterStatusDto } from './dto/tester-feedback.dto';

// Hard ceilings so a flood (or a script) cannot fill the database: the board is a small team's
// worklist, not a public forum.
const MAX_ITEMS = 5000;
const MAX_COMMENTS_PER_ITEM = 200;
const MAX_COMMENTS_TOTAL = 20000; // the whole board is sent on every refresh, so it must stay small

const STATUS_LABEL: Record<TesterFeedbackStatus, { en: string; te: string }> = {
  NEW: { en: 'New', te: 'కొత్త' },
  SEEN: { en: 'Seen', te: 'చూశాము' },
  IN_PROGRESS: { en: 'In progress', te: 'జరుగుతోంది' },
  DONE: { en: 'Done', te: 'పూర్తయింది' },
  WONT_DO: { en: "Won't do", te: 'చేయము' },
};

// Strips control characters, invisible direction/zero-width characters (which can make a name or
// text read as something it is not) and trims; the board shows text only (never HTML).
const clean = (v: string | undefined | null) =>
  // eslint-disable-next-line no-control-regex
  (v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩﻿]/g, '').trim();

// The testers' board: a page testers use without signing in. What stands in for a sign-in is a
// secret in the page's address (TesterAccess.key) — an Administrator can replace it, which ends
// the old address. Writes are also rate-limited in the controller.
@Injectable()
export class TesterFeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private newKey() {
    return randomBytes(16).toString('hex'); // 32 characters
  }

  // ---- the link (Administrator)

  async getLinkKey(): Promise<string> {
    const existing = await this.prisma.testerAccess.findFirst();
    if (existing) return existing.key;
    return (await this.prisma.testerAccess.create({ data: { key: this.newKey() } })).key;
  }

  async rotateLinkKey(actorId: string): Promise<string> {
    const key = this.newKey();
    const existing = await this.prisma.testerAccess.findFirst();
    if (existing) await this.prisma.testerAccess.update({ where: { id: existing.id }, data: { key, rotatedAt: new Date() } });
    else await this.prisma.testerAccess.create({ data: { key } });
    await this.audit.log({ actorId, action: 'tester_board.link.rotate', entityType: 'TesterAccess', entityId: 'link' });
    return key;
  }

  // Anything that is not the current key is "not found" — nothing is revealed about why.
  async assertKey(key: string): Promise<void> {
    const stored = await this.prisma.testerAccess.findFirst();
    const a = Buffer.from(String(key ?? ''));
    const b = Buffer.from(stored?.key ?? '');
    if (!stored || a.length !== b.length || !timingSafeEqual(a, b)) throw new NotFoundException('Not found');
  }

  // ---- the board

  async list(key: string) {
    await this.assertKey(key);
    return this.prisma.testerFeedback.findMany({
      orderBy: { number: 'desc' },
      take: MAX_ITEMS,
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async create(key: string, dto: CreateTesterFeedbackDto) {
    await this.assertKey(key);
    if (dto.faxExtra?.trim()) return { ok: true }; // a bot filled the hidden box: pretend it worked
    const description = clean(dto.description);
    const authorName = clean(dto.authorName);
    if (description.length < 5 || !authorName) {
      throw new BadRequestException(bi('Please write your name and what you found', 'మీ పేరు, మీరు కనుగొన్నది రాయండి'));
    }
    if ((await this.prisma.testerFeedback.count()) >= MAX_ITEMS) {
      throw new BadRequestException(bi('The board is full', 'బోర్డు నిండిపోయింది'));
    }
    return this.prisma.testerFeedback.create({
      data: {
        kind: dto.kind,
        location: clean(dto.location) || null,
        description,
        expected: clean(dto.expected) || null,
        authorName,
      },
      include: { comments: true },
    });
  }

  async comment(key: string, id: string, dto: CreateTesterCommentDto) {
    await this.assertKey(key);
    if (dto.faxExtra?.trim()) return { ok: true };
    const body = clean(dto.body);
    const authorName = clean(dto.authorName);
    if (!body || !authorName) {
      throw new BadRequestException(bi('Please write your name and a reply', 'మీ పేరు, సమాధానం రాయండి'));
    }
    const item = await this.prisma.testerFeedback.findUnique({ where: { id }, select: { id: true, _count: { select: { comments: true } } } });
    if (!item) throw new NotFoundException('Not found');
    if (item._count.comments >= MAX_COMMENTS_PER_ITEM) {
      throw new BadRequestException(bi('This item has too many replies — start a new item', 'ఈ అంశానికి చాలా సమాధానాలు ఉన్నాయి — కొత్త అంశం మొదలుపెట్టండి'));
    }
    if ((await this.prisma.testerFeedbackComment.count()) >= MAX_COMMENTS_TOTAL) {
      throw new BadRequestException(bi('The board is full of replies — ask the Administrator to clear old items', 'బోర్డు సమాధానాలతో నిండిపోయింది — పాత అంశాలను తొలగించమని అడ్మినిస్ట్రేటర్‌ను అడగండి'));
    }
    return this.prisma.testerFeedbackComment.create({ data: { feedbackId: id, authorName, body } });
  }

  // Anyone with the link may change the status — it is the testers' own list (like marking Done
  // in the sheet). The change and who made it are written into the item's history.
  async setStatus(key: string, id: string, dto: UpdateTesterStatusDto) {
    await this.assertKey(key);
    const by = clean(dto.by);
    if (!by) throw new BadRequestException(bi('Please write your name first', 'ముందు మీ పేరు రాయండి'));
    const item = await this.prisma.testerFeedback.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Not found');
    if (item.status === dto.status) return this.prisma.testerFeedback.findUnique({ where: { id }, include: { comments: { orderBy: { createdAt: 'asc' } } } });
    // The history line obeys the same ceilings as a reply, so flipping a status back and forth
    // cannot grow an item (or the board) without limit; the status itself still changes.
    const [onItem, onBoard] = await Promise.all([
      this.prisma.testerFeedbackComment.count({ where: { feedbackId: id } }),
      this.prisma.testerFeedbackComment.count(),
    ]);
    const from = STATUS_LABEL[item.status];
    const to = STATUS_LABEL[dto.status];
    const writes: Prisma.PrismaPromise<unknown>[] = [this.prisma.testerFeedback.update({ where: { id }, data: { status: dto.status } })];
    if (onItem < MAX_COMMENTS_PER_ITEM && onBoard < MAX_COMMENTS_TOTAL) {
      writes.push(
        this.prisma.testerFeedbackComment.create({
          data: {
            feedbackId: id,
            authorName: by,
            isSystem: true,
            body: `Status: ${from.en} → ${to.en} (by ${by}) / స్థితి: ${from.te} → ${to.te} (${by})`,
          },
        }),
      );
    }
    await this.prisma.$transaction(writes);
    return this.prisma.testerFeedback.findUnique({ where: { id }, include: { comments: { orderBy: { createdAt: 'asc' } } } });
  }
}

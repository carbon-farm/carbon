import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

export const EVENT_KINDS = ['page', 'chat_answer', 'chat_unanswered', 'tour', 'error'] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

const RETENTION_DAYS = 90;
const MAX_NAME = 200;
const MAX_DETAIL = 1000;

export interface IncomingEvent {
  kind: string;
  name: string;
  detail?: string;
  role?: string;
}

// Keeps only what is safe to store: a known kind, trimmed text, and nothing that looks like a
// mobile number or a long secret-looking token (people sometimes type those into the help chat).
export function sanitizeEvent(e: IncomingEvent): { kind: EventKind; name: string; detail: string | null; role: string | null } | null {
  if (!EVENT_KINDS.includes(e.kind as EventKind)) return null;
  const scrub = (s: string) =>
    s
      .replace(/(\+?91[\s-]?)?[6-9]\d{9}\b/g, '[number]') // Indian mobile numbers
      .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '[token]') // long tokens / ids / keys
      .replace(/\s+/g, ' ')
      .trim();
  const name = scrub(String(e.name ?? '')).slice(0, MAX_NAME);
  if (!name) return null;
  const detail = e.detail ? scrub(String(e.detail)).slice(0, MAX_DETAIL) : null;
  const role = e.role && /^[A-Z_]{3,20}$/.test(e.role) ? e.role : null;
  return { kind: e.kind as EventKind, name, detail, role };
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(events: IncomingEvent[]): Promise<number> {
    const rows = events.slice(0, 20).map(sanitizeEvent).filter((r): r is NonNullable<typeof r> => r !== null);
    if (rows.length === 0) return 0;
    await this.prisma.usageEvent.createMany({ data: rows });
    for (const r of rows) {
      if (r.kind === 'error') this.logger.warn(`client error: ${r.name}`);
    }
    return rows.length;
  }

  // What the Administrator's Usage screen shows.
  async summary(days: number) {
    const since = new Date(Date.now() - days * 86_400_000);
    const group = async (kind: EventKind, take: number) => {
      const rows = await this.prisma.usageEvent.groupBy({
        by: ['name'],
        where: { kind, createdAt: { gte: since } },
        _count: { _all: true },
        _max: { createdAt: true },
        orderBy: { _count: { name: 'desc' } },
        take,
      });
      return rows.map((r) => ({ name: r.name, count: r._count._all, lastAt: r._max.createdAt }));
    };
    const [pages, unanswered, answered, errors, tours, totals] = await Promise.all([
      group('page', 200),
      group('chat_unanswered', 200),
      group('chat_answer', 200),
      group('error', 100),
      group('tour', 20),
      this.prisma.usageEvent.groupBy({ by: ['kind'], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    ]);
    const byRole = await this.prisma.usageEvent.groupBy({
      by: ['role'],
      where: { kind: 'page', createdAt: { gte: since } },
      _count: { _all: true },
    });
    return {
      days,
      totals: Object.fromEntries(totals.map((t) => [t.kind, t._count._all])),
      pageViewsByRole: byRole.map((r) => ({ role: r.role ?? 'VISITOR', count: r._count._all })),
      pages,
      unanswered,
      answered,
      errors,
      tours,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async sweep() {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
    const { count } = await this.prisma.usageEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });
    if (count > 0) this.logger.log(`Deleted ${count} usage events older than ${RETENTION_DAYS} days`);
  }
}

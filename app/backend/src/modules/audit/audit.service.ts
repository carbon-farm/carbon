import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Cross-cutting Audit Trail per Charter Guiding Principle "Audit Friendly" —
// tamper-evident, retained record of material actions. Append-only: no update
// or delete method is exposed on purpose.
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    actorId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata,
      },
    });
  }

  // Administrator-facing viewer (Charter Module 13 — Security's audit
  // trail requirement was being written all along but had no reader).
  // Sorting is left to the client on the loaded page rather than added as
  // server-side order params — at real audit-log volume a proper
  // paginated/indexed query matters, but that's a follow-up once entries
  // actually accumulate, not something worth guessing the shape of now.
  async list(filters: { entityType?: string; from?: Date; to?: Date }) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.from || filters.to
          ? { createdAt: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { actor: { select: { id: true, name: true, role: true } } },
    });
  }

  async listEntityTypes(): Promise<string[]> {
    const rows = await this.prisma.auditLog.findMany({ distinct: ['entityType'], select: { entityType: true } });
    return rows.map((r) => r.entityType).sort();
  }
}

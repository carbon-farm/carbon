import { Injectable } from '@nestjs/common';
import { CaseStatus, ClosureReason, KnowledgeArticleStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Charter Module 11 — Reporting. Read-only aggregation over data that
// already exists (Cases, Knowledge Articles, Users) — no new state, no
// scheduled jobs, nothing that needs a business decision to build. Volumes
// are small enough at this stage that plain groupBy queries plus a bit of
// JS math beat maintaining a separate reporting/materialized-view layer.
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      casesByStatusRaw,
      casesByCategoryRaw,
      casesByCropRaw,
      articlesByStatusRaw,
      usersByRoleRaw,
      resolvedDurations,
      expertWorkloadRaw,
      categories,
      crops,
    ] = await Promise.all([
      this.prisma.case.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.case.groupBy({ by: ['categoryId'], _count: { _all: true } }),
      this.prisma.case.groupBy({ by: ['cropId'], _count: { _all: true } }),
      this.prisma.knowledgeArticle.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      this.prisma.case.findMany({
        where: { status: CaseStatus.CLOSED, closureReason: ClosureReason.RESOLVED, submittedAt: { not: null }, closedAt: { not: null } },
        select: { submittedAt: true, closedAt: true },
      }),
      this.prisma.case.groupBy({ by: ['assignedExpertId'], where: { assignedExpertId: { not: null } }, _count: { _all: true } }),
      this.prisma.caseCategoryMaster.findMany({ select: { id: true, name: true } }),
      this.prisma.cropMaster.findMany({ select: { id: true, name: true } }),
    ]);

    const categoryName = new Map(categories.map((c) => [c.id, c.name]));
    const cropName = new Map(crops.map((c) => [c.id, c.name]));

    const totalCases = casesByStatusRaw.reduce((sum, row) => sum + row._count._all, 0);
    const closedCases = await this.prisma.case.groupBy({
      by: ['closureReason'],
      where: { status: CaseStatus.CLOSED },
      _count: { _all: true },
    });
    const resolvedCount = closedCases.find((r) => r.closureReason === ClosureReason.RESOLVED)?._count._all ?? 0;
    const abandonedCount = closedCases.find((r) => r.closureReason === ClosureReason.ABANDONED)?._count._all ?? 0;
    const openCases = totalCases - resolvedCount - abandonedCount;

    const avgResolutionDays =
      resolvedDurations.length === 0
        ? null
        : resolvedDurations.reduce((sum, c) => sum + (c.closedAt!.getTime() - c.submittedAt!.getTime()), 0) /
          resolvedDurations.length /
          (1000 * 60 * 60 * 24);

    const expertIds = expertWorkloadRaw.map((r) => r.assignedExpertId).filter((id): id is string => id !== null);
    const [experts, resolvedByExpertRaw] = await Promise.all([
      this.prisma.user.findMany({ where: { id: { in: expertIds } }, select: { id: true, name: true } }),
      this.prisma.case.groupBy({
        by: ['assignedExpertId'],
        where: { assignedExpertId: { in: expertIds }, status: CaseStatus.CLOSED, closureReason: ClosureReason.RESOLVED },
        _count: { _all: true },
      }),
    ]);
    const expertNameById = new Map(experts.map((e) => [e.id, e.name]));
    const resolvedByExpert = new Map(resolvedByExpertRaw.map((r) => [r.assignedExpertId, r._count._all]));

    return {
      totalCases,
      openCases,
      resolvedCases: resolvedCount,
      abandonedCases: abandonedCount,
      avgResolutionDays,
      casesByStatus: casesByStatusRaw
        .map((r) => ({ status: r.status, count: r._count._all }))
        .sort((a, b) => b.count - a.count),
      casesByCategory: casesByCategoryRaw
        .map((r) => ({ category: categoryName.get(r.categoryId) ?? r.categoryId, count: r._count._all }))
        .sort((a, b) => b.count - a.count),
      casesByCrop: casesByCropRaw
        .map((r) => ({ crop: r.cropId ? cropName.get(r.cropId) ?? r.cropId : 'General', count: r._count._all }))
        .sort((a, b) => b.count - a.count),
      articlesByStatus: (Object.values(KnowledgeArticleStatus) as KnowledgeArticleStatus[]).map((status) => ({
        status,
        count: articlesByStatusRaw.find((r) => r.status === status)?._count._all ?? 0,
      })),
      usersByRole: (Object.values(Role) as Role[]).map((role) => ({
        role,
        count: usersByRoleRaw.find((r) => r.role === role)?._count._all ?? 0,
      })),
      expertWorkload: expertWorkloadRaw
        .map((r) => ({
          expertId: r.assignedExpertId as string,
          name: expertNameById.get(r.assignedExpertId as string) ?? 'Unknown',
          assignedCount: r._count._all,
          resolvedCount: resolvedByExpert.get(r.assignedExpertId) ?? 0,
        }))
        .sort((a, b) => b.assignedCount - a.assignedCount),
    };
  }
}

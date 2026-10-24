import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { CreateSeasonalTipDto, UpdateSeasonalTipDto } from './seasonal.dto';
import { currentMonthIst, inSeason } from './season';

const MAX_TIPS_SHOWN = 3;

@Injectable()
export class SeasonalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Everything, for the administrator's list (switched-off tips included).
  list() {
    return this.prisma.seasonalTip.findMany({ orderBy: [{ startMonth: 'asc' }, { createdAt: 'desc' }], include: { crop: { select: { id: true, name: true } } } });
  }

  async create(dto: CreateSeasonalTipDto, actorId: string) {
    if (dto.cropId) await this.assertCrop(dto.cropId);
    const created = await this.prisma.seasonalTip.create({
      data: {
        titleEn: dto.titleEn.trim(),
        titleTe: dto.titleTe.trim(),
        bodyEn: dto.bodyEn.trim(),
        bodyTe: dto.bodyTe.trim(),
        startMonth: dto.startMonth,
        endMonth: dto.endMonth,
        cropId: dto.cropId ?? null,
      },
      include: { crop: { select: { id: true, name: true } } },
    });
    await this.audit.log({ actorId, action: 'seasonal_tip.create', entityType: 'SeasonalTip', entityId: created.id });
    return created;
  }

  async update(id: string, dto: UpdateSeasonalTipDto, actorId: string) {
    const existing = await this.prisma.seasonalTip.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(bi('Tip not found', 'చిట్కా కనుగొనబడలేదు'));
    if (dto.cropId) await this.assertCrop(dto.cropId);
    const trimmed = (v?: string) => (v === undefined ? undefined : v.trim());
    const updated = await this.prisma.seasonalTip.update({
      where: { id },
      data: {
        titleEn: trimmed(dto.titleEn),
        titleTe: trimmed(dto.titleTe),
        bodyEn: trimmed(dto.bodyEn),
        bodyTe: trimmed(dto.bodyTe),
        startMonth: dto.startMonth,
        endMonth: dto.endMonth,
        ...(dto.cropId !== undefined ? { cropId: dto.cropId } : {}),
        isActive: dto.isActive,
      },
      include: { crop: { select: { id: true, name: true } } },
    });
    await this.audit.log({ actorId, action: 'seasonal_tip.update', entityType: 'SeasonalTip', entityId: id, metadata: { changed: Object.keys(dto) } });
    return updated;
  }

  async remove(id: string, actorId: string) {
    const existing = await this.prisma.seasonalTip.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(bi('Tip not found', 'చిట్కా కనుగొనబడలేదు'));
    await this.prisma.seasonalTip.delete({ where: { id } });
    await this.audit.log({ actorId, action: 'seasonal_tip.delete', entityType: 'SeasonalTip', entityId: id });
    return { deleted: true };
  }

  // The tips in season right now (India time) for this member: general tips, plus tips for a crop
  // they grow on any of their farms. Crop-specific ones come first; at most a few are shown.
  async currentFor(userId: string, now: Date = new Date()) {
    const month = currentMonthIst(now);
    const [tips, farms] = await Promise.all([
      this.prisma.seasonalTip.findMany({ where: { isActive: true }, include: { crop: { select: { id: true, name: true } } } }),
      this.prisma.farmLand.findMany({ where: { farmerId: userId, archivedAt: null }, select: { primaryCrops: true } }),
    ]);
    const grown = new Set(farms.flatMap((f) => f.primaryCrops.map((c) => c.trim().toLowerCase())));
    return tips
      .filter((t) => inSeason(month, t.startMonth, t.endMonth))
      .filter((t) => !t.crop || grown.has(t.crop.name.trim().toLowerCase()))
      .sort((a, b) => Number(!!b.crop) - Number(!!a.crop) || a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, MAX_TIPS_SHOWN)
      .map((t) => ({ id: t.id, titleEn: t.titleEn, titleTe: t.titleTe, bodyEn: t.bodyEn, bodyTe: t.bodyTe, cropName: t.crop?.name ?? null }));
  }

  private async assertCrop(cropId: string) {
    const crop = await this.prisma.cropMaster.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(bi('Crop not found', 'పంట కనుగొనబడలేదు'));
  }
}

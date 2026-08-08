import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTaxonomyItemDto } from './dto/create-taxonomy-item.dto';
import { CreateRegionDto } from './dto/create-region.dto';

// Module 14 — Configuration: the platform's single controlled taxonomy, owned
// here and referenced (never duplicated) by Modules 3, 4, 5, 7, and 11, per
// Charter v0.3.0. Deliberately just four small master tables in Stage 1 — the
// Case/Knowledge/Reporting modules that consume this taxonomy are Stage 2+.
@Injectable()
export class ConfigurationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listCrops() {
    return this.prisma.cropMaster.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async createCrop(dto: CreateTaxonomyItemDto, actorId: string) {
    const crop = await this.prisma.cropMaster.create({ data: { name: dto.name } });
    await this.audit.log({ actorId, action: 'taxonomy.crop.create', entityType: 'CropMaster', entityId: crop.id });
    return crop;
  }

  listCaseCategories() {
    return this.prisma.caseCategoryMaster.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async createCaseCategory(dto: CreateTaxonomyItemDto, actorId: string) {
    const category = await this.prisma.caseCategoryMaster.create({ data: { name: dto.name } });
    await this.audit.log({
      actorId,
      action: 'taxonomy.case_category.create',
      entityType: 'CaseCategoryMaster',
      entityId: category.id,
    });
    return category;
  }

  listTags() {
    return this.prisma.tagMaster.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async createTag(dto: CreateTaxonomyItemDto, actorId: string) {
    const tag = await this.prisma.tagMaster.create({ data: { name: dto.name } });
    await this.audit.log({ actorId, action: 'taxonomy.tag.create', entityType: 'TagMaster', entityId: tag.id });
    return tag;
  }

  listRegions() {
    return this.prisma.regionMaster.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async createRegion(dto: CreateRegionDto, actorId: string) {
    const region = await this.prisma.regionMaster.create({ data: dto });
    await this.audit.log({
      actorId,
      action: 'taxonomy.region.create',
      entityType: 'RegionMaster',
      entityId: region.id,
    });
    return region;
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { bi } from '../../common/i18n';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTaxonomyItemDto } from './dto/create-taxonomy-item.dto';
import { CreateRegionDto } from './dto/create-region.dto';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { CreateCropCategoryDto, UpdateCropCategoryDto } from './dto/crop-category.dto';

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

  listCropCategories() {
    return this.prisma.cropCategoryMaster.findMany({ orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }] });
  }

  // A crop can only be filed under groups that exist, are switched on, and have no sub-groups of
  // their own (it goes under "Fruiting vegetables", not under "Vegetables").
  private async assertCropGroups(keys: string[]) {
    if (keys.length === 0) return;
    const all = await this.prisma.cropCategoryMaster.findMany();
    for (const key of keys) {
      const found = all.find((c) => c.key === key);
      if (!found || !found.isActive) {
        throw new BadRequestException(bi(`Unknown crop group "${key}"`, `పంట సమూహం "${key}" లేదు`));
      }
      if (all.some((c) => c.parentKey === key)) {
        throw new BadRequestException(
          bi(`"${found.nameEn}" has sub-groups — choose one of them`, `"${found.nameTe}"కు ఉప సమూహాలు ఉన్నాయి — వాటిలో ఒకదాన్ని ఎంచుకోండి`),
        );
      }
    }
  }

  async createCropCategory(dto: CreateCropCategoryDto, actorId: string) {
    if (dto.nameEn.trim().length < 2 || !dto.nameTe.trim()) {
      throw new BadRequestException(bi('Give the group a name in English and Telugu', 'సమూహానికి ఇంగ్లీష్, తెలుగులో పేరు ఇవ్వండి'));
    }
    const all = await this.prisma.cropCategoryMaster.findMany();
    if (dto.parentKey) {
      const parent = all.find((c) => c.key === dto.parentKey);
      if (!parent) throw new BadRequestException(bi('That parent group does not exist', 'ఆ ప్రధాన సమూహం లేదు'));
      if (!parent.isActive) {
        throw new BadRequestException(bi('That parent group is switched off', 'ఆ ప్రధాన సమూహం ఆపివేయబడింది'));
      }
      if (parent.parentKey) {
        throw new BadRequestException(bi('Groups go only two levels deep', 'సమూహాలు రెండు స్థాయిల వరకే ఉంటాయి'));
      }
      // a group that already holds crops cannot also have sub-groups
      const holding = await this.prisma.cropMaster.count({ where: { categories: { has: parent.key } } });
      if (holding > 0) {
        throw new BadRequestException(
          bi(`"${parent.nameEn}" already holds crops — move them to another group first`, `"${parent.nameTe}"లో ఇప్పటికే పంటలు ఉన్నాయి — ముందు వాటిని మరో సమూహానికి మార్చండి`),
        );
      }
    }
    const base = dto.nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'group';
    let key = base;
    for (let n = 2; all.some((c) => c.key === key); n += 1) key = `${base}-${n}`;
    const last = Math.max(0, ...all.map((c) => c.sortOrder));
    const category = await this.prisma.cropCategoryMaster.create({
      data: { key, parentKey: dto.parentKey ?? null, nameEn: dto.nameEn.trim(), nameTe: dto.nameTe.trim(), sortOrder: last + 10 },
    });
    await this.audit.log({ actorId, action: 'taxonomy.crop_category.create', entityType: 'CropCategoryMaster', entityId: category.id });
    return category;
  }

  async updateCropCategory(id: string, dto: UpdateCropCategoryDto, actorId: string) {
    const existing = await this.prisma.cropCategoryMaster.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Crop group not found');
    if ((dto.nameEn !== undefined && dto.nameEn.trim().length < 2) || (dto.nameTe !== undefined && !dto.nameTe.trim())) {
      throw new BadRequestException(bi('A group needs a name in English and Telugu', 'సమూహానికి ఇంగ్లీష్, తెలుగులో పేరు ఉండాలి'));
    }
    const category = await this.prisma.cropCategoryMaster.update({
      where: { id },
      data: {
        ...(dto.nameEn !== undefined ? { nameEn: dto.nameEn.trim() } : {}),
        ...(dto.nameTe !== undefined ? { nameTe: dto.nameTe.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    await this.audit.log({ actorId, action: 'taxonomy.crop_category.update', entityType: 'CropCategoryMaster', entityId: category.id });
    return category;
  }

  async createCrop(dto: CreateCropDto, actorId: string) {
    if (dto.name.trim().length < 2) throw new BadRequestException(bi('Give the crop a name', 'పంటకు పేరు ఇవ్వండి'));
    await this.assertCropGroups(dto.categories ?? []);
    const crop = await this.prisma.cropMaster.create({
      data: { name: dto.name.trim(), nameTe: dto.nameTe?.trim() || null, categories: dto.categories ?? [] },
    });
    await this.audit.log({ actorId, action: 'taxonomy.crop.create', entityType: 'CropMaster', entityId: crop.id });
    return crop;
  }

  // Telugu name and picker groups only — never the English name (see UpdateCropDto).
  async updateCrop(id: string, dto: UpdateCropDto, actorId: string) {
    const existing = await this.prisma.cropMaster.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Crop not found');
    // groups the crop already has stay as they are even if switched off since — only new ones are checked
    if (dto.categories !== undefined) await this.assertCropGroups(dto.categories.filter((k) => !existing.categories.includes(k)));
    const crop = await this.prisma.cropMaster.update({
      where: { id },
      data: {
        ...(dto.nameTe !== undefined ? { nameTe: dto.nameTe.trim() || null } : {}),
        ...(dto.categories !== undefined ? { categories: dto.categories } : {}),
      },
    });
    await this.audit.log({ actorId, action: 'taxonomy.crop.update', entityType: 'CropMaster', entityId: crop.id });
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

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, SoilSample, SoilSampleStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UploadsService } from '../uploads/uploads.service';
import { bi } from '../../common/i18n';
import { CreateSampleDto } from './dto/create-sample.dto';

const SAMPLE_INCLUDE = {
  farmLand: true,
  case: { select: { id: true, caseNumber: true } },
} as const;

// Module 7 — Soil Laboratory, built generic (explicit product decision: no
// lab partner integrated yet). Farmer-initiated, staff-progressed, matching
// the Case Lifecycle's own shape — a guarded linear state machine, not a
// policy statement left to the client to enforce.
@Injectable()
export class SoilLabService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly uploads: UploadsService,
  ) {}

  async createSample(farmerId: string, dto: CreateSampleDto): Promise<SoilSample> {
    await this.assertFarmLandOwnership(dto.farmLandId, farmerId);
    if (dto.caseId) {
      await this.assertCaseOwnership(dto.caseId, farmerId);
    }
    const created = await this.prisma.soilSample.create({
      data: {
        sampleCode: this.generateSampleCode(),
        farmerId,
        farmLandId: dto.farmLandId,
        caseId: dto.caseId,
        collectionVideoWatched: dto.collectionVideoWatched,
        status: SoilSampleStatus.CREATED,
      },
      include: SAMPLE_INCLUDE,
    });
    await this.audit.log({
      actorId: farmerId,
      action: 'soilsample.create',
      entityType: 'SoilSample',
      entityId: created.id,
      metadata: { sampleCode: created.sampleCode },
    });
    return created;
  }

  async dispatch(sampleId: string, actorId: string): Promise<SoilSample> {
    const existing = await this.getOrThrow(sampleId);
    this.assertStatus(existing, [SoilSampleStatus.CREATED], 'dispatch');
    const updated = await this.prisma.soilSample.update({
      where: { id: sampleId },
      data: { status: SoilSampleStatus.DISPATCHED, dispatchedAt: new Date() },
      include: SAMPLE_INCLUDE,
    });
    await this.audit.log({ actorId, action: 'soilsample.dispatch', entityType: 'SoilSample', entityId: sampleId });
    return updated;
  }

  async markReceived(sampleId: string, actorId: string): Promise<SoilSample> {
    const existing = await this.getOrThrow(sampleId);
    this.assertStatus(existing, [SoilSampleStatus.DISPATCHED], 'mark received');
    const updated = await this.prisma.soilSample.update({
      where: { id: sampleId },
      data: { status: SoilSampleStatus.RECEIVED, receivedAt: new Date() },
      include: SAMPLE_INCLUDE,
    });
    await this.audit.log({ actorId, action: 'soilsample.receive', entityType: 'SoilSample', entityId: sampleId });
    return updated;
  }

  async markTested(sampleId: string, actorId: string): Promise<SoilSample> {
    const existing = await this.getOrThrow(sampleId);
    this.assertStatus(existing, [SoilSampleStatus.RECEIVED], 'mark tested');
    const updated = await this.prisma.soilSample.update({
      where: { id: sampleId },
      data: { status: SoilSampleStatus.TESTED, testedAt: new Date() },
      include: SAMPLE_INCLUDE,
    });
    await this.audit.log({ actorId, action: 'soilsample.test', entityType: 'SoilSample', entityId: sampleId });
    return updated;
  }

  async uploadReport(sampleId: string, actorId: string, file: Express.Multer.File): Promise<SoilSample> {
    const existing = await this.getOrThrow(sampleId);
    this.assertStatus(existing, [SoilSampleStatus.TESTED], 'upload a report for');
    const url = await this.uploads.uploadSoilReport(sampleId, file);
    const updated = await this.prisma.soilSample.update({
      where: { id: sampleId },
      data: { status: SoilSampleStatus.REPORT_AVAILABLE, reportUrl: url, reportAvailableAt: new Date() },
      include: SAMPLE_INCLUDE,
    });
    await this.audit.log({ actorId, action: 'soilsample.report.upload', entityType: 'SoilSample', entityId: sampleId });
    await this.notifications.create(
      updated.farmerId,
      'soilsample.report.available',
      bi('Your soil test report is ready', 'మీ నేల పరీక్ష నివేదిక సిద్ధంగా ఉంది'),
      bi(`${updated.sampleCode} results are available`, `${updated.sampleCode} ఫలితాలు అందుబాటులో ఉన్నాయి`),
      `/soil-samples/${sampleId}`,
    );
    return updated;
  }

  async listMine(farmerId: string) {
    return this.prisma.soilSample.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
      include: SAMPLE_INCLUDE,
    });
  }

  // Staff queue: every sample regardless of status — matches how the
  // Moderator article queue and Knowledge flagged queue aren't scoped down
  // further than "everything staff might need to act on or check."
  async listAllForStaff() {
    return this.prisma.soilSample.findMany({
      orderBy: { createdAt: 'desc' },
      include: { ...SAMPLE_INCLUDE, farmer: { select: { id: true, name: true, mobileNumber: true } } },
    });
  }

  async getById(sampleId: string, requester: { userId: string; role: Role }): Promise<SoilSample> {
    const found = await this.getOrThrow(sampleId);
    const isOwner = found.farmerId === requester.userId;
    const isStaff = requester.role === Role.MODERATOR || requester.role === Role.ADMINISTRATOR;
    if (!isOwner && !isStaff) {
      throw new ForbiddenException(bi('You do not have access to this sample', 'మీకు ఈ నమూనాకు ప్రాప్యత లేదు'));
    }
    return found;
  }

  private async getOrThrow(sampleId: string): Promise<SoilSample> {
    const found = await this.prisma.soilSample.findUnique({ where: { id: sampleId }, include: SAMPLE_INCLUDE });
    if (!found) throw new NotFoundException(bi('Soil sample not found', 'నేల నమూనా కనుగొనబడలేదు'));
    return found;
  }

  private async assertFarmLandOwnership(farmLandId: string, farmerId: string): Promise<void> {
    const farmLand = await this.prisma.farmLand.findUnique({ where: { id: farmLandId } });
    if (!farmLand || farmLand.farmerId !== farmerId) {
      throw new ForbiddenException(bi('This Farm/Land parcel does not belong to you', 'ఈ పొలం స్థలం మీది కాదు'));
    }
  }

  private async assertCaseOwnership(caseId: string, farmerId: string): Promise<void> {
    const found = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!found || found.farmerId !== farmerId) {
      throw new ForbiddenException(bi('This case does not belong to you', 'ఈ కేసు మీది కాదు'));
    }
  }

  private assertStatus(existing: SoilSample, allowed: SoilSampleStatus[], actionEn: string): void {
    if (!allowed.includes(existing.status)) {
      throw new BadRequestException(
        bi(
          `Cannot ${actionEn} a sample in ${existing.status} status`,
          `${existing.status} స్థితిలో ఉన్న నమూనాను ${actionEn} చేయలేరు`,
        ),
      );
    }
  }

  private generateSampleCode(): string {
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `SOIL-${year}-${random}`;
  }
}

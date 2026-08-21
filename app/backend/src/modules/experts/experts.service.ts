import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CredentialStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { bi } from '../../common/i18n';
import { SubmitCredentialsDto } from './dto/submit-credentials.dto';
import { VerifyCredentialDto } from './dto/verify-credential.dto';

// Module 10 — Administration: an Expert's credentials must be verified before
// Expert Portal access is activated (Charter v0.4.0 / Risk R9 mitigation). This
// service is the actual gate, not a policy statement.
@Injectable()
export class ExpertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async submitCredentials(userId: string, dto: SubmitCredentialsDto) {
    const profile = await this.prisma.expertProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException(bi('Expert profile not found', 'నిపుణుల ప్రొఫైల్ కనుగొనబడలేదు'));

    const updated = await this.prisma.expertProfile.update({
      where: { userId },
      data: {
        qualification: dto.qualification,
        licenseNumber: dto.licenseNumber,
        credentialStatus: CredentialStatus.PENDING_REVIEW,
        submittedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'expert.credential.submit',
      entityType: 'ExpertProfile',
      entityId: updated.id,
    });
    return updated;
  }

  async listPendingReview() {
    return this.prisma.expertProfile.findMany({
      where: { credentialStatus: CredentialStatus.PENDING_REVIEW },
      include: { user: { select: { id: true, name: true, mobileNumber: true } } },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async verify(expertProfileId: string, dto: VerifyCredentialDto, verifierId: string) {
    const profile = await this.prisma.expertProfile.findUnique({ where: { id: expertProfileId } });
    if (!profile) throw new NotFoundException(bi('Expert profile not found', 'నిపుణుల ప్రొఫైల్ కనుగొనబడలేదు'));
    if (profile.credentialStatus !== CredentialStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        bi('Only credentials pending review can be verified', 'సమీక్ష కోసం పెండింగ్‌లో ఉన్న ధృవపత్రాలు మాత్రమే ధృవీకరించవచ్చు'),
      );
    }
    if (!dto.approve && !dto.reason) {
      throw new BadRequestException(
        bi('A reason is required when rejecting credentials', 'ధృవపత్రాలను తిరస్కరించేటప్పుడు కారణం అవసరం'),
      );
    }

    const updated = await this.prisma.expertProfile.update({
      where: { id: expertProfileId },
      data: {
        credentialStatus: dto.approve ? CredentialStatus.VERIFIED : CredentialStatus.REJECTED,
        verifiedByUserId: verifierId,
        verifiedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId: verifierId,
      action: dto.approve ? 'expert.credential.approve' : 'expert.credential.reject',
      entityType: 'ExpertProfile',
      entityId: updated.id,
      metadata: dto.reason ? { reason: dto.reason } : undefined,
    });
    await this.notifications.create(
      updated.userId,
      dto.approve ? 'credential.approved' : 'credential.rejected',
      dto.approve
        ? bi('Your credentials were verified', 'మీ ధృవపత్రాలు ధృవీకరించబడ్డాయి')
        : bi('Your credentials need attention', 'మీ ధృవపత్రాలకు శ్రద్ధ అవసరం'),
      dto.approve
        ? bi('You can now be assigned cases', 'ఇప్పుడు మీకు కేసులు కేటాయించవచ్చు')
        : bi(dto.reason ?? '', dto.reason ?? ''),
      '/expert/cases',
    );
    return updated;
  }

  async isVerified(userId: string): Promise<boolean> {
    const profile = await this.prisma.expertProfile.findUnique({ where: { userId } });
    return profile?.credentialStatus === CredentialStatus.VERIFIED;
  }

  // Moderator-facing: the pool of experts eligible for case assignment. Only
  // VERIFIED experts, not the full roster — an unverified expert can't be
  // assigned per CasesService.assign's own enforcement, so offering them in
  // the picker would just be a dead-end click.
  async listVerified() {
    return this.prisma.expertProfile.findMany({
      where: { credentialStatus: CredentialStatus.VERIFIED },
      include: { user: { select: { id: true, name: true, mobileNumber: true } } },
      orderBy: { verifiedAt: 'desc' },
    });
  }
}

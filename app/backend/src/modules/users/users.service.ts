import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createStaffUser(dto: CreateStaffUserDto, actorId: string) {
    if (dto.role === Role.FARMER) {
      throw new BadRequestException(
        bi('Farmers self-register; use /auth/register instead', 'రైతులు స్వయంగా నమోదు చేసుకుంటారు; /auth/register ఉపయోగించండి'),
      );
    }
    const existing = await this.prisma.user.findUnique({ where: { mobileNumber: dto.mobileNumber } });
    if (existing) {
      throw new ConflictException(bi('Mobile number already registered', 'మొబైల్ నంబర్ ఇప్పటికే నమోదు అయింది'));
    }

    const passwordHash = await bcrypt.hash(dto.temporaryPassword, 12);
    const user = await this.prisma.user.create({
      data: {
        mobileNumber: dto.mobileNumber,
        passwordHash,
        name: dto.name,
        role: dto.role,
        isActive: true, // staff accounts are pre-activated by Administration
      },
    });

    if (dto.role === Role.EXPERT) {
      await this.prisma.expertProfile.create({ data: { userId: user.id } });
    }

    await this.audit.log({
      actorId,
      action: 'user.create_staff',
      entityType: 'User',
      entityId: user.id,
      metadata: { role: dto.role },
    });

    const { passwordHash: _omit, ...safeUser } = user;
    return safeUser;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(bi('User not found', 'వినియోగదారు కనుగొనబడలేదు'));
    const { passwordHash: _omit, ...safeUser } = user;
    return safeUser;
  }

  async list(role?: Role) {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return users.map(({ passwordHash: _omit, ...safeUser }) => safeUser);
  }

  // Deactivating revokes every refresh token too; JwtStrategy re-checks
  // isActive on each request, so access tokens stop working immediately.
  async setActive(targetId: string, isActive: boolean, actorId: string) {
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException(bi('User not found', 'వినియోగదారు కనుగొనబడలేదు'));
    if (!isActive) {
      if (targetId === actorId) {
        throw new BadRequestException(bi('You cannot deactivate your own account', 'మీరు మీ స్వంత ఖాతాను నిష్క్రియం చేయలేరు'));
      }
      if (target.role === Role.ADMINISTRATOR) {
        const otherAdmins = await this.prisma.user.count({
          where: { role: Role.ADMINISTRATOR, isActive: true, id: { not: targetId } },
        });
        if (otherAdmins === 0) {
          throw new BadRequestException(bi('Cannot deactivate the last active Administrator', 'చివరి యాక్టివ్ అడ్మినిస్ట్రేటర్‌ను నిష్క్రియం చేయలేరు'));
        }
      }
    }
    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: isActive ? { isActive: true, deactivatedAt: null } : { isActive: false, deactivatedAt: new Date() },
    });
    if (!isActive) {
      await this.prisma.refreshToken.updateMany({ where: { userId: targetId, revoked: false }, data: { revoked: true } });
    }
    await this.audit.log({
      actorId,
      action: isActive ? 'user.reactivate' : 'user.deactivate',
      entityType: 'User',
      entityId: targetId,
    });
    const { passwordHash: _omit, ...safeUser } = updated;
    return safeUser;
  }

  async changeMyPassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException(bi('Current password is incorrect', 'ప్రస్తుత పాస్‌వర్డ్ తప్పు'));
    }
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) } });
    await this.prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
    await this.audit.log({ actorId: userId, action: 'user.password_change', entityType: 'User', entityId: userId });
    return { message: bi('Password changed.', 'పాస్‌వర్డ్ మార్చబడింది.') };
  }
}

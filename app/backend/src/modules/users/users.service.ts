import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { nextUserCode } from '../../common/user-code';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

// Easy to read out over the phone: no 0/O or 1/l/I look-alikes, always has a letter and a digit.
const TEMP_PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateTemporaryPassword(length = 10): string {
  let out = '';
  for (let i = 0; i < length; i++) out += TEMP_PASSWORD_ALPHABET[crypto.randomInt(TEMP_PASSWORD_ALPHABET.length)];
  return /[a-zA-Z]/.test(out) && /\d/.test(out) ? out : generateTemporaryPassword(length);
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createStaffUser(dto: CreateStaffUserDto, actorId: string) {
    if (dto.role === Role.MEMBER || dto.role === Role.FARMER || dto.role === Role.CUSTOMER) {
      throw new BadRequestException(
        bi('Members sign themselves up; use /auth/register instead', 'సభ్యులు స్వయంగా నమోదు చేసుకుంటారు; /auth/register ఉపయోగించండి'),
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
        userCode: await nextUserCode(this.prisma, dto.role),
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

  // The Administrator's replacement for "forgot password": a one-time temporary password, shown
  // once to the Administrator, which the person must change at their next login. Replaces their
  // old password at once and signs them out everywhere.
  async issueTemporaryPassword(targetId: string, actorId: string) {
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException(bi('User not found', 'వినియోగదారు కనుగొనబడలేదు'));
    if (targetId === actorId) {
      throw new BadRequestException(bi('Use Account → change password for your own password', 'మీ స్వంత పాస్‌వర్డ్ కోసం ఖాతా → పాస్‌వర్డ్ మార్చండి వాడండి'));
    }
    if (!target.isActive) {
      throw new BadRequestException(bi('This account is not active', 'ఈ ఖాతా యాక్టివ్‌గా లేదు'));
    }
    const temporaryPassword = generateTemporaryPassword();
    await this.prisma.user.update({
      where: { id: targetId },
      data: { passwordHash: await bcrypt.hash(temporaryPassword, 12), mustChangePassword: true },
    });
    await this.prisma.refreshToken.updateMany({ where: { userId: targetId, revoked: false }, data: { revoked: true } });
    // The password itself is never written to the audit log.
    await this.audit.log({ actorId, action: 'user.temporary_password_issued', entityType: 'User', entityId: targetId });
    return {
      userId: targetId,
      name: target.name,
      userCode: target.userCode,
      temporaryPassword,
      message: bi(
        'Give this password to the person now. It is shown only once and they must change it when they log in.',
        'ఈ పాస్‌వర్డ్‌ను ఇప్పుడే వ్యక్తికి ఇవ్వండి. ఇది ఒక్కసారి మాత్రమే కనిపిస్తుంది, వారు లాగిన్ అయినప్పుడు దీన్ని మార్చాలి.',
      ),
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { whatsappOptIn: dto.whatsappOptIn } });
    await this.audit.log({ actorId: userId, action: dto.whatsappOptIn ? 'user.whatsapp_opt_in' : 'user.whatsapp_opt_out', entityType: 'User', entityId: userId });
    const { passwordHash: _omit, ...safeUser } = updated;
    return safeUser;
  }

  async changeMyPassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException(bi('Current password is incorrect', 'ప్రస్తుత పాస్‌వర్డ్ తప్పు'));
    }
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(bi('Choose a password different from the current one', 'ప్రస్తుత పాస్‌వర్డ్ కంటే భిన్నమైనదాన్ని ఎంచుకోండి'));
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 12), mustChangePassword: false },
    });
    await this.prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
    await this.audit.log({ actorId: userId, action: 'user.password_change', entityType: 'User', entityId: userId });
    return { message: bi('Password changed.', 'పాస్‌వర్డ్ మార్చబడింది.') };
  }
}

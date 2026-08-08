import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';

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
}

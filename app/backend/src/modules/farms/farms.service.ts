import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { CreateFarmLandDto } from './dto/create-farm-land.dto';
import { UpdateFarmLandDto } from './dto/update-farm-land.dto';

@Injectable()
export class FarmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(farmerId: string, dto: CreateFarmLandDto) {
    const farmLand = await this.prisma.farmLand.create({
      data: { ...dto, farmerId },
    });
    await this.audit.log({
      actorId: farmerId,
      action: 'farmland.create',
      entityType: 'FarmLand',
      entityId: farmLand.id,
    });
    return farmLand;
  }

  async listMine(farmerId: string) {
    return this.prisma.farmLand.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOwned(id: string, farmerId: string) {
    const farmLand = await this.prisma.farmLand.findUnique({ where: { id } });
    if (!farmLand) throw new NotFoundException(bi('Farm/Land parcel not found', 'పొలం స్థలం కనుగొనబడలేదు'));
    if (farmLand.farmerId !== farmerId) {
      throw new ForbiddenException(bi('This parcel does not belong to you', 'ఈ స్థలం మీది కాదు'));
    }
    return farmLand;
  }

  async update(id: string, farmerId: string, dto: UpdateFarmLandDto) {
    await this.getOwned(id, farmerId); // ownership check
    const farmLand = await this.prisma.farmLand.update({ where: { id }, data: dto });
    await this.audit.log({
      actorId: farmerId,
      action: 'farmland.update',
      entityType: 'FarmLand',
      entityId: farmLand.id,
    });
    return farmLand;
  }

  async remove(id: string, farmerId: string) {
    await this.getOwned(id, farmerId); // ownership check
    await this.prisma.farmLand.delete({ where: { id } });
    await this.audit.log({
      actorId: farmerId,
      action: 'farmland.delete',
      entityType: 'FarmLand',
      entityId: id,
    });
    return { message: bi('Farm/Land parcel removed.', 'పొలం స్థలం తీసివేయబడింది.') };
  }
}

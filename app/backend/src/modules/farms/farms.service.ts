import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
    // The same name, place and size twice is almost always a double tap, never two real parcels.
    const duplicate = await this.prisma.farmLand.findFirst({
      where: { farmerId, archivedAt: null, label: dto.label, address: dto.address, landSizeAcres: dto.landSizeAcres },
    });
    if (duplicate) {
      throw new ConflictException(
        bi('You already have a parcel with this name, place and size', 'ఈ పేరు, ప్రదేశం, పరిమాణంతో మీకు ఇప్పటికే ఒక స్థలం ఉంది'),
      );
    }
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
      where: { farmerId, archivedAt: null },
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

  // A parcel nobody has used is simply deleted. One that has cases or soil samples is hidden
  // instead (archived): deleting it would delete those cases, their advice and the articles made
  // from them along with it.
  async remove(id: string, farmerId: string) {
    await this.getOwned(id, farmerId); // ownership check
    const [cases, samples] = await Promise.all([
      this.prisma.case.count({ where: { farmLandId: id } }),
      this.prisma.soilSample.count({ where: { farmLandId: id } }),
    ]);
    if (cases + samples > 0) {
      await this.prisma.farmLand.update({ where: { id }, data: { archivedAt: new Date() } });
      await this.audit.log({ actorId: farmerId, action: 'farmland.archive', entityType: 'FarmLand', entityId: id, metadata: { cases, samples } });
      return {
        archived: true,
        message: bi(
          'This parcel has cases or soil tests, so it was hidden from your list instead — they stay safe.',
          'ఈ స్థలానికి కేసులు లేదా నేల పరీక్షలు ఉన్నాయి, కాబట్టి దాన్ని మీ జాబితా నుండి దాచాము — అవి భద్రంగా ఉంటాయి.',
        ),
      };
    }
    await this.prisma.farmLand.delete({ where: { id } });
    await this.audit.log({ actorId: farmerId, action: 'farmland.delete', entityType: 'FarmLand', entityId: id });
    return { archived: false, message: bi('Farm/Land parcel removed.', 'పొలం స్థలం తీసివేయబడింది.') };
  }
}

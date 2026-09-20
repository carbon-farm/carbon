import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Address } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { bi } from '../../common/i18n';
import { normalizePhone } from './address-format';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

const MAX_ADDRESSES = 10;

// The member's address book. Checkout copies the chosen address onto the order, so editing
// or deleting a saved address never changes where an existing order is being sent.
@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  }

  async getOwned(userId: string, id: string): Promise<Address> {
    const found = await this.prisma.address.findUnique({ where: { id } });
    if (!found || found.userId !== userId) throw new NotFoundException(bi('Address not found', 'చిరునామా కనుగొనబడలేదు'));
    return found;
  }

  // Trims text, keeps phone numbers in one plain 10-digit form, and turns an emptied
  // optional field into "cleared" rather than storing an empty string.
  private clean(dto: object): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined) continue;
      out[key] = typeof value === 'string' ? value.trim() : value;
    }
    if (typeof out.phone === 'string') out.phone = normalizePhone(out.phone);
    if (typeof out.alternatePhone === 'string') out.alternatePhone = out.alternatePhone ? normalizePhone(out.alternatePhone) : null;
    for (const k of ['label', 'line2', 'landmark', 'email']) if (out[k] === '') out[k] = null;
    return out;
  }

  async create(userId: string, dto: CreateAddressDto) {
    const count = await this.prisma.address.count({ where: { userId } });
    if (count >= MAX_ADDRESSES) {
      throw new BadRequestException(bi(`You can save up to ${MAX_ADDRESSES} addresses`, `మీరు గరిష్టంగా ${MAX_ADDRESSES} చిరునామాలను సేవ్ చేయవచ్చు`));
    }
    const makeDefault = dto.isDefault === true || count === 0; // the first address is the default
    const { isDefault: _ignored, ...rest } = dto;
    const data = this.clean(rest) as Omit<CreateAddressDto, 'isDefault'>;
    return this.prisma.$transaction(async (tx) => {
      if (makeDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      return tx.address.create({ data: { ...data, userId, isDefault: makeDefault } });
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    await this.getOwned(userId, id);
    const { isDefault, ...rest } = dto;
    const data = this.clean(rest);
    return this.prisma.$transaction(async (tx) => {
      if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data: { ...data, ...(isDefault ? { isDefault: true } : {}) } });
    });
  }

  setDefault(userId: string, id: string) {
    return this.update(userId, id, { isDefault: true });
  }

  async remove(userId: string, id: string) {
    const found = await this.getOwned(userId, id);
    await this.prisma.address.delete({ where: { id } });
    if (found.isDefault) {
      const next = await this.prisma.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
      if (next) await this.prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return { deleted: true };
  }
}

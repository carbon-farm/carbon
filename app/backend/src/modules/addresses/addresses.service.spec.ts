import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddressesService } from './addresses.service';

describe('AddressesService', () => {
  let prisma: any;
  let service: AddressesService;
  const base = { recipientName: ' Ravi ', phone: '+91 98765-43210', line1: '12-3 Main Rd', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' };

  beforeEach(() => {
    prisma = {
      address: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'a1', ...data })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'a1', ...data })),
        updateMany: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
    };
    service = new AddressesService(prisma);
  });

  it('the first address becomes the default; text is trimmed and the phone normalised', async () => {
    const created = await service.create('u1', base);
    expect(created).toMatchObject({ userId: 'u1', isDefault: true, recipientName: 'Ravi', phone: '9876543210' });
  });

  it('a later address is not the default unless asked, and asking demotes the old default', async () => {
    prisma.address.count.mockResolvedValue(2);
    expect((await service.create('u1', base)).isDefault).toBe(false);
    expect(prisma.address.updateMany).not.toHaveBeenCalled();
    expect((await service.create('u1', { ...base, isDefault: true })).isDefault).toBe(true);
    expect(prisma.address.updateMany).toHaveBeenCalledWith({ where: { userId: 'u1' }, data: { isDefault: false } });
  });

  it('stops at 10 saved addresses', async () => {
    prisma.address.count.mockResolvedValue(10);
    await expect(service.create('u1', base)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("never lets one member read, edit or delete another member's address", async () => {
    prisma.address.findUnique.mockResolvedValue({ id: 'a1', userId: 'someone-else' });
    await expect(service.getOwned('u1', 'a1')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.update('u1', 'a1', { city: 'X' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove('u1', 'a1')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.address.delete).not.toHaveBeenCalled();
  });

  it('an emptied optional field is cleared, not stored as an empty string', async () => {
    prisma.address.findUnique.mockResolvedValue({ id: 'a1', userId: 'u1' });
    await service.update('u1', 'a1', { landmark: '  ', alternatePhone: '' });
    expect(prisma.address.update.mock.calls[0][0].data).toMatchObject({ landmark: null, alternatePhone: null });
  });

  it('deleting the default promotes the most recent remaining address', async () => {
    prisma.address.findUnique.mockResolvedValue({ id: 'a1', userId: 'u1', isDefault: true });
    prisma.address.findFirst.mockResolvedValue({ id: 'a2' });
    await service.remove('u1', 'a1');
    expect(prisma.address.update).toHaveBeenCalledWith({ where: { id: 'a2' }, data: { isDefault: true } });
  });
});

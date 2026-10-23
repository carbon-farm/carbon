import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('UsersService.setActive', () => {
  let prisma: {
    user: { findUnique: jest.Mock; update: jest.Mock; count: jest.Mock };
    refreshToken: { updateMany: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let service: UsersService;

  const user = (over: Record<string, unknown> = {}) => ({
    id: 'u1', role: Role.MODERATOR, isActive: true, passwordHash: 'x', ...over,
  });

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn(), count: jest.fn() },
      refreshToken: { updateMany: jest.fn().mockResolvedValue({}) },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new UsersService(prisma as unknown as PrismaService, audit as unknown as AuditService);
  });

  it('refuses to let an Administrator deactivate their own account', async () => {
    prisma.user.findUnique.mockResolvedValue(user({ id: 'admin-1', role: Role.ADMINISTRATOR }));
    await expect(service.setActive('admin-1', false, 'admin-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('refuses to deactivate the last active Administrator', async () => {
    prisma.user.findUnique.mockResolvedValue(user({ id: 'admin-2', role: Role.ADMINISTRATOR }));
    prisma.user.count.mockResolvedValue(0);
    await expect(service.setActive('admin-2', false, 'admin-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deactivates, stamps deactivatedAt and revokes refresh tokens', async () => {
    prisma.user.findUnique.mockResolvedValue(user());
    prisma.user.update.mockResolvedValue(user({ isActive: false }));
    await service.setActive('u1', false, 'admin-1');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: false, deactivatedAt: expect.any(Date) }) }),
    );
    expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'user.deactivate' }));
  });

  it('reactivates and clears deactivatedAt', async () => {
    prisma.user.findUnique.mockResolvedValue(user({ isActive: false }));
    prisma.user.update.mockResolvedValue(user());
    await service.setActive('u1', true, 'admin-1');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: true, deactivatedAt: null } }),
    );
  });
});

describe('UsersService — temporary passwords', () => {
  let prisma: {
    user: { findUnique: jest.Mock; update: jest.Mock };
    refreshToken: { updateMany: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
      refreshToken: { updateMany: jest.fn().mockResolvedValue({}) },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new UsersService(prisma as unknown as PrismaService, audit as unknown as AuditService);
  });

  const member = { id: 'm1', name: 'Asha', userCode: 'HHC-0001', isActive: true, role: Role.MEMBER };

  it('issues a readable one-time password, forces a change, signs the person out and never audits the password', async () => {
    prisma.user.findUnique.mockResolvedValue(member);
    const res = await service.issueTemporaryPassword('m1', 'admin-1');
    expect(res.temporaryPassword).toMatch(/^[a-zA-Z2-9]{10}$/);
    expect(res.temporaryPassword).toMatch(/[a-zA-Z]/);
    expect(res.temporaryPassword).toMatch(/\d/);
    expect(res.temporaryPassword).not.toMatch(/[01OIl]/);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ mustChangePassword: true }) }));
    expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    expect(JSON.stringify(audit.log.mock.calls)).not.toContain(res.temporaryPassword);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'user.temporary_password_issued', entityId: 'm1' }));
  });

  it('gives different passwords each time', async () => {
    prisma.user.findUnique.mockResolvedValue(member);
    const a = await service.issueTemporaryPassword('m1', 'admin-1');
    const b = await service.issueTemporaryPassword('m1', 'admin-1');
    expect(a.temporaryPassword).not.toBe(b.temporaryPassword);
  });

  it('refuses your own account, an unknown account and an inactive account', async () => {
    prisma.user.findUnique.mockResolvedValue(member);
    await expect(service.issueTemporaryPassword('m1', 'm1')).rejects.toBeInstanceOf(BadRequestException);
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.issueTemporaryPassword('nope', 'admin-1')).rejects.toThrow();
    prisma.user.findUnique.mockResolvedValue({ ...member, isActive: false });
    await expect(service.issueTemporaryPassword('m1', 'admin-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

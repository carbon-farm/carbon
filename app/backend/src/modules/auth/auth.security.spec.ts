import { UnauthorizedException } from '@nestjs/common';
import { OtpPurpose, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

// The sign-in holes this guards against (found in the 2026-10 review):
//  1. Asking for a PASSWORD_RESET code returned the code on screen — anyone could reset anyone.
//  2. Asking for a REGISTRATION code for an *active* account and verifying it returned login
//     tokens for that account — a password-free log in as anyone, the Administrator included.
describe('AuthService — sign-in hardening', () => {
  let prisma: {
    user: { findUnique: jest.Mock; update: jest.Mock };
    otpVerification: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    auditLog: { count: jest.Mock };
    refreshToken: { create: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let notifications: { notifyRole: jest.Mock };
  let service: AuthService;

  const activeUser = { id: 'u1', name: 'Asha', userCode: 'HHC-0001', mobileNumber: '9876543210', isActive: true, deactivatedAt: null, role: Role.MEMBER, passwordHash: '', mustChangePassword: false };
  const pendingUser = { ...activeUser, isActive: false };

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn() },
      otpVerification: { create: jest.fn().mockResolvedValue({}), findFirst: jest.fn(), update: jest.fn().mockResolvedValue({}) },
      auditLog: { count: jest.fn().mockResolvedValue(0) },
      refreshToken: { create: jest.fn().mockResolvedValue({}) },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    notifications = { notifyRole: jest.fn().mockResolvedValue(undefined) };
    const config = { get: () => 'x', getOrThrow: () => 'x' };
    const jwt = { signAsync: jest.fn().mockResolvedValue('jwt') };
    service = new AuthService(prisma as never, jwt as never, config as never, audit as never, notifications as never);
  });

  describe('password reset request', () => {
    it('never returns or creates a code, and tells the administrators', async () => {
      prisma.user.findUnique.mockResolvedValue(activeUser);
      const res = (await service.requestOtp({ mobileNumber: activeUser.mobileNumber, purpose: OtpPurpose.PASSWORD_RESET })) as Record<string, unknown>;
      expect(res.devOtp).toBeUndefined();
      expect(prisma.otpVerification.create).not.toHaveBeenCalled();
      expect(notifications.notifyRole).toHaveBeenCalledWith(Role.ADMINISTRATOR, 'auth.password_reset_requested', expect.anything(), expect.anything(), '/admin/members');
    });

    it('answers identically for an unknown number (cannot be used to find who is registered)', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(activeUser).mockResolvedValueOnce(null);
      const known = await service.requestOtp({ mobileNumber: '9876543210', purpose: OtpPurpose.PASSWORD_RESET });
      const unknown = await service.requestOtp({ mobileNumber: '9000000001', purpose: OtpPurpose.PASSWORD_RESET });
      expect(unknown).toEqual(known);
      expect(notifications.notifyRole).toHaveBeenCalledTimes(1);
    });

    it('does not spam the administrators with repeat requests', async () => {
      prisma.user.findUnique.mockResolvedValue(activeUser);
      prisma.auditLog.count.mockResolvedValue(1); // already asked in the last 30 minutes
      await service.requestOtp({ mobileNumber: activeUser.mobileNumber, purpose: OtpPurpose.PASSWORD_RESET });
      expect(notifications.notifyRole).not.toHaveBeenCalled();
    });
  });

  describe('registration codes', () => {
    it.each([
      ['an active account', activeUser],
      ['a deactivated account', { ...activeUser, isActive: false, deactivatedAt: new Date() }],
      ['an unknown number', null],
    ])('are not issued for %s', async (_label, user) => {
      prisma.user.findUnique.mockResolvedValue(user);
      const res = (await service.requestOtp({ mobileNumber: '9876543210', purpose: OtpPurpose.REGISTRATION })) as Record<string, unknown>;
      expect(res.devOtp).toBeUndefined();
      expect(prisma.otpVerification.create).not.toHaveBeenCalled();
    });

    it('are issued for a sign-up still waiting to be activated', async () => {
      prisma.user.findUnique.mockResolvedValue(pendingUser);
      const res = (await service.requestOtp({ mobileNumber: '9876543210', purpose: OtpPurpose.REGISTRATION })) as { devOtp?: string };
      expect(res.devOtp).toMatch(/^\d{6}$/);
      expect(prisma.otpVerification.create).toHaveBeenCalledTimes(1);
    });

    it('cannot be used to log in as an active account even if a valid code exists', async () => {
      // A leftover code from before the fix, or one planted some other way.
      prisma.otpVerification.findFirst.mockResolvedValue({ id: 'o1', expiresAt: new Date(Date.now() + 60_000), attempts: 0, codeHash: (service as never as { hashOtp: (v: string) => string }).hashOtp('123456') });
      prisma.user.findUnique.mockResolvedValue(activeUser);
      await expect(service.verifyOtp({ mobileNumber: activeUser.mobileNumber, code: '123456', purpose: OtpPurpose.REGISTRATION })).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });
  });

  describe('log in', () => {
    it('locks a number after 8 wrong passwords, even for the right password afterwards', async () => {
      const hash = await bcrypt.hash('RightPassword1', 4);
      prisma.user.findUnique.mockResolvedValue({ ...activeUser, passwordHash: hash });
      for (let i = 0; i < 8; i++) {
        await expect(service.login({ mobileNumber: activeUser.mobileNumber, password: 'wrong' + i })).rejects.toBeInstanceOf(UnauthorizedException);
      }
      await expect(service.login({ mobileNumber: activeUser.mobileNumber, password: 'RightPassword1' })).rejects.toThrow(/Too many wrong attempts/);
    });

    it('a successful log in resets the count', async () => {
      const hash = await bcrypt.hash('RightPassword1', 4);
      prisma.user.findUnique.mockResolvedValue({ ...activeUser, passwordHash: hash });
      for (let i = 0; i < 5; i++) await expect(service.login({ mobileNumber: activeUser.mobileNumber, password: 'wrong' })).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(service.login({ mobileNumber: activeUser.mobileNumber, password: 'RightPassword1' })).resolves.toMatchObject({ role: Role.MEMBER, mustChangePassword: false });
      for (let i = 0; i < 5; i++) await expect(service.login({ mobileNumber: activeUser.mobileNumber, password: 'wrong' })).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(service.login({ mobileNumber: activeUser.mobileNumber, password: 'RightPassword1' })).resolves.toBeDefined();
    });

    it('reports when a temporary password must be changed', async () => {
      const hash = await bcrypt.hash('TempPass123', 4);
      prisma.user.findUnique.mockResolvedValue({ ...activeUser, passwordHash: hash, mustChangePassword: true });
      await expect(service.login({ mobileNumber: activeUser.mobileNumber, password: 'TempPass123' })).resolves.toMatchObject({ mustChangePassword: true });
    });
  });
});

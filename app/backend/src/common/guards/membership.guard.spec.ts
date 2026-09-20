import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { MembershipGuard } from './membership.guard';

const ctx = (user: unknown) => ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as unknown as ExecutionContext;

describe('MembershipGuard', () => {
  const build = (active: boolean) => {
    const hariharaa = { isActiveSubscriber: jest.fn().mockResolvedValue(active) };
    return { guard: new MembershipGuard(hariharaa as any), hariharaa };
  };
  it('lets a paid/free member through', async () => {
    const { guard } = build(true);
    await expect(guard.canActivate(ctx({ userId: 'u', role: 'MEMBER' }))).resolves.toBe(true);
  });
  it('blocks a member without an active membership', async () => {
    const { guard } = build(false);
    await expect(guard.canActivate(ctx({ userId: 'u', role: 'MEMBER' }))).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('never blocks staff, and does not even look up their membership', async () => {
    const { guard, hariharaa } = build(false);
    for (const role of ['EXPERT', 'MODERATOR', 'ADMINISTRATOR', 'VENDOR', 'SUPPORT_AGENT']) {
      await expect(guard.canActivate(ctx({ userId: 'u', role }))).resolves.toBe(true);
    }
    expect(hariharaa.isActiveSubscriber).not.toHaveBeenCalled();
  });
});

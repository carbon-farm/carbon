import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function buildContext(user: { role: Role } | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  // This guard is the entire enforcement mechanism behind Charter Section 15
  // (Security by Design) and the Farmer/Administrator boundary exercised
  // manually in the Stage 1 curl walkthrough — it earns a real test, not just
  // a manual check that isn't repeated.

  it('allows the request through when no @Roles() decorator is present', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = buildContext({ role: Role.FARMER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows the request through when the user has one of the required roles', () => {
    const reflector = { getAllAndOverride: () => [Role.ADMINISTRATOR] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = buildContext({ role: Role.ADMINISTRATOR });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when the user lacks the required role', () => {
    const reflector = { getAllAndOverride: () => [Role.ADMINISTRATOR] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = buildContext({ role: Role.FARMER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no authenticated user at all', () => {
    const reflector = { getAllAndOverride: () => [Role.ADMINISTRATOR] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = buildContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

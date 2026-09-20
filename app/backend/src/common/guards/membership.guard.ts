import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { HariharaaService } from '../../modules/hariharaa/hariharaa.service';
import { bi } from '../i18n';

// The paid-membership gate for the farm-advice features (cases, farms, soil testing,
// knowledge, courses). Only applies to the plain MEMBER role — staff (experts, moderators,
// administrators, vendors, support) do their jobs without a membership. Enforced here at
// the API layer, never left to the UI to hide a button; the frontend just mirrors it.
// Put it AFTER JwtAuthGuard so request.user exists.
@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(private readonly hariharaa: HariharaaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user: AuthenticatedUser | undefined = context.switchToHttp().getRequest().user;
    if (!user || user.role !== Role.MEMBER) return true;
    if (await this.hariharaa.isActiveSubscriber(user.userId)) return true;
    throw new ForbiddenException(
      bi('An active membership is required for this', 'దీనికి యాక్టివ్ సభ్యత్వం అవసరం'),
    );
  }
}

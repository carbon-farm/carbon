import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { bi } from '../i18n';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Without this override, a missing/expired token falls through to
  // passport's own generic "Unauthorized" — English-only, bypassing every
  // other bilingual message in the app. This is the one guard every
  // protected route goes through, so it's the one place this gap actually
  // surfaces to a farmer.
  handleRequest<TUser = unknown>(err: unknown, user: TUser, _info: unknown, _context: ExecutionContext): TUser {
    if (err || !user) {
      throw new UnauthorizedException(bi('Session expired — please log in again', 'సెషన్ గడువు ముగిసింది — దయచేసి మళ్ళీ లాగిన్ అవ్వండి'));
    }
    return user;
  }
}

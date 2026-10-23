import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { bi } from '../i18n';

// Everything a person on a temporary password may still do: see who they are, change the password,
// log out, and let the header's notification bell keep working.
const ALLOWED_WHILE_PASSWORD_CHANGE_PENDING = [
  { method: 'GET', path: '/users/me' },
  { method: 'POST', path: '/users/me/password' },
  { method: 'POST', path: '/auth/logout' },
  { method: 'GET', path: '/notifications/unread-count' },
];

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Without this override, a missing/expired token falls through to
  // passport's own generic "Unauthorized" — English-only, bypassing every
  // other bilingual message in the app. This is the one guard every
  // protected route goes through, so it's the one place this gap actually
  // surfaces to a farmer.
  handleRequest<TUser = unknown>(err: unknown, user: TUser, _info: unknown, context: ExecutionContext): TUser {
    if (err || !user) {
      throw new UnauthorizedException(bi('Session expired — please log in again', 'సెషన్ గడువు ముగిసింది — దయచేసి మళ్ళీ లాగిన్ అవ్వండి'));
    }
    if ((user as { mustChangePassword?: boolean }).mustChangePassword) {
      const req = context.switchToHttp().getRequest<{ method: string; originalUrl?: string; url: string }>();
      const path = (req.originalUrl ?? req.url).split('?')[0].replace(/^\/api\/v1/, '');
      if (!ALLOWED_WHILE_PASSWORD_CHANGE_PENDING.some((a) => a.method === req.method && a.path === path)) {
        throw new ForbiddenException(
          bi('Please choose your own password first (Account → change password)', 'ముందుగా మీ స్వంత పాస్‌వర్డ్‌ను ఎంచుకోండి (ఖాతా → పాస్‌వర్డ్ మార్చండి)'),
        );
      }
    }
    return user;
  }
}

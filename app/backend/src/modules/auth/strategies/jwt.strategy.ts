import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { bi } from '../../../common/i18n';
import { normalizeRole } from '../../../common/role-compat';

interface JwtPayload {
  sub: string;
  role: string;
  mobileNumber: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  // Checked against the DB on every request (not just at login) so an
  // Administrator deactivating an account takes effect immediately instead
  // of after the 15-minute access token expires.
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { isActive: true } });
    if (!user?.isActive) {
      throw new UnauthorizedException(bi('This account is deactivated', 'ఈ ఖాతా నిష్క్రియం చేయబడింది'));
    }
    // A token issued before the FARMER/CUSTOMER -> MEMBER merge still carries the old role.
    return { userId: payload.sub, role: normalizeRole(payload.role), mobileNumber: payload.mobileNumber };
  }
}

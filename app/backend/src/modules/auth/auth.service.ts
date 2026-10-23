import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtService } from '@nestjs/jwt';
import { OtpPurpose, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { bi } from '../../common/i18n';
import { nextUserCode } from '../../common/user-code';
import { normalizeRole } from '../../common/role-compat';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_TTL_MINUTES = 15;

// Brute-force guard: after this many wrong passwords for one mobile number within the window,
// further attempts are refused for the rest of the window (even with the right password), so
// guessing is pointless. In memory is enough for a single server; the per-IP limit in the
// throttler is the second layer.
const LOGIN_MAX_FAILURES = 8;
const LOGIN_WINDOW_MS = 15 * 60_000;
// Admins are told about a password-reset request at most this often per number.
const RESET_NOTICE_COOLDOWN_MS = 30 * 60_000;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private readonly loginFailures = new Map<string, { count: number; first: number }>();

  private loginLocked(mobileNumber: string): boolean {
    const f = this.loginFailures.get(mobileNumber);
    if (!f) return false;
    if (Date.now() - f.first > LOGIN_WINDOW_MS) {
      this.loginFailures.delete(mobileNumber);
      return false;
    }
    return f.count >= LOGIN_MAX_FAILURES;
  }

  private noteLoginFailure(mobileNumber: string) {
    const f = this.loginFailures.get(mobileNumber);
    if (!f || Date.now() - f.first > LOGIN_WINDOW_MS) this.loginFailures.set(mobileNumber, { count: 1, first: Date.now() });
    else f.count += 1;
    // Keep the map small: forget anything that has aged out.
    if (this.loginFailures.size > 5000) {
      for (const [k, v] of this.loginFailures) if (Date.now() - v.first > LOGIN_WINDOW_MS) this.loginFailures.delete(k);
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { mobileNumber: dto.mobileNumber },
    });

    // A previously-registered but never-activated account (the farmer missed
    // their on-screen code, or its 10-minute window expired) is not a
    // conflict — it's a pending registration with no way to get a fresh code
    // otherwise, since this is the only entry point that issues one. Treat it
    // as a resend: update the details in case they're correcting a typo, and
    // issue a new OTP against the same user row rather than creating a
    // second one or rejecting them outright.
    if (existing?.isActive || existing?.deactivatedAt) {
      throw new ConflictException(bi('Mobile number already registered', 'మొబైల్ నంబర్ ఇప్పటికే నమోదు అయింది'));
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    // One account type for everyone who signs up; what they can do depends on membership.
    const role = Role.MEMBER;
    const user = existing
      ? await this.prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash, name: dto.name, preferredLanguage: dto.preferredLanguage ?? 'te' },
        })
      : await this.prisma.user.create({
          data: {
            mobileNumber: dto.mobileNumber,
            passwordHash,
            name: dto.name,
            role,
            // Only a brand-new account takes a number; a resent registration keeps its own.
            userCode: await nextUserCode(this.prisma, role),
            preferredLanguage: dto.preferredLanguage ?? 'te',
            isActive: false, // activated once REGISTRATION OTP is verified
          },
        });

    await this.audit.log({
      actorId: user.id,
      action: existing ? 'user.register.resend' : 'user.register',
      entityType: 'User',
      entityId: user.id,
    });

    const otp = await this.issueOtp(dto.mobileNumber, OtpPurpose.REGISTRATION);
    return {
      userId: user.id,
      message: bi(
        'Registered. Enter the verification code shown next to activate your account.',
        'నమోదు పూర్తయింది. మీ ఖాతాను యాక్టివేట్ చేయడానికి తర్వాత చూపించే ధృవీకరణ కోడ్‌ను నమోదు చేయండి.',
      ),
      ...(otp.devCode ? { devOtp: otp.devCode } : {}),
    };
  }

  async login(dto: LoginDto): Promise<TokenPair & { role: Role; mustChangePassword: boolean }> {
    if (this.loginLocked(dto.mobileNumber)) {
      throw new UnauthorizedException(
        bi('Too many wrong attempts — wait 15 minutes and try again', 'చాలా తప్పు ప్రయత్నాలు — 15 నిమిషాలు ఆగి మళ్ళీ ప్రయత్నించండి'),
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { mobileNumber: dto.mobileNumber },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      this.noteLoginFailure(dto.mobileNumber);
      throw new UnauthorizedException(bi('Invalid mobile number or password', 'తప్పు మొబైల్ నంబర్ లేదా పాస్‌వర్డ్'));
    }
    this.loginFailures.delete(dto.mobileNumber);
    if (!user.isActive) {
      throw new UnauthorizedException(
        user.deactivatedAt
          ? bi('This account is deactivated — contact an Administrator', 'ఈ ఖాతా నిష్క్రియం చేయబడింది — అడ్మినిస్ట్రేటర్‌ను సంప్రదించండి')
          : bi('Account not yet activated — verify your OTP first', 'ఖాతా ఇంకా యాక్టివేట్ కాలేదు — ముందుగా మీ OTPని ధృవీకరించండి'),
      );
    }

    await this.audit.log({
      actorId: user.id,
      action: 'user.login',
      entityType: 'User',
      entityId: user.id,
    });

    const tokens = await this.issueTokenPair(user.id, user.role, user.mobileNumber);
    return { ...tokens, role: normalizeRole(user.role) as Role, mustChangePassword: user.mustChangePassword };
  }

  // The same answer whoever asks and whatever the number, so this cannot be used to find out
  // which numbers are registered.
  private readonly genericResetMessage = bi(
    'If this number is registered, the store has been told. An Administrator will give you a temporary password — contact the store and quote your ID.',
    'ఈ నంబర్ నమోదు అయి ఉంటే, స్టోర్‌కు తెలియజేయబడింది. అడ్మినిస్ట్రేటర్ మీకు తాత్కాలిక పాస్‌వర్డ్ ఇస్తారు — స్టోర్‌ను సంప్రదించి మీ IDని చెప్పండి.',
  );

  async requestOtp(dto: RequestOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobileNumber: dto.mobileNumber },
    });

    if (dto.purpose === OtpPurpose.PASSWORD_RESET) {
      // There is no SMS/WhatsApp channel, so a code can never prove the asker owns the number —
      // handing it back on screen let anyone reset anyone's password. Instead: tell the
      // Administrators, who give the person a temporary password after checking who they are.
      if (user?.isActive) await this.notifyAdminsOfResetRequest(user.id, user.name, user.userCode, user.mobileNumber);
      return { message: this.genericResetMessage };
    }

    // REGISTRATION codes only exist for a sign-up that is still waiting to be activated. For
    // anyone else (an active account, a deactivated one, an unknown number) answer the same way
    // and issue nothing — otherwise a registration code could be used to log in as that person.
    if (!user || user.isActive || user.deactivatedAt) {
      return { message: bi('Verification code ready.', 'ధృవీకరణ కోడ్ సిద్ధంగా ఉంది.') };
    }
    const otp = await this.issueOtp(dto.mobileNumber, dto.purpose);
    return {
      message: bi('Verification code ready.', 'ధృవీకరణ కోడ్ సిద్ధంగా ఉంది.'),
      ...(otp.devCode ? { devOtp: otp.devCode } : {}),
    };
  }

  private async notifyAdminsOfResetRequest(userId: string, name: string, userCode: string, mobileNumber: string) {
    const since = new Date(Date.now() - RESET_NOTICE_COOLDOWN_MS);
    const recent = await this.prisma.auditLog.count({
      where: { action: 'user.password_reset_requested', entityId: userId, createdAt: { gte: since } },
    });
    if (recent > 0) return;
    await this.audit.log({ actorId: userId, action: 'user.password_reset_requested', entityType: 'User', entityId: userId });
    await this.notifications.notifyRole(
      Role.ADMINISTRATOR,
      'auth.password_reset_requested',
      bi('Password reset requested', 'పాస్‌వర్డ్ రీసెట్ అభ్యర్థన'),
      bi(
        `${name} (${userCode}, ${mobileNumber}) asked to reset their password. Check it is really them, then issue a temporary password.`,
        `${name} (${userCode}, ${mobileNumber}) తమ పాస్‌వర్డ్ రీసెట్ చేయమని అడిగారు. నిజంగా వారేనని నిర్ధారించుకుని, తాత్కాలిక పాస్‌వర్డ్ ఇవ్వండి.`,
      ),
      '/admin/members',
    );
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        mobileNumber: dto.mobileNumber,
        purpose: dto.purpose,
        consumed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException(
        bi('OTP expired or not found — request a new one', 'OTP గడువు ముగిసింది లేదా కనుగొనబడలేదు — కొత్తదాన్ని అభ్యర్థించండి'),
      );
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw new UnauthorizedException(bi('Too many attempts — request a new OTP', 'చాలా ప్రయత్నాలు జరిగాయి — కొత్త OTPని అభ్యర్థించండి'));
    }

    const codeHash = this.hashOtp(dto.code);
    if (codeHash !== record.codeHash) {
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException(bi('Incorrect OTP', 'తప్పు OTP'));
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { consumed: true },
    });

    if (dto.purpose === OtpPurpose.REGISTRATION) {
      const pending = await this.prisma.user.findUnique({ where: { mobileNumber: dto.mobileNumber } });
      // Only a sign-up still waiting to be activated can be completed this way. Never an active
      // account (that would be a password-free login) and never a deactivated one.
      if (!pending || pending.isActive || pending.deactivatedAt) {
        throw new UnauthorizedException(
          bi('OTP expired or not found — request a new one', 'OTP గడువు ముగిసింది లేదా కనుగొనబడలేదు — కొత్తదాన్ని అభ్యర్థించండి'),
        );
      }
      const user = await this.prisma.user.update({
        where: { mobileNumber: dto.mobileNumber },
        data: { isActive: true },
      });
      await this.audit.log({
        actorId: user.id,
        action: 'user.activate',
        entityType: 'User',
        entityId: user.id,
      });
      const tokens = await this.issueTokenPair(user.id, user.role, user.mobileNumber);
      return { verified: true, role: normalizeRole(user.role), ...tokens };
    }

    // PASSWORD_RESET: issue a short-lived, single-purpose reset token instead of
    // logging the user in — the caller must still supply a new password.
    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.otpVerification.create({
      data: {
        mobileNumber: dto.mobileNumber,
        codeHash: this.hashOtp(resetToken),
        purpose: OtpPurpose.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000),
        consumed: false,
      },
    });
    return { verified: true, resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        mobileNumber: dto.mobileNumber,
        purpose: OtpPurpose.PASSWORD_RESET,
        consumed: false,
        codeHash: this.hashOtp(dto.resetToken),
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException(bi('Reset token invalid or expired', 'రీసెట్ టోకెన్ చెల్లదు లేదా గడువు ముగిసింది'));
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { consumed: true },
    });

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    const user = await this.prisma.user.update({
      where: { mobileNumber: dto.mobileNumber },
      data: { passwordHash, mustChangePassword: false },
    });

    // Revoke all existing refresh tokens on password reset.
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    });

    await this.audit.log({
      actorId: user.id,
      action: 'user.password_reset',
      entityType: 'User',
      entityId: user.id,
    });

    return { message: bi('Password reset successfully.', 'పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది.') };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashOtp(refreshToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!record || record.revoked || record.expiresAt < new Date() || !record.user.isActive) {
      throw new UnauthorizedException(bi('Invalid or expired refresh token', 'చెల్లని లేదా గడువు ముగిసిన రిఫ్రెష్ టోకెన్'));
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revoked: true },
    });

    return this.issueTokenPair(record.user.id, record.user.role, record.user.mobileNumber);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    return { message: bi('Logged out.', 'లాగ్ అవుట్ అయ్యారు.') };
  }

  private async issueTokenPair(userId: string, role: Role, mobileNumber: string): Promise<TokenPair> {
    const payload = { sub: userId, role, mobileNumber };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL') ?? '15m',
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL') ?? '30d';
    const expiresAt = new Date(Date.now() + this.parseTtlMs(refreshTtl));
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashOtp(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async issueOtp(mobileNumber: string, purpose: OtpPurpose) {
    const code = crypto.randomInt(100000, 1_000_000).toString();
    await this.prisma.otpVerification.create({
      data: {
        mobileNumber,
        codeHash: this.hashOtp(code),
        purpose,
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
      },
    });

    // DELIBERATE, TEMPORARY: no SMS/WhatsApp gateway is wired up yet
    // (Notifications is a later module — 01-Product/04-Product-Roadmap.md),
    // and every real delivery channel costs money per message. Until that's
    // built, the code is returned to the client and shown on-screen instead
    // of texted — this is a known, accepted gap while other modules are
    // built, NOT a secure verification flow: it doesn't prove the requester
    // controls that mobile number, so anyone who knows a farmer's number can
    // see their registration/password-reset code. Must be replaced with a
    // real send before any real farmer is onboarded onto the live site.
    // eslint-disable-next-line no-console
    console.log(`[on-screen-otp] ${mobileNumber} (${purpose}): ${code}`);
    return { devCode: code };
  }

  private hashOtp(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private parseTtlMs(ttl: string): number {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) return 30 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
    return value * unitMs;
  }
}

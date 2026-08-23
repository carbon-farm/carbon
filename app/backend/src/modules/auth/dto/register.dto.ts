import { IsIn, IsMobilePhone, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsMobilePhone('en-IN')
  mobileNumber!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  // Public self-registration may only ever request FARMER or CUSTOMER — the
  // two roles this app lets someone sign themselves up for. Every other
  // role is Administrator-created only (Staff accounts), so this is
  // deliberately @IsIn(...) rather than the full @IsEnum(Role) used
  // elsewhere for admin-facing staff creation.
  @IsOptional()
  @IsIn([Role.FARMER, Role.CUSTOMER])
  role?: Role;
}

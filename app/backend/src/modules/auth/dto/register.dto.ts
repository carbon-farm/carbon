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

  // IGNORED. Everyone who signs up is a MEMBER now. The field is still accepted only so
  // a cached copy of the old site (which sent role: FARMER/CUSTOMER) doesn't get a 400
  // during the transition; it can never choose the account type, and staff roles are
  // rejected here so registration can never be used to ask for a privileged one.
  @IsOptional()
  @IsIn([Role.FARMER, Role.CUSTOMER, Role.MEMBER])
  role?: Role;
}

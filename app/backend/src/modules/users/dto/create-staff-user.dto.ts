import { IsEnum, IsMobilePhone, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

// Only Administration creates non-Farmer accounts in Stage 1 — there is no
// public self-registration path for Expert, Moderator, Administrator, Vendor,
// or Support Agent, per Charter Section 8 / Assumption A4.
export class CreateStaffUserDto {
  @IsMobilePhone('en-IN')
  mobileNumber!: string;

  @IsString()
  @MinLength(8)
  temporaryPassword!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  // Typed as the full Role enum, not Exclude<Role, 'FARMER'>: class-validator's
  // @IsEnum(Role) only ever checks against the full enum at runtime, so a
  // narrower compile-time type here would be misleading. FARMER is rejected by
  // UsersService.createStaffUser at runtime instead — see the actual guard there.
  @IsEnum(Role)
  role!: Role;
}

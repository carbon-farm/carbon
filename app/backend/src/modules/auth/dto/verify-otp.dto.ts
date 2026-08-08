import { IsEnum, IsMobilePhone, IsString, Length } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class VerifyOtpDto {
  @IsMobilePhone('en-IN')
  mobileNumber!: string;

  @IsString()
  @Length(6, 6)
  code!: string;

  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;
}

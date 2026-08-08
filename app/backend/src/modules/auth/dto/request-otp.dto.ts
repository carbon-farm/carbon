import { IsEnum, IsMobilePhone } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class RequestOtpDto {
  @IsMobilePhone('en-IN')
  mobileNumber!: string;

  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;
}

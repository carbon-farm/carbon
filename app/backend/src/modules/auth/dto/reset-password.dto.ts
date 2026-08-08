import { IsMobilePhone, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsMobilePhone('en-IN')
  mobileNumber!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  // Short-lived token issued by verify-otp for PASSWORD_RESET, proving the OTP
  // step already happened — the reset endpoint never re-checks the OTP itself.
  @IsString()
  resetToken!: string;
}

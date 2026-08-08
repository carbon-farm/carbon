import { IsMobilePhone, IsOptional, IsString, MinLength } from 'class-validator';

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
}

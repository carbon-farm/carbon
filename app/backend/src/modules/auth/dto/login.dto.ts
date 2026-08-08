import { IsMobilePhone, IsString } from 'class-validator';

export class LoginDto {
  @IsMobilePhone('en-IN')
  mobileNumber!: string;

  @IsString()
  password!: string;
}

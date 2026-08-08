import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class VerifyCredentialDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  reason?: string; // required in spirit when approve = false; enforced in service
}

import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitVendorProfileDto {
  @IsString()
  @MinLength(3)
  businessName!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class VerifyVendorDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  reason?: string; // required in spirit when approve = false; enforced in service
}

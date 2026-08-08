import { IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitCredentialsDto {
  @IsString()
  @MinLength(2)
  qualification!: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;
}

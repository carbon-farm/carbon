import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsNumber()
  @Min(1)
  subscriptionPriceInr!: number;

  @IsOptional()
  @IsString()
  payeeName?: string;

  @IsString()
  @MinLength(3)
  primaryUpiId!: string;

  @IsOptional()
  @IsString()
  secondaryUpiId?: string;
}

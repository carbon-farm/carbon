import { IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitClaimDto {
  @IsString()
  @MinLength(2)
  paymentReference!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

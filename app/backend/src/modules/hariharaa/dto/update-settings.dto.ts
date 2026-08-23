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

  // Which VendorProfile's products make up the HARIHARAA catalog — set once,
  // after the vendor account is created and approved via the normal
  // Staff-account + vendor-approval flow (no separate product-management UI
  // needed; the existing Vendor dashboard is reused as-is).
  @IsOptional()
  @IsString()
  vendorProfileId?: string;
}

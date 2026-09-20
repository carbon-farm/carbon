import { IsNumber, IsOptional, IsString, Matches, Min, ValidateIf } from 'class-validator';

// A UPI ID (VPA) looks like name@bank: letters, digits, dot, dash or underscore, an @, then the
// bank/app handle. Checked here so a typo cannot be saved and then break every payment link.
export const UPI_ID = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/;
const UPI_MESSAGE = 'UPI ID must look like name@bank (for example shop@okaxis)';

export class UpdateSettingsDto {
  // Legacy: prices now live on the plans (Membership plans page). Still accepted so an older
  // screen keeps working; it is no longer required.
  @IsOptional()
  @IsNumber()
  @Min(1)
  subscriptionPriceInr?: number;

  @IsOptional()
  @IsString()
  payeeName?: string;

  // The UPI ID every membership and order payment is made to.
  @Matches(UPI_ID, { message: UPI_MESSAGE })
  primaryUpiId!: string;

  // A spare UPI ID kept on file (not used for payments until it is swapped into the main one).
  // Send an empty string to remove it.
  @IsOptional()
  @ValidateIf((o) => o.secondaryUpiId !== '')
  @Matches(UPI_ID, { message: UPI_MESSAGE })
  secondaryUpiId?: string;

  // Which VendorProfile's products make up the HARIHARAA catalog — set once,
  // after the vendor account is created and approved via the normal
  // Staff-account + vendor-approval flow (no separate product-management UI
  // needed; the existing Vendor dashboard is reused as-is). Empty string clears it.
  @IsOptional()
  @IsString()
  vendorProfileId?: string;

  // The `aid=` value from the merchant's own Google Pay QR — see upi-link.ts. It belongs to the
  // merchant account behind the UPI ID, so it must be changed (or cleared) with it. Empty clears it.
  @IsOptional()
  @IsString()
  upiAid?: string;
}

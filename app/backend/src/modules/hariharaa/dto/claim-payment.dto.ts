import { IsOptional, IsString, Matches } from 'class-validator';

export class ClaimPaymentDto {
  // The bank reference (UTR) shown in the customer's UPI app after paying. Letters,
  // digits and a few separators — also wide enough for a gateway's payment id later.
  // Surrounding whitespace is allowed here (copy-pasting from a UPI app often brings
  // a trailing space or newline along); the service trims it before storing.
  @IsString()
  @Matches(/^\s*[A-Za-z0-9\-_./]{6,40}\s*$/, { message: 'utr must be 6-40 letters/digits (as shown in your UPI app)' })
  utr!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

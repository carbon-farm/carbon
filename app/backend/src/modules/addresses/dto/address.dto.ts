import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const PHONE = /^\s*(\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}\s*$/;

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  label?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  recipientName!: string;

  @Matches(PHONE, { message: 'phone must be a valid 10-digit Indian mobile number' })
  phone!: string;

  @IsOptional()
  @Matches(PHONE, { message: 'alternatePhone must be a valid 10-digit Indian mobile number' })
  alternatePhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  line1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  line2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  landmark?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  city!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  state!: string;

  @Matches(/^[1-9]\d{5}$/, { message: 'pincode must be 6 digits' })
  pincode!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional() @IsString() @MaxLength(30) label?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) recipientName?: string;
  @IsOptional() @Matches(PHONE, { message: 'phone must be a valid 10-digit Indian mobile number' }) phone?: string;
  @IsOptional() @Matches(PHONE, { message: 'alternatePhone must be a valid 10-digit Indian mobile number' }) alternatePhone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(120) line1?: string;
  @IsOptional() @IsString() @MaxLength(120) line2?: string;
  @IsOptional() @IsString() @MaxLength(80) landmark?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(60) city?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(60) state?: string;
  @IsOptional() @Matches(/^[1-9]\d{5}$/, { message: 'pincode must be 6 digits' }) pincode?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

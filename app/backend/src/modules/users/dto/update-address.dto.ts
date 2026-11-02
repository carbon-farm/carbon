import { IsString, MaxLength } from 'class-validator';

export class UpdateAddressDto {
  // Empty clears it.
  @IsString()
  @MaxLength(500)
  postalAddress!: string;
}

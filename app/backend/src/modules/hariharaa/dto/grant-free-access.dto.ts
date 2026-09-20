import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class GrantFreeAccessDto {
  // A date ("2026-12-31", from a date picker — meaning the end of that day in India)
  // or a full ISO timestamp.
  @IsDateString()
  until!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

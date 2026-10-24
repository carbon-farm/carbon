import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateSeasonalTipDto {
  @IsString() @MinLength(3) @MaxLength(120) titleEn!: string;
  @IsString() @MinLength(3) @MaxLength(160) titleTe!: string;
  @IsString() @MinLength(10) @MaxLength(1200) bodyEn!: string;
  @IsString() @MinLength(10) @MaxLength(1600) bodyTe!: string;
  @IsInt() @Min(1) @Max(12) startMonth!: number;
  @IsInt() @Min(1) @Max(12) endMonth!: number;
  @IsOptional() @IsUUID() cropId?: string;
}

export class UpdateSeasonalTipDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(160) titleTe?: string;
  @IsOptional() @IsString() @MinLength(10) @MaxLength(1200) bodyEn?: string;
  @IsOptional() @IsString() @MinLength(10) @MaxLength(1600) bodyTe?: string;
  @IsOptional() @IsInt() @Min(1) @Max(12) startMonth?: number;
  @IsOptional() @IsInt() @Min(1) @Max(12) endMonth?: number;
  // null = for everyone again
  @IsOptional() @IsUUID() cropId?: string | null;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

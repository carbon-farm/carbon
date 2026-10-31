import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCropCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nameEn!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nameTe!: string;

  // key of the category this is a sub-category of; leave out for a top-level category
  @IsOptional()
  @IsString()
  parentKey?: string;
}

// Where a group sits (its parent) and its key never change — crops point at the key.
export class UpdateCropCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nameEn?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nameTe?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { ArrayMaxSize, ArrayUnique, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

// The English name is deliberately not editable: parcels, seasonal tips and articles match crops by it.
export class UpdateCropDto {
  // an empty string clears the Telugu name
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nameTe?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ArrayUnique()
  @IsString({ each: true })
  categories?: string[];
}

import { ArrayMinSize, IsArray, IsLatitude, IsLongitude, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateFarmLandDto {
  @IsString()
  @MinLength(2)
  label!: string;

  @IsString()
  @MinLength(5)
  address!: string;

  @IsNumber()
  @IsPositive()
  landSizeAcres!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  primaryCrops!: string[];

  // Optional GPS pin from the browser's Geolocation API — either both are
  // present or neither is; there's no case for one without the other.
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}

import { IsString, MinLength } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  state!: string;
}

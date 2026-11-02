import { IsString, MaxLength, MinLength } from 'class-validator';

export class RemoveEvidenceDto {
  // The address of one of this case's own photos/videos, exactly as it was listed.
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  url!: string;
}

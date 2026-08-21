import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  assignmentText?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}

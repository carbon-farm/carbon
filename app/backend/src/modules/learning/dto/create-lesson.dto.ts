import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { LessonContentType } from '@prisma/client';

export class CreateLessonDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsEnum(LessonContentType)
  contentType!: LessonContentType;

  // Required (and only meaningful) when contentType is ASSIGNMENT — enforced
  // in the service rather than here, since class-validator can't easily
  // express "required if this other field equals X" without extra plumbing.
  @IsOptional()
  @IsString()
  @MinLength(5)
  assignmentText?: string;
}

import { IsString, MinLength } from 'class-validator';

export class AnswerCaseDto {
  @IsString()
  @MinLength(5)
  resolutionNotes!: string;
}

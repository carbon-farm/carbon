import { IsString, MinLength } from 'class-validator';

export class RejectArticleDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}

import { IsString, MinLength } from 'class-validator';

export class SendBackArticleDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}

import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  @MinLength(20)
  content!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

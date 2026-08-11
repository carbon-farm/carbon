import { IsArray, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

// No CreateArticleDto anymore — articles are never authored from scratch,
// only auto-generated from a Closed case (see KnowledgeService.createDraftFromCase)
// and then refined by the case's expert through this same edit path.
export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @IsOptional()
  @IsUUID()
  cropId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  symptoms?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  expertSolution?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}

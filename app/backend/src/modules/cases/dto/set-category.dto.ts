import { IsUUID } from 'class-validator';

export class SetCategoryDto {
  @IsUUID()
  categoryId!: string;
}

import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

// Hearts a visitor gave products before signing in (kept in their browser), sent once they do.
export class MergeWishlistDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  productIds!: string[];
}

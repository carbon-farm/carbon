import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;
}

// A cart built while signed out (kept in the browser) — used both to price it for display
// and to fold it into the member's saved cart right after they sign in or register.
export class GuestCartDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AddToCartDto)
  items!: AddToCartDto[];
}

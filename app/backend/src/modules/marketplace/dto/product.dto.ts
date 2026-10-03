import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

// Sensible limits so a slip of the finger cannot create a ₹0 product, a 3-decimal price, or a
// stock figure the database cannot hold.
export const MAX_PRICE = 1_000_000;
export const MAX_STOCK = 1_000_000;

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  // In rupees, to the paisa, and never free by accident.
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(MAX_PRICE)
  price!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(30)
  unit!: string;

  @IsInt()
  @Min(0)
  @Max(MAX_STOCK)
  stockQuantity!: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MinLength(10) @MaxLength(2000) description?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(MAX_PRICE) price?: number;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(30) unit?: string;

  // Still accepted so an older screen keeps working, but it is applied as a recorded stock-take
  // ("SET"), never as a blind overwrite — see MarketplaceService.updateProduct.
  @IsOptional() @IsInt() @Min(0) @Max(MAX_STOCK) stockQuantity?: number;

  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export const STOCK_MODES = ['ADD', 'REDUCE', 'SET'] as const;
export type StockMode = (typeof STOCK_MODES)[number];

// ADD: stock received. REDUCE: stock taken out (damaged, expired, given away). SET: a stock-take —
// correct the count to what was actually counted.
export class AdjustStockDto {
  @IsIn(STOCK_MODES)
  mode!: StockMode;

  @IsInt()
  @Min(0)
  @Max(MAX_STOCK)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}

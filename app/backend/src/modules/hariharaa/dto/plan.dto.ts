import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  // Telugu name, shown after the English one.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  nameTe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100000)
  priceInr!: number;

  // How many days of access one payment buys.
  @IsInt()
  @Min(1)
  @Max(3660)
  periodDays!: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePlanDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(60) name?: string;
  @IsOptional() @IsString() @MaxLength(60) nameTe?: string;
  @IsOptional() @IsString() @MaxLength(200) description?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(1) @Max(100000) priceInr?: number;
  @IsOptional() @IsInt() @Min(1) @Max(3660) periodDays?: number;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// Which plan the member is paying for. Optional so an older screen that sends nothing still
// works: it gets the first active plan.
export class StartPaymentDto {
  @IsOptional()
  @IsUUID()
  planId?: string;
}

export class MembershipRequiredDto {
  @IsBoolean()
  required!: boolean;
}

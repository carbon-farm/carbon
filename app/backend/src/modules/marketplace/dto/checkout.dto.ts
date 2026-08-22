import { IsString, MinLength } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @MinLength(10)
  deliveryAddress!: string;
}

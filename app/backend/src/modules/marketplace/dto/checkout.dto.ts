import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export const PAYMENT_METHODS = ['COD', 'UPI'] as const;
export type CheckoutPaymentMethod = (typeof PAYMENT_METHODS)[number];

export class CheckoutDto {
  // The saved address to deliver to. Checkout copies it onto the order.
  @IsOptional()
  @IsUUID()
  addressId?: string;

  // Old clients (a screen cached from before the address book) still send plain text.
  // Accepted, but the structured addressId path is the normal one.
  @IsOptional()
  @IsString()
  @MinLength(10)
  deliveryAddress?: string;

  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  paymentMethod?: CheckoutPaymentMethod;
}

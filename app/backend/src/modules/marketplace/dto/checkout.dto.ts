import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

// Cash on Delivery was switched off (2026-10, owner decision): new orders are paid by UPI and
// verified before packing. Older COD orders still exist and are handled as before.
export const PAYMENT_METHODS = ['UPI'] as const;
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

import { Prisma, StockMovementType } from '@prisma/client';

// The two ways stock moves, written as single atomic database statements so that no two orders
// (or an order and an edit) can ever act on a stale number:
//   - takeStock only succeeds while enough is on hand, and says so by returning null;
//   - giveStock always succeeds.
// Both return the new balance. Every call is meant to run inside a transaction, next to the
// StockMovement row that explains it (recordMovement), so the ledger and the count cannot drift.

export async function takeStock(tx: Prisma.TransactionClient, productId: string, quantity: number): Promise<number | null> {
  const rows = await tx.$queryRaw<{ stockQuantity: number }[]>`
    UPDATE "Product"
    SET "stockQuantity" = "stockQuantity" - ${quantity}, "updatedAt" = NOW()
    WHERE "id" = ${productId} AND "stockQuantity" >= ${quantity}
    RETURNING "stockQuantity"`;
  return rows.length ? rows[0].stockQuantity : null;
}

export async function giveStock(tx: Prisma.TransactionClient, productId: string, quantity: number): Promise<number> {
  const rows = await tx.$queryRaw<{ stockQuantity: number }[]>`
    UPDATE "Product"
    SET "stockQuantity" = "stockQuantity" + ${quantity}, "updatedAt" = NOW()
    WHERE "id" = ${productId}
    RETURNING "stockQuantity"`;
  return rows[0].stockQuantity;
}

export function recordMovement(
  tx: Prisma.TransactionClient,
  m: { productId: string; type: StockMovementType; quantityChange: number; balanceAfter: number; reason?: string | null; orderId?: string | null; actorId?: string | null },
) {
  return tx.stockMovement.create({
    data: {
      productId: m.productId,
      type: m.type,
      quantityChange: m.quantityChange,
      balanceAfter: m.balanceAfter,
      reason: m.reason ?? null,
      orderId: m.orderId ?? null,
      actorId: m.actorId ?? null,
    },
  });
}

// Money is kept to whole paise: 3 x 19.99 must be 59.97, not 59.970000000000006.
export const roundMoney = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

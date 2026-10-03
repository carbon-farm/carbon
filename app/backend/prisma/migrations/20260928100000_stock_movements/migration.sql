-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('INITIAL', 'SALE', 'CANCEL_RESTOCK', 'ADD', 'REDUCE', 'SET');

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "orderId" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockMovement_productId_createdAt_idx" ON "StockMovement"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Data: every product starts its ledger with an opening balance equal to today's stock, so the
-- history always adds up to the live count.
INSERT INTO "StockMovement" ("id", "productId", "type", "quantityChange", "balanceAfter", "reason")
SELECT gen_random_uuid()::text, "id", 'INITIAL', "stockQuantity", "stockQuantity", 'Opening balance when stock history began'
FROM "Product";

-- CreateTable
CREATE TABLE "StockWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockWatch_productId_idx" ON "StockWatch"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "StockWatch_userId_productId_key" ON "StockWatch"("userId", "productId");

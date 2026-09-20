-- AlterTable
ALTER TABLE "HariharaaPayment" ADD COLUMN     "planId" TEXT,
ADD COLUMN     "planName" TEXT;

-- AlterTable
ALTER TABLE "HariharaaSettings" ADD COLUMN     "membershipRequired" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTe" TEXT,
    "description" TEXT,
    "priceInr" DOUBLE PRECISION NOT NULL,
    "periodDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- AddForeignKey
ALTER TABLE "HariharaaPayment" ADD CONSTRAINT "HariharaaPayment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Data: today's single price becomes the first plan ("Monthly", 30 days), and the payments
-- made so far are tagged with it.
INSERT INTO "SubscriptionPlan" ("id", "name", "nameTe", "priceInr", "periodDays", "isActive", "sortOrder", "updatedAt")
SELECT gen_random_uuid()::text, 'Monthly', 'నెలవారీ', "subscriptionPriceInr", 30, true, 1, CURRENT_TIMESTAMP
FROM "HariharaaSettings" LIMIT 1;

UPDATE "HariharaaPayment"
SET "planId" = (SELECT "id" FROM "SubscriptionPlan" WHERE "name" = 'Monthly' LIMIT 1), "planName" = 'Monthly'
WHERE "planId" IS NULL AND EXISTS (SELECT 1 FROM "SubscriptionPlan" WHERE "name" = 'Monthly');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'CLAIMED', 'PAID', 'REJECTED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentClaimedAt" TIMESTAMP(3),
ADD COLUMN     "paymentRejectionReason" TEXT,
ADD COLUMN     "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "paymentUtr" TEXT,
ADD COLUMN     "paymentVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "paymentVerifiedBy" TEXT,
ADD COLUMN     "shippingAddress" JSONB;

-- AlterTable
ALTER TABLE "ProductCategoryMaster" ADD COLUMN     "nameTe" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "email" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentUtr_key" ON "Order"("paymentUtr");

-- CreateIndex
CREATE INDEX "ProductCategoryMaster_parentId_idx" ON "ProductCategoryMaster"("parentId");

-- AddForeignKey
ALTER TABLE "ProductCategoryMaster" ADD CONSTRAINT "ProductCategoryMaster_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategoryMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Data: arrange the existing flat categories into the Department -> Category tree.
INSERT INTO "ProductCategoryMaster" ("id", "name", "nameTe", "sortOrder", "isActive")
VALUES
  (gen_random_uuid()::text, 'Farm Inputs', 'వ్యవసాయ ఇన్‌పుట్లు', 1, true),
  (gen_random_uuid()::text, 'Natural Foods', 'సహజ ఆహారాలు', 2, true);

UPDATE "ProductCategoryMaster" SET "parentId" = (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Farm Inputs'),
  "nameTe" = 'గ్రోత్ ప్రమోటర్స్' WHERE "name" = 'Growth Promoters';
UPDATE "ProductCategoryMaster" SET "parentId" = (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Farm Inputs'),
  "nameTe" = 'బయో స్టిమ్యులెంట్స్ & ప్రొటెక్టెంట్స్' WHERE "name" = 'Bio Stimulants & Protectants';
UPDATE "ProductCategoryMaster" SET "parentId" = (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Farm Inputs'),
  "nameTe" = 'సూక్ష్మపోషకాలు' WHERE "name" = 'Micronutrients';

INSERT INTO "ProductCategoryMaster" ("id", "name", "nameTe", "parentId", "sortOrder", "isActive")
SELECT gen_random_uuid()::text, v.name, v.name_te, (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Natural Foods'), v.ord, true
FROM (VALUES
  ('Oils', 'నూనెలు', 1),
  ('Honey & Sweeteners', 'తేనె & తీపి పదార్థాలు', 2),
  ('Flours & Millets', 'పిండులు & చిరుధాన్యాలు', 3)
) AS v(name, name_te, ord);

UPDATE "Product" SET "categoryId" = (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Oils') WHERE "name" = 'Cold-Pressed Groundnut Oil' AND "categoryId" IS NULL;
UPDATE "Product" SET "categoryId" = (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Honey & Sweeteners') WHERE "name" = 'Raw Forest Honey' AND "categoryId" IS NULL;
UPDATE "Product" SET "categoryId" = (SELECT "id" FROM "ProductCategoryMaster" WHERE "name" = 'Flours & Millets') WHERE "name" = 'Organic Millet Flour' AND "categoryId" IS NULL;

-- Data: orders already delivered were paid (cash collected).
UPDATE "Order" SET "paymentStatus" = 'PAID' WHERE "status" = 'DELIVERED';

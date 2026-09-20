-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI_MANUAL', 'GATEWAY');

-- CreateEnum
CREATE TYPE "HariharaaPaymentStatus" AS ENUM ('CREATED', 'CLAIMED', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userCode" TEXT;

-- CreateTable
CREATE TABLE "UserCodeCounter" (
    "prefix" TEXT NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserCodeCounter_pkey" PRIMARY KEY ("prefix")
);

-- CreateTable
CREATE TABLE "HariharaaPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountInr" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'UPI_MANUAL',
    "status" "HariharaaPaymentStatus" NOT NULL DEFAULT 'CREATED',
    "utr" TEXT,
    "rejectedUtr" TEXT,
    "providerRef" TEXT,
    "note" TEXT,
    "periodDays" INTEGER NOT NULL DEFAULT 30,
    "claimedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedByUserId" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HariharaaPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HariharaaPayment_utr_key" ON "HariharaaPayment"("utr");

-- CreateIndex
CREATE UNIQUE INDEX "HariharaaPayment_providerRef_key" ON "HariharaaPayment"("providerRef");

-- CreateIndex
CREATE INDEX "HariharaaPayment_userId_idx" ON "HariharaaPayment"("userId");

-- CreateIndex
CREATE INDEX "HariharaaPayment_status_idx" ON "HariharaaPayment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_userCode_key" ON "User"("userCode");

-- AddForeignKey
ALTER TABLE "HariharaaPayment" ADD CONSTRAINT "HariharaaPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HariharaaPayment" ADD CONSTRAINT "HariharaaPayment_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Backfill: give every existing user a code, numbered per role in the order they joined.
-- Re-runnable: only touches users without a code and continues from the counter.
WITH letters(role, letter) AS (
  VALUES ('FARMER','F'), ('EXPERT','E'), ('MODERATOR','M'), ('ADMINISTRATOR','A'),
         ('VENDOR','V'), ('SUPPORT_AGENT','S'), ('CUSTOMER','C')
),
numbered AS (
  SELECT u.id, l.letter,
         COALESCE((SELECT "lastValue" FROM "UserCodeCounter" WHERE prefix = 'HH' || l.letter), 0)
           + row_number() OVER (PARTITION BY u.role ORDER BY u."createdAt", u.id) AS n
  FROM "User" u
  JOIN letters l ON l.role = u.role::text
  WHERE u."userCode" IS NULL
)
UPDATE "User" u
SET "userCode" = 'HH' || numbered.letter || '-' || lpad(numbered.n::text, 4, '0')
FROM numbered
WHERE u.id = numbered.id;

INSERT INTO "UserCodeCounter" (prefix, "lastValue")
SELECT 'HH' || l.letter, COALESCE(MAX(substring(u."userCode" from '[0-9]+$')::int), 0)
FROM (VALUES ('FARMER','F'), ('EXPERT','E'), ('MODERATOR','M'), ('ADMINISTRATOR','A'),
             ('VENDOR','V'), ('SUPPORT_AGENT','S'), ('CUSTOMER','C')) AS l(role, letter)
LEFT JOIN "User" u ON u.role::text = l.role
GROUP BY l.letter
ON CONFLICT (prefix) DO UPDATE
SET "lastValue" = GREATEST("UserCodeCounter"."lastValue", EXCLUDED."lastValue");

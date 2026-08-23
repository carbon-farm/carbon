-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('PENDING', 'SENT');

-- CreateEnum
CREATE TYPE "HariharaaSubscriptionStatus" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CUSTOMER';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "dispatchStatus" "DispatchStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "HariharaaSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "HariharaaSubscriptionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "paymentReference" TEXT,
    "note" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "activeUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HariharaaSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HariharaaSettings" (
    "id" TEXT NOT NULL,
    "subscriptionPriceInr" DOUBLE PRECISION NOT NULL,
    "payeeName" TEXT NOT NULL DEFAULT 'HARIHARAA Natural Food Stores',
    "primaryUpiId" TEXT NOT NULL,
    "secondaryUpiId" TEXT,
    "vendorProfileId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HariharaaSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HariharaaSubscription_userId_key" ON "HariharaaSubscription"("userId");

-- CreateIndex
CREATE INDEX "HariharaaSubscription_status_idx" ON "HariharaaSubscription"("status");

-- AddForeignKey
ALTER TABLE "HariharaaSubscription" ADD CONSTRAINT "HariharaaSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HariharaaSubscription" ADD CONSTRAINT "HariharaaSubscription_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HariharaaSettings" ADD CONSTRAINT "HariharaaSettings_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HariharaaSettings" ADD CONSTRAINT "HariharaaSettings_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

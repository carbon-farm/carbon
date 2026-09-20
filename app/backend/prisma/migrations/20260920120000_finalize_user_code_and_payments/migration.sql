-- DropForeignKey
ALTER TABLE "HariharaaSubscription" DROP CONSTRAINT "HariharaaSubscription_reviewedByUserId_fkey";

-- DropIndex
DROP INDEX "HariharaaSubscription_status_idx";

-- AlterTable
ALTER TABLE "HariharaaSubscription" DROP COLUMN "expectedAmountInr",
DROP COLUMN "note",
DROP COLUMN "paymentReference",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedByUserId",
DROP COLUMN "status",
DROP COLUMN "submittedAt";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userCode" SET NOT NULL;

-- DropEnum
DROP TYPE "HariharaaSubscriptionStatus";


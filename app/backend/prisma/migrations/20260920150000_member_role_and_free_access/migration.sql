-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MEMBER';

-- AlterTable
ALTER TABLE "HariharaaSubscription" ADD COLUMN     "complimentaryGrantedAt" TIMESTAMP(3),
ADD COLUMN     "complimentaryGrantedBy" TEXT,
ADD COLUMN     "complimentaryNote" TEXT,
ADD COLUMN     "complimentaryUntil" TIMESTAMP(3);


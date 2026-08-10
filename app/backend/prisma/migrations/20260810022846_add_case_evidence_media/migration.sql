-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "evidenceMediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

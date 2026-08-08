-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'EXPERT_WORKING', 'WAITING_FARMER', 'ANSWERED', 'FARMER_CONFIRMED', 'REOPENED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClosureReason" AS ENUM ('RESOLVED', 'ABANDONED');

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "problemDescription" TEXT NOT NULL,
    "evidenceNotes" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'DRAFT',
    "closureReason" "ClosureReason",
    "assignedExpertId" TEXT,
    "isPriority" BOOLEAN NOT NULL DEFAULT false,
    "priorityConfirmedBy" TEXT,
    "followUpQuestion" TEXT,
    "followUpResponse" TEXT,
    "resolutionNotes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_farmerId_idx" ON "Case"("farmerId");

-- CreateIndex
CREATE INDEX "Case_assignedExpertId_idx" ON "Case"("assignedExpertId");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CaseCategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_assignedExpertId_fkey" FOREIGN KEY ("assignedExpertId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
